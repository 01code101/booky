from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone

# Create your models here.
class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey()
    
    class Meta:
        unique_together = [['user', 'object_id', 'content_type']]
        

class WishList(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique= True)
    
class WishItem(models.Model):
    wishlist = models.ForeignKey(WishList, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey()
    

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment_text = models.TextField()
    
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey()
    
    created_at = models.DateTimeField(default=timezone.now)
    
    def can_post_comment(self):
        time_diff = timezone.now() - self.created_at
        return time_diff.total_seconds() >= 3600  # 1 hour = 3600 seconds
        