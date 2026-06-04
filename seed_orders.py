import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greatkart.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from accounts.models import Account
from orders.models import Order, OrderItem
from store.models import Product
import random

# Get all users
users = list(Account.objects.all())
products = list(Product.objects.filter(is_available=True))

if not users:
    print("❌ No users found! Create a user first.")
    sys.exit()

if len(products) < 5:
    print("❌ Not enough products. Add more products first.")
    sys.exit()

print(f"Found {len(users)} users and {len(products)} products")

# Create sample orders
orders_created = 0

for user in users:
    # Each user gets 2-4 orders
    num_orders = random.randint(2, 4)
    
    for _ in range(num_orders):
        # Pick 1-4 random products per order
        num_items = random.randint(1, 4)
        order_products = random.sample(products, min(num_items, len(products)))
        
        total = 0
        items_data = []
        
        for product in order_products:
            qty = random.randint(1, 3)
            total += product.price * qty
            items_data.append({
                "product": product,
                "product_name": product.product_name,
                "product_price": product.price,
                "quantity": qty,
                "variations": [{"color": "black", "size": "M"}],
            })
        
        # Create order
        status = random.choice(['paid', 'shipped', 'delivered', 'delivered', 'delivered'])
        order = Order.objects.create(
            user=user,
            shipping_address={
                "full_name": f"{user.first_name} {user.last_name}",
                "address_line1": "123 Main Street",
                "city": "Delhi",
                "state": "DL",
                "postal_code": "110001",
                "phone": user.phone_number or "9876543210",
            },
            payment_info={
                "payment_intent_id": f"pi_test_{random.randint(100000, 999999)}",
                "method": "card",
            },
            status=status,
            total=total,
        )
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        orders_created += 1
        print(f"  ✅ Order {order.order_number} — {len(items_data)} items — ₹{total} ({status})")

print(f"\n🎉 Done! Created {orders_created} orders.")
print(f"Total orders in DB: {Order.objects.count()}")
print(f"Total order items in DB: {OrderItem.objects.count()}")
