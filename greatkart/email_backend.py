"""
Custom email backend that disables SSL certificate verification.
WARNING: Use only for development! Not for production.
"""
import ssl
from django.core.mail.backends.smtp import EmailBackend as SMTPBackend


class CustomEmailBackend(SMTPBackend):
    """
    Custom SMTP backend that bypasses SSL certificate verification.
    This fixes the SSL: CERTIFICATE_VERIFY_FAILED error on Windows.
    """
    
    def open(self):
        """
        Override the open method to disable SSL verification.
        """
        if self.connection:
            return False
        
        connection_params = {
            'timeout': self.timeout,
        }
        
        if self.use_ssl:
            # Create unverified SSL context
            connection_params['context'] = ssl._create_unverified_context()
        
        try:
            self.connection = self.connection_class(
                self.host, self.port, **connection_params
            )
            
            # TLS/STARTTLS
            if self.use_tls:
                self.connection.ehlo()
                self.connection.starttls(context=ssl._create_unverified_context())
                self.connection.ehlo()
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except Exception as e:
            if not self.fail_silently:
                raise
            return False
