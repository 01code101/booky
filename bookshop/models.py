from django.db import models
from django.conf import settings
from uuid import uuid4
from django.contrib.auth import get_user_model
User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=255)
    
    def __str__(self) -> str:
        return self.name
    
class Author(models.Model):
    f_name = models.CharField(max_length=255)
    l_name = models.CharField(max_length=255)
    birth_date = models.DateField()
    
    def __str__(self) -> str:
        return f'{self.f_name} {self.l_name}'
    
    @property
    def full_name(self):
         return f'{self.f_name} {self.l_name}'
    
class Publisher(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    
    def __str__(self) -> str:
        return self.name
    
class Book(models.Model):
    title = models.CharField(max_length=255, unique=True)
    price = models.DecimalField(max_digits=9, decimal_places=2)
    main_img  = models.ImageField(upload_to='images/')  
    quantity = models.PositiveSmallIntegerField()
    pub_date = models.DateField()
    author = models.ForeignKey(Author, on_delete=models.PROTECT)
    publisher = models.ForeignKey(Publisher, on_delete=models.PROTECT)
    Category = models.ForeignKey(Category, on_delete=models.PROTECT)
    isbn = models.CharField(max_length=100, unique=True)
    summary = models.TextField(null=True)
    
    def __str__(self) -> str:
        return self.title
    
class Cart(models.Model):
    # GUID: Globaly Unique Identifier
    id = models.UUIDField(primary_key=True, default=uuid4)
    created_date = models.DateTimeField(auto_now_add=True)
    
class CartItem(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')     
    quantity = models.PositiveSmallIntegerField()
    price = models.DecimalField(max_digits=9, decimal_places=2)
    
    class Meta:
        unique_together = [['cart', 'book']]
    
    
class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    birth_date = models.DateField(null=True)
    phone_number = models.CharField(max_length=20, null=True)
    level = models.ForeignKey('Level', on_delete=models.PROTECT, default=3)
    
class Address(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    address_line1 = models.CharField(max_length=600, default='null')
    zipcode = models.CharField(max_length=20, default='null')
    city = models.ForeignKey('City', on_delete=models.PROTECT, default= 4)
    
    
class City(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self) -> str:
        return self.name


class Level(models.Model):
    level_name = models.CharField(max_length=20, unique=True)
    

class  Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('WF', 'منتظر پرداخت'),
        ('P', 'Pending'),
        ('Cl', 'لغو سفارش'),
        ('C', 'کامل'),
        ('F', 'Failed')
    ]
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT)
    created_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=2, choices=ORDER_STATUS_CHOICES, default='P')
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)    
    address = models.ForeignKey(Address, on_delete=models.PROTECT, null=True)
    
class OrderItem(models.Model):
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    quantity = models.SmallIntegerField()
    price = models.DecimalField(max_digits=9, decimal_places=2)
    
    class Meta:
         unique_together = [['order', 'book']]
    
    
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('CC', 'Credit Card'),
        ('CA', 'Cash'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('P', 'Pending'),
        ('C', 'Completed'),
        ('F', 'Failed'),
    ]
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    payment_method = models.CharField(max_length=2, choices=PAYMENT_METHOD_CHOICES)
    amount_paid = models.DecimalField(max_digits=6, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=1, choices=PAYMENT_STATUS_CHOICES, default='P')
    

    
