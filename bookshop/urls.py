from django.urls import path
from . import views 



app_name = 'bookshop'

urlpatterns = [
    path('', views.home_page, name='home'),
    path('books/', views.books_view),
    path('book/<int:pk>/', views.book_detail, name='book_detail'),
    path('book/<int:pk>/likes/', views.book_likes_view, name='book_like'),
    path('book/<int:pk>/wish/', views.book_wish_view, name='book_wishlist'),
    path('book/<int:pk>/comments/', views.book_comments_view, name='book_comments'),
    
    path('carts/', views.cart_view, name='carts'),
    path('cart/<uuid>', views.cart_detail_view, name='cart_detail'),
    path('carts/<uuid>/items/', views.cartitems_view, name='items'),
    
    path('order/<int:pk>/items/', views.orderitems_view, name='order_detail'),
    path('factor/order/<int:pk>/', views.factor_view, name='factor'),
    
    path('user/', views.user_view),
    path('customer/', views.customer_view, name='customer'),
    path('customer/<int:pk>/order/', views.customer_order_view, name='order'),
    path('address/<int:pk>/', views.address_view),
    
    
    path('dashboard/', views.dashborad_view, name='dashborad'),
    
    
    # authentication urls
    path('logout', views.logout_view, name='logout'),
    path('login', views.login_page, name='login'),
    path('signup', views.signup_page, name='signup'),
    path('check/user/', views.check_user_auth, name='check_user'),
] 