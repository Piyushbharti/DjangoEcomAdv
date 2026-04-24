from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
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