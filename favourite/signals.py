from .models import WishList
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


@receiver(post_save, sender= settings.AUTH_USER_MODEL)
def create_wishlist_for_new_user(sender, **kwargs):
    if kwargs['created']:
        WishList.objects.create(user = kwargs['instance'])