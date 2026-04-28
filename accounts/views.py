from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import  IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework_simplejwt.authentication import JWTAuthentication
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
    new_password = request.new_password
    old_password = request.old_password
    serialize = AccountSerializer(user, data = request.data, partial=True)
    if serialize.is_valid():
        # serialize.save()
        print(serialize.data)
    return Response({"msg" : "success"})