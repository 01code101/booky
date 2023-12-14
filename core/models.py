from django.db import models
from django.contrib.auth.models import AbstractUser


# extending Abstractuser class
class User(AbstractUser):
    email = models.EmailField(unique=True)

