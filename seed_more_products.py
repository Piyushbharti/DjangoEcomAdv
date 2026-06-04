import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greatkart.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from store.models import Product, Variation
from category.models import Category

cats = {c.slug: c for c in Category.objects.all()}

products_data = [
    {
        "product_name": "Navy Blue Polo Tshirt",
        "slug": "navy-blue-polo-tshirt",
        "description": "Classic navy blue polo t-shirt with embroidered logo. Soft cotton pique fabric.",
        "price": 899,
        "image_url": "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400",
        "stock": 40,
        "category": cats.get("tshirts") or cats.get("t-shirt"),
    },
    {
        "product_name": "Striped Casual Tshirt",
        "slug": "striped-casual-tshirt",
        "description": "Comfortable striped t-shirt for casual everyday wear.",
        "price": 649,
        "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400",
        "stock": 55,
        "category": cats.get("tshirts") or cats.get("t-shirt"),
    },
    {
        "product_name": "Ripped Skinny Jeans",
        "slug": "ripped-skinny-jeans",
        "description": "Trendy ripped skinny jeans with stretch denim for ultimate comfort.",
        "price": 1799,
        "image_url": "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400",
        "stock": 18,
        "category": cats.get("jeans"),
    },
    {
        "product_name": "Classic Straight Jeans",
        "slug": "classic-straight-jeans",
        "description": "Timeless straight-fit jeans in medium wash. Perfect for any occasion.",
        "price": 1399,
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        "stock": 30,
        "category": cats.get("jeans"),
    },
    {
        "product_name": "Canvas Slip-On Shoes",
        "slug": "canvas-slip-on-shoes",
        "description": "Lightweight canvas slip-on shoes. Easy to wear, perfect for summer.",
        "price": 1299,
        "image_url": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",
        "stock": 35,
        "category": cats.get("shoes"),
    },
    {
        "product_name": "High Top Sneakers",
        "slug": "high-top-sneakers",
        "description": "Urban style high-top sneakers with cushioned sole and ankle support.",
        "price": 4299,
        "image_url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
        "stock": 20,
        "category": cats.get("shoes"),
    },
    {
        "product_name": "Windbreaker Jacket",
        "slug": "windbreaker-jacket",
        "description": "Lightweight windbreaker jacket. Water-resistant with hood. Great for travel.",
        "price": 2499,
        "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
        "stock": 25,
        "category": cats.get("jacket"),
    },
    {
        "product_name": "Leather Biker Jacket",
        "slug": "leather-biker-jacket",
        "description": "Premium faux leather biker jacket with zipper details.",
        "price": 4999,
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
        "stock": 12,
        "category": cats.get("jacket"),
    },
    {
        "product_name": "Linen Summer Shirt",
        "slug": "linen-summer-shirt",
        "description": "Breathable linen shirt perfect for hot summer days. Relaxed fit.",
        "price": 1099,
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
        "stock": 32,
        "category": cats.get("shirts") or cats.get("shirt"),
    },
    {
        "product_name": "Denim Button Shirt",
        "slug": "denim-button-shirt",
        "description": "Classic denim shirt with button-down collar. Versatile layering piece.",
        "price": 1399,
        "image_url": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=400",
        "stock": 27,
        "category": cats.get("shirts") or cats.get("shirt"),
    },
    {
        "product_name": "Aviator Sunglasses",
        "slug": "aviator-sunglasses",
        "description": "Classic aviator sunglasses with UV400 protection. Gold metal frame.",
        "price": 999,
        "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
        "stock": 70,
        "category": cats.get("accessories"),
    },
    {
        "product_name": "Canvas Backpack",
        "slug": "canvas-backpack",
        "description": "Durable canvas backpack with laptop compartment. Perfect for daily use.",
        "price": 1499,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        "stock": 38,
        "category": cats.get("accessories"),
    },
    {
        "product_name": "Minimalist Analog Watch",
        "slug": "minimalist-analog-watch",
        "description": "Elegant minimalist watch with leather strap. Japanese quartz movement.",
        "price": 2799,
        "image_url": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
        "stock": 25,
        "category": cats.get("accessories"),
    },
    {
        "product_name": "Gym Training Shoes",
        "slug": "gym-training-shoes",
        "description": "Cross-training shoes designed for gym workouts. Stable base for lifting.",
        "price": 3999,
        "image_url": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        "stock": 22,
        "category": cats.get("shoes"),
    },
    {
        "product_name": "Oversized Hoodie",
        "slug": "oversized-hoodie",
        "description": "Cozy oversized hoodie in premium cotton fleece. Kangaroo pocket.",
        "price": 1799,
        "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
        "stock": 45,
        "category": cats.get("jacket"),
    },
]

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
        # Add variations
        for color in ["black", "white", "navy"]:
            Variation.objects.get_or_create(
                product=product, variation_category="color", variation_value=color,
                defaults={"is_active": True}
            )
        if product.category.slug not in ["accessories"]:
            for size in ["S", "M", "L", "XL"]:
                Variation.objects.get_or_create(
                    product=product, variation_category="size", variation_value=size,
                    defaults={"is_active": True}
                )
    else:
        print(f"  ⏭️  Already exists: {product.product_name}")

print(f"\n🎉 Done! Created {created_count} new products.")
print(f"Total products in DB: {Product.objects.count()}")
