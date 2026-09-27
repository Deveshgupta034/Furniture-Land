from django.test import TestCase, Client
from django.urls import reverse
from store.models import Product, Customer, Order, OrderItem, ShippingAddress, Category
from django.contrib.auth.hashers import make_password

class StoreTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(name="Sofa")
        self.product = Product.objects.create(
            name="Sorensen Sculptural Armchair",
            price=1280.00,
            desc="High-grade tactile bouclé armchair with solid oak frame.",
            category=self.category
        )
        self.customer = Customer.objects.create(
            name="Evelyn Vance",
            username="evelynv",
            email="evelyn@domain.com",
            password=make_password("Secret1234")
        )

    def test_store_view(self):
        response = self.client.get(reverse('store'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Sorensen Sculptural Armchair")
        self.assertContains(response, "Crafted for")

    def test_product_detail_view(self):
        response = self.client.get(reverse('product_view', args=[self.product.name]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Sorensen Sculptural Armchair")
        self.assertContains(response, "Living Atelier")
        self.assertContains(response, "Sand Bouclé")

    def test_cart_view(self):
        response = self.client.get(reverse('cart'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Shopping Bag")

    def test_checkout_view(self):
        response = self.client.get(reverse('checkout'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Secure Checkout")

    def test_category_views(self):
        categories = ['sofa', 'dining_table', 'decor', 'kids']
        for cat in categories:
            response = self.client.get(reverse(cat))
            self.assertEqual(response.status_code, 200)

    def test_search_view(self):
        response = self.client.post(reverse('search'), {'search': 'Sculptural'})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Sorensen Sculptural Armchair")
