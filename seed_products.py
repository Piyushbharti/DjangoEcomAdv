"""
Run this script to add sample products to the database.
Usage: python manage.py shell < seed_products.py
Or: python seed_products.py (from greatkart/ folder)
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greatkart.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from store.models import Product, Variation
from category.models import Category

# First, check existing categories
print("Existing categories:")
for c in Category.objects.all():
    print(f"  ID={c.id}, Name={c.category_name}, Slug={c.slug}")

# Create categories if they don't exist
categories_data = [
    {"category_name": "Tshirts", "slug": "tshirts", "description": "T-Shirts collection"},
    {"category_name": "Shirts", "slug": "shirts", "description": "Formal and casual shirts"},
    {"category_name": "Jeans", "slug": "jeans", "description": "Denim jeans collection"},
    {"category_name": "Shoes", "slug": "shoes", "description": "Footwear collection"},
    {"category_name": "Jacket", "slug": "jacket", "description": "Jackets and outerwear"},
    {"category_name": "Accessories", "slug": "accessories", "description": "Watches, belts, etc"},
]

for cat_data in categories_data:
    cat, created = Category.objects.get_or_create(
        slug=cat_data["slug"],
        defaults=cat_data
    )
    if created:
        print(f"  Created category: {cat.category_name}")

# Refresh categories
cats = {c.slug: c for c in Category.objects.all()}

# Products data - using existing images where possible
products_data = [
    {
        "product_name": "Classic White Tshirt",
        "slug": "classic-white-tshirt",
        "description": "Premium cotton white t-shirt, comfortable fit for everyday wear.",
        "price": 599,
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        "stock": 50,
        "category": cats.get("tshirts"),
    },
    {
        "product_name": "Black Graphic Tshirt",
        "slug": "black-graphic-tshirt",
        "description": "Stylish black t-shirt with modern graphic print.",
        "price": 799,
        "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400",
        "stock": 30,
        "category": cats.get("tshirts"),
    },
    {
        "product_name": "Slim Fit Blue Jeans",
        "slug": "slim-fit-blue-jeans",
        "description": "Stretchable slim fit denim jeans in classic blue wash.",
        "price": 1499,
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        "stock": 25,
        "category": cats.get("jeans"),
    },
    {
        "product_name": "Relaxed Fit Black Jeans",
        "slug": "relaxed-fit-black-jeans",
        "description": "Comfortable relaxed fit jeans in jet black color.",
        "price": 1299,
        "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
        "stock": 20,
        "category": cats.get("jeans"),
    },
    {
        "product_name": "Jordan Basketball Shoes",
        "slug": "jordan-basketball-shoes",
        "description": "High-performance basketball shoes with excellent grip and cushioning.",
        "price": 8999,
        "image_url": "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400",
        "stock": 15,
        "category": cats.get("shoes"),
    },
    {
        "product_name": "Running Sneakers Pro",
        "slug": "running-sneakers-pro",
        "description": "Lightweight running shoes with breathable mesh upper.",
        "price": 3499,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        "stock": 40,
        "category": cats.get("shoes"),
    },
    {
        "product_name": "US Polo Bomber Jacket",
        "slug": "us-polo-bomber-jacket",
        "description": "Premium bomber jacket with warm fleece lining.",
        "price": 2999,
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
        "stock": 18,
        "category": cats.get("jacket"),
    },
    {
        "product_name": "Denim Casual Jacket",
        "slug": "denim-casual-jacket",
        "description": "Classic denim jacket for a rugged casual look.",
        "price": 1999,
        "image_url": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400",
        "stock": 22,
        "category": cats.get("jacket"),
    },
    {
        "product_name": "Formal Oxford Shirt",
        "slug": "formal-oxford-shirt",
        "description": "Crisp cotton oxford shirt perfect for office and formal occasions.",
        "price": 1199,
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
        "stock": 35,
        "category": cats.get("shirts"),
    },
    {
        "product_name": "Casual Checked Shirt",
        "slug": "casual-checked-shirt",
        "description": "Relaxed fit checked shirt for weekend outings.",
        "price": 899,
        "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
        "stock": 28,
        "category": cats.get("shirts"),
    },
    {
        "product_name": "Leather Belt Premium",
        "slug": "leather-belt-premium",
        "description": "Genuine leather belt with classic silver buckle.",
        "price": 699,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        "stock": 60,
        "category": cats.get("accessories"),
    },
    {
        "product_name": "Digital Sports Watch",
        "slug": "digital-sports-watch",
        "description": "Water-resistant digital watch with multiple sport modes.",
        "price": 1999,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        "stock": 45,
        "category": cats.get("accessories"),
    },
]

# Create products
created_count = 0
for p_data in products_data:
    if p_data["category"] is None:
        print(f"  Skipped {p_data['product_name']} — category not found")
        continue
    product, created = Product.objects.get_or_create(
        slug=p_data["slug"],
        defaults=p_data
    )
    if created:
        created_count += 1
        print(f"  ✅ Created: {product.product_name} (₹{product.price})")
    else:
        print(f"  ⏭️  Already exists: {product.product_name}")

# Add variations to new products
print("\nAdding variations...")
all_products = Product.objects.all()
color_options = ["black", "white", "blue", "red", "grey"]
size_options = ["S", "M", "L", "XL"]

for product in all_products:
    # Add colors
    for color in color_options[:3]:  # 3 colors per product
        Variation.objects.get_or_create(
            product=product,
            variation_category="color",
            variation_value=color,
            defaults={"is_active": True}
        )
    # Add sizes (not for accessories)
    if product.category.slug not in ["accessories"]:
        for size in size_options:
            Variation.objects.get_or_create(
                product=product,
                variation_category="size",
                variation_value=size,
                defaults={"is_active": True}
            )

print(f"\n🎉 Done! Created {created_count} new products.")
print(f"Total products in DB: {Product.objects.count()}")
