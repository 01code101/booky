from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


class EmailOrUsernameModelBackend(ModelBackend):
    """
    This is a ModelBacked that allows authentication
    with either a username or an email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # **first solution
        UserModel = get_user_model()

        try:
            print('im here')
            user = UserModel.objects.get(Q(username__iexact=username) | Q(email__iexact=username))

            if user.check_password(password):
                return user
        except UserModel.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a non-existing user (#20760).
            UserModel().set_password(password)
            
        # **second solution
        # if '@' in username:
        #     kwargs = {'email': username}
        # else:
        #     kwargs = {'username': username}
        # try:
        #     user = get_user_model().objects.get(**kwargs)
        #     if user.check_password(password):
        #         return user
        # except get_user_model().DoesNotExist:
        #     return None
            
            
    def get_user(self, username_id):
        try:
            return get_user_model().objects.get(pk=username_id)
        except get_user_model().DoesNotExist:
            return None