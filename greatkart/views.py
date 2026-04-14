from django.shortcuts import render
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from store.models import Product

def home(request):
    products = Product.objects.all().filter(is_available = True)
    return render()

@csrf_exempt
def temp_api_rate_limited(request):
    """
    A temporary API to demonstrate a Fixed Window Rate Limiter.
    Limits each IP address to 5 requests per 60 seconds.
    """
    # 1. Identify the user (using IP address)
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR', 'unknown')
        
    # 2. Create a unique cache key for this user
    cache_key = f"rate_limit_{ip}"
    
    # 3. Check the number of requests made by this IP 
    # Default is 0 if no requests have been made yet
    request_count = cache.get(cache_key, 0)
    
    # 4. Enforce the limit (e.g., max 5 requests)
    if request_count >= 5:
        return JsonResponse({
            "error": "Too Many Requests", 
            "message": "Rate limit exceeded. Please try again after 60 seconds."
        }, status=429)
        
    # 5. Update the request count
    if request_count == 0:
        # First request: Set the count to 1 and start the 60-second window
        cache.set(cache_key, 1, timeout=60)
    else:
        # Subsequent requests: Increment the count
        cache.incr(cache_key)
        
    # 6. Process the valid request
    return JsonResponse({
        "success": True, 
        "message": "API request successful!",
        "requests_made": request_count + 1,
        "requests_remaining": 5 - (request_count + 1)
    })