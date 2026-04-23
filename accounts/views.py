from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializer import RegisterSerializer, AccountSerializer


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
