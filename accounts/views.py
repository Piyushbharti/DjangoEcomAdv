from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import  IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.mail import send_mail
from django.conf import settings
import random

from .serializer import RegisterSerializer, AccountSerializer, LoginSerializer


# ============================================
# POST: Register new user
# URL: /accounts/register/
# ============================================
@api_view(['POST'])
def register(request):
    """
    Naya user register karta hai.
    
    Frontend bhejega:
    {
        "first_name": "Rahul",
        "last_name": "Kumar",
        "username": "rahul123",
        "email": "rahul@gmail.com",
        "phone_number": "9876543210",
        "password": "mypassword"
    }
    
    Response mein milega:
    - User info
    - Access token (30 min valid)
    - Refresh token (7 days valid)
    """
    
    # Step 1: Data validate karo
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        # Step 2: User banao (password auto hash hoga)
        user = serializer.save()
        
        # Step 3: JWT tokens generate karo
        refresh = RefreshToken.for_user(user)
        
        # Step 4: Response bhejo
        return Response({
            'status': 201,
            'message': 'Account created successfully!',
            'user': AccountSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),   # 30 min valid
                'refresh': str(refresh),                # 7 days valid
            }
        })
    
    # Validation fail → errors bhejo
    return Response({
        'status': 400,
        'errors': serializer.errors
    })


@api_view(['POST'])
def login(request):
    """
    User login — email + password se tokens milenge.
    
    Frontend bhejega:
    {
        "email": "rahul@gmail.com",
        "password": "mypassword"
    }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    print(email, password, "checkkkk")
    if not email or not password:
        return Response({
            'status': 400,
            'message': 'Email and password are required.'
        })
    
    # authenticate() internally:
    # 1. Email se user dhundho
    # 2. Password hash match karo
    # 3. Sahi → user return, galat → None
    user = authenticate(email=email, password=password)
    
    if user is not None:
        # Tokens generate karo
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'status': 200,
            'message': 'Login successful!',
            'user': AccountSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })
    else:
        return Response({
            'status': 401,
            'message': 'Invalid email or password.'
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_user(request):
    return Response({
        'status': 200,
        'user': AccountSerializer(request.user).data
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_user_data(request):
    user = request.user
    serialize = AccountSerializer(user, data=request.data, partial=True)
    if serialize.is_valid():
        serialize.save()
        return Response({
            'status': 200,
            'message': 'Data updated successfully',
            'user': serialize.data
        })
    return Response({
        'status': 400,
        'errors': serialize.errors
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_password(request):
    otp_gen = send_otp_email(request)
    if otp_gen.status == 200:
        return Response({"msg" : "otp sent to registered email"})
    new_password = request.new_password
    old_password = request.old_password
    otp_verify = request.otp
    if otp_gen.otp == otp_verify and new_password == old_password:
        serialize = AccountSerializer(user, data = request.data, partial=True)
        if serialize.is_valid():
            serialize.save()
            print(serialize.data)
        return Response({"msg" : "success"})
    else:
        return Response({"msg": "Unable to send mail"})


# ============================================
# POST: Send OTP Email
# URL: /accounts/send-otp/
# ============================================
@api_view(['POST'])
def send_otp_email(request):
    """
    User ko email pe OTP bhejta hai.
    
    Frontend bhejega:
    {
        "email": "rahul@gmail.com"
    }
    
    Flow:
    1. Email receive karo
    2. Random 6-digit OTP generate karo
    3. send_mail() se email bhejo
    4. OTP return karo (production mein DB mein store karo)
    """
    
    email = request.data.get('email')
    
    if not email:
        return Response({
            'status': 400,
            'message': 'Email is required'
        })
    
    # Generate 6-digit OTP
    otp = random.randint(100000, 999999)
    
    # Send email
    try:
        send_mail(
            subject='Your GreatKart OTP Code',
            message=f'Your OTP code is: {otp}\n\nThis code is valid for 10 minutes.\nDo not share this with anyone.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        # TODO: Production mein OTP ko DB mein store karo with expiry time
        # For now, response mein bhej rahe hain (testing ke liye)
        
        return Response({
            'status': 200,
            'message': f'OTP sent to {email}',
            'otp': otp,  # ← Production mein ye HATANA hai
        })
        
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return Response({
            'status': 500,
            'message': 'Failed to send email. Check email settings.',
            'error': str(e),
        })

