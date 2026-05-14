import stripe
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

stripe.api_key = settings.STRIPE_SECRET_KEY


# ============================================================
#  POST /payments/create-payment-intent/
# ============================================================
@api_view(['POST'])
def create_payment_intent(request):
    """
    Frontend se amount aayega → Stripe ko bhejenge → client_secret milega
    Frontend us client_secret se payment confirm karega
    """
    try:
        amount = request.data.get('amount')  # paisa mein (e.g. $10.50 → 1050)
        
        if not amount:
            return Response({"error": "Amount is required"}, status=400)

        # Stripe PaymentIntent banao
        intent = stripe.PaymentIntent.create(
            amount=int(amount),       # cents/paisa mein (1050 = $10.50)
            currency='usd',
            metadata={
                'user_id': str(request.user.id) if request.user.is_authenticated else 'guest'
            }
        )

        return Response({
            "client_secret": intent.client_secret,  # ← ye frontend ko bhejo
            "payment_intent_id": intent.id,
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ============================================================
#  POST /payments/webhook/
# ============================================================
@csrf_exempt
@api_view(['POST'])
def stripe_webhook(request):
    """
    Stripe khud ye endpoint hit karta hai jab payment succeed/fail hoti hai.
    Ye tumhara "confirmation" hai ki paisa aa gaya.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=400)  # Invalid payload
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)  # Invalid signature

    # Payment successful!
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        print(f"✅ Payment received: {payment_intent['id']} — ${payment_intent['amount']/100}")
        # TODO: Yahan order create karo, cart clear karo, etc.

    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        print(f"❌ Payment failed: {payment_intent['id']}")

    return HttpResponse(status=200)
