from rest_framework import serializers
from .models import Account


# Register ke liye - frontend se data aayega, user banayega
class RegisterSerializer(serializers.ModelSerializer):
    # Password sirf input mein, response mein nahi dikhega
    # password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = ['first_name', 'last_name', 'username', 'email', 'phone_number', 'password']

    def create(self, validated_data):
        # create_user use karo - password hash hoga
        user = Account.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        user.phone_number = validated_data.get('phone_number', '')
        user.is_active = True  # Abhi ke liye direct active
        user.save()
        return user


# Response mein user info bhejne ke liye
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'phone_number']

class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['first_name', 'last_name', 'username', 'email', 'phone_number', 'password']
