from .models import Address, Customer, Order
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


@receiver(post_save, sender= Customer)
def create_two_addresses_for_new_customer(sender, **kwargs):
    if kwargs['created']:
        Address.objects.create(customer = kwargs['instance'])
        Address.objects.create(customer = kwargs['instance'])
        print('2 addresses are created by signal')
        
@receiver(post_save, sender= Customer)
def create_new_customer_user(sender, **kwargs):
    if kwargs['created']:
        Order.objects.create(customer = kwargs['instance'])
        print('order is created by signal')

@receiver(post_save, sender= settings.AUTH_USER_MODEL)
def create_new_customer_user(sender, **kwargs):
    if kwargs['created']:
        Customer.objects.create(user = kwargs['instance'])
        print('customer is created by signal')