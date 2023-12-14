from django import forms
from django.core import validators
from django.core.exceptions import ValidationError
import re


    


class SignupForm(forms.Form):
    username = forms.CharField(max_length=100)
    email = forms.EmailField()
    password = forms.CharField(max_length=100)
    
    def clean_password(self):
        pattern = r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
        if not re.match(pattern, self.cleaned_data['password']):
            raise ValueError("""!!رمز عبور قابل قبول نیست""")
        return self.cleaned_data['password']
        


   
    
