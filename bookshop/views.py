from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.db.models import Value, F, Func, CharField
from django.db import transaction
from django.core.paginator import Paginator
from django.contrib.contenttypes.models import ContentType



from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin


# i extended my user model and below approch couldnt get me a complete ablities of user model
# from core.models import User
# the better way to get the complete ablities form your custom user model is this
from django.contrib.auth import get_user_model, authenticate, login, logout

# get the actual user Model with its basemanager
User = get_user_model()

from .forms import SignupForm
from .models import Category, Book, Cart, CartItem, City, Customer, Order, OrderItem, Address
import json
# IMPORTED from other apps
from favourite.models import Like, WishItem, WishList, Comment
#___________________________________________________
import logging
from colorama import init, Fore, Style

# Initialize Colorama to enable colored output on Windows
init()

# Create a logger
logger = logging.getLogger('customer_logger')
logger.setLevel(logging.INFO)

# Create a handler to output logs to the console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Create a formatter for the log messages
formatter = logging.Formatter(f'{Fore.BLUE}%(asctime)s - %(levelname)s - %(message)s{Style.RESET_ALL}')
console_handler.setFormatter(formatter)

# Add the console handler to the logger
logger.addHandler(console_handler)
# _________________________________________________________________________


# //////////////////////////////////////////
# MAIN AND ONLY VIEW WHICH RETURNS HTML FILE
def home_page(request):
    context = {'message': '', 'book_category': [], 'books': []}
    
    # Categories
    all_book_category = Category.objects.all()
    context['book_category'] = all_book_category
    
    
    all_books = Book.objects.all().select_related('Category', 'author', 'publisher').order_by('-id')
    
    # set the pagination logic for the template
    paginator = Paginator(all_books, 4)
    page = request.GET.get('page')
    all_books = paginator.get_page(page)
    
    context['books'] = all_books
    
        
    return render(request, 'bookshop/index.html', context=context)


# ///////////
# CART VIEWS
def cart_view(request):
    if request.method == 'POST':
        new_cart = Cart.objects.create()
        return HttpResponse(content=new_cart.id)
 
def cart_detail_view(request, uuid):
    if request.method == 'DELETE':
        bronze = 4 #the id of bronze is 4
        user = request.user
        total_price = 0
        
        try:
            with transaction.atomic():
                # FIRST GET THe CUSTOMER OBJECT WITH THE USER
                customer = Customer.objects.get(user=user)
                
                # SECOND CREATES AN ORDER FOR THE CURRENT CUSTOMER BASED ON THE CART
                order = Order.objects.get(customer=customer, status = 'P')
                logger.info(f'order_id: {order.id}')
                
                # ADD THE CARTITEMS TO THE ORDERITEMS FOR THE SPECIFIC CUSTOMER
                cartitems = CartItem.objects.filter(cart_id = uuid)
                for citem in cartitems:
                    # cartitem = CartItem.objects.filter(cart_id=uuid, book_id = book_id).first()
                    # if not cartitem:
                    #     quantity = 1
                    #     price = Book.objects.filter(id=book_id).values('price')
                    #     CartItem.objects.create(cart_id=uuid, book_id=book_id, quantity=quantity, price=price)
                    orderitem = OrderItem.objects.filter(order=order, book = citem.book).first()
                    if not orderitem:
                        orderitem =  OrderItem.objects.create(order = order, book = citem.book, quantity=citem.quantity, price=citem.price)
                    else:
                        orderitem.quantity = orderitem.quantity + citem.quantity
                        orderitem.save()
                    total_price = total_price + (orderitem.quantity * orderitem.price)
                    # deleted item from cartitem
                    citem.delete()
                    logger.info(f'orderItem created -- cartitem deleted: {citem.id}')

                    
                order.total_price = total_price
                order.save()
                logger.info(f'total price has updated for order totoal_price: {order.total_price}' )
                
                # delete cart
                cart = Cart.objects.filter(id = uuid)
                cart.delete()
                logger.info(f'cart has deleted uuid: {uuid}')
                
                return HttpResponse(f'cart ({uuid}) has deleted, and equivaletn order has created', status = 200)
        except  Exception as e:
            return HttpResponse(f'Something went wrong, error: {e}', status = 500)
        
        
# ////////////
#CARTITEM VIEWS
def cartitems_view(request, uuid):
    if request.method == 'POST':
        body = json.loads(request.body.decode("utf-8"))
        book_id = body['book_id']
        cartitem = CartItem.objects.filter(cart_id=uuid, book_id = book_id).first()
        if not cartitem:
            quantity = 1
            price = Book.objects.filter(id=book_id).values('price')
            CartItem.objects.create(cart_id=uuid, book_id=book_id, quantity=quantity, price=price)
            return HttpResponse('item has added', status=201)
        else:
            return HttpResponse('item has already added!!', status=208)
        
    if request.method == 'GET':
         # wrap in list(), because QuerySet is not JSON serializable
        cartitems = list(CartItem.objects.filter(cart_id = uuid).select_related('book', 'book__author').values('id', 'quantity', 'book__title', 'book__author__f_name', 'book__author__l_name', 'price'))
        return JsonResponse({'data': cartitems}, status=200)
    
    if request.method == 'UPDATE':
        body = json.loads(request.body.decode("utf-8"))
        item = CartItem.objects.get(pk = body['cartitem_id'])
        if body['op'] == '+':
            item.quantity = item.quantity + 1
        else:
            item.quantity = item.quantity - 1
        if(item.quantity == 0):
            item.delete()
            return HttpResponse(content='item has deleted', status=200)
        else:
            item.save()
            return HttpResponse(content='item has updated', status=206)
    

# /////////
#BOOK VIEWS    
def books_view(request):
    if request.method == 'GET':
        category_id = request.GET.get('category')
        order = request.GET.get('order')
        page = request.GET.get('page')
        search = request.GET.get('q')
        
        
        if category_id == 'all' :
            books = Book.objects.all()
            if(search != 'none'):
                books = books.filter(title__contains= search)
        else:
            books = Book.objects.filter(Category = category_id)
            
        
        books = books.select_related('Category', 'publisher', 'author').annotate(
            author_full_name= Func(F('author__f_name'),Value(' '), F('author__l_name'), function='CONCAT'),
            img_full_url = Func(Value('http://127.0.0.1:8000/media/'), F('main_img'), function='CONCAT', output_field=CharField()),
            publisher_name = F('publisher__name'),
            category_name = F('Category__name'),
            book_detail_url = Func(Value('http://127.0.0.1:8000/book/'), F('pk'), Value('/'), function='CONCAT', output_field=CharField()),
            )
        
        if order == 'lowest_price':
          books =  books.order_by('price')
        elif order == 'highest_price':
           books = books.order_by('-price')
        elif order == 'newest' or order == 'none':
           books = books.order_by('-id')
           
        # convert the queryset to a list 
        books = books.values()
        
        # split the books object for pagination
        paginator = Paginator(books, 4)
        books = paginator.get_page(page)
        
        books = list(books)
        
        return JsonResponse({'books': books, 'number_of_pages': paginator.num_pages}, status=200)
    
    
def book_detail(request, pk):
    context = {'message': '', 'book': ''}
    book = get_object_or_404(Book, pk=pk)
    likes = Like.objects.filter(object_id = book.id).count()
    user = request.user
    context['book'] = book
    context['number_of_likes'] = likes
    if user.is_authenticated:
        user_liked = Like.objects.filter(object_id = book.id, user = user)
        user_wishlist = WishList.objects.get(user = user)
        user_wishbook = WishItem.objects.filter(object_id = book.id, wishlist = user_wishlist)
        if user_liked:
            context['user_liked'] = True
        if user_wishbook:
            context['user_wishbook'] = True
    comments = Comment.objects.filter(object_id = book.pk).order_by('-pk').select_related('user')
    context['comments'] = comments
    return render(request, 'bookshop/detail.html', context= context)



def book_likes_view(request, pk):
    if request.method == 'POST':
        if request.user.is_authenticated:
            book = Book.objects.get(pk = pk)
            user = request.user
            book_content_type = ContentType.objects.get_for_model(Book)
            like = Like.objects.filter(user = user, content_type = book_content_type, object_id = book.pk)
            if not like:
                Like.objects.create(user=user, content_type=book_content_type, object_id=book.pk)
                return JsonResponse({'message': 'thanks for like'}, status = 201)
            else:
                return JsonResponse({'message': 'you have already liked it'}, status = 400)
        return JsonResponse({'message': 'login first'}, status = 401)
    
    if request.method == 'DELETE':
        if request.user.is_authenticated:
            book = Book.objects.get(pk = pk)
            user = request.user
            book_content_type = ContentType.objects.get_for_model(Book)
            like = Like.objects.filter(user = user, content_type = book_content_type, object_id = book.pk)
            if like:
                like.delete()
                return JsonResponse({'message': f'{user.username} has deleted its like'}, status = 200)
            return JsonResponse({'message': 'you didnt like this book before'}, status = 400)
        return JsonResponse({'message': 'login first'}, status = 401)
                

def book_wish_view(request, pk):
    if request.method == 'POST':
        if request.user.is_authenticated:
            book = Book.objects.get(pk = pk)
            user = request.user
            book_content_type = ContentType.objects.get_for_model(Book)
            wishlist = WishList.objects.get(user = user)
            wishitem = WishItem.objects.filter(wishlist = wishlist, content_type = book_content_type, object_id = book.pk)
            if not wishitem:
                WishItem.objects.create(wishlist = wishlist, content_type=book_content_type, object_id=book.pk)
                return JsonResponse({'message': 'the book has added to the wishlist'}, status = 201)
            else:
                return JsonResponse({'message': 'the book already is in the wishlist'}, status = 400)
        return JsonResponse({'message': 'login first'}, status = 401)
    
    if request.method == 'DELETE':
        if request.user.is_authenticated:
            book = Book.objects.get(pk = pk)
            user = request.user
            book_content_type = ContentType.objects.get_for_model(Book)
            wishlist = WishList.objects.get(user = user)
            wishitem = WishItem.objects.filter(wishlist = wishlist, content_type = book_content_type, object_id = book.pk)
            if wishitem:
                wishitem.delete()
                return JsonResponse({'message': f'{user.username} has removed the book'}, status = 200)
            return JsonResponse({'message': 'the book is not in wishlist'}, status = 400)
        return JsonResponse({'message': 'login first'}, status = 401)
            
        
def book_comments_view(request, pk):
    if request.method == 'POST':
        if request.user.is_authenticated:
            body = json.loads(request.body.decode("utf-8"))
            text = body['text']
            user = request.user
            book_content_type = ContentType.objects.get_for_model(Book)
            comment = Comment.objects.filter(user = user, content_type = book_content_type, object_id = pk).order_by('-id').first()
            if not comment:
                Comment.objects.create(user = user, content_type = book_content_type, object_id = pk, comment_text = text )
                return JsonResponse({'message': f'{user.username} has created its first comment for the book'}, status = 201)
            elif comment:
                can = comment.can_post_comment()
                if can:
                    Comment.objects.create(user = user, content_type = book_content_type, object_id = pk, comment_text = text )
                    return JsonResponse({'message': f'{user.username} has created a new comment for the book'}, status = 201)
                else:
                    return JsonResponse({'message': f'since last comment for this book, must have passed 1 hour'}, status = 429)
        return JsonResponse({'message': 'login first'}, status = 401)
    
    if request.method == 'GET':
        comments = Comment.objects.filter( object_id = pk).select_related('user').order_by('-id').values('user__username', 'comment_text')
        return JsonResponse({'message': 'all comments', 'comments': list(comments)}, status = 200)
        

# /////////////
# ORDER VIEWS
@login_required
def customer_order_view(request, pk):
    if request.method == 'POST':
        if(not Order.objects.filter(customer_id = pk, status = "P")):
            order = Order.objects.create(customer_id = pk)
            logger.info('order created* - order_id: %d', order.id)
            return JsonResponse({'order_id': order.id, 'message': 'new order created'}, status=201)
        return JsonResponse({'message': 'this customer already has an open order'}, status=400)
        
    if request.method == 'GET':
        order = Order.objects.get(customer_id = pk, status = 'P')
        return JsonResponse({'order_id': order.id, 'message': 'customer id is sent'}, status=200)

            

@login_required
def orderitems_view(request, pk):
    if request.method == 'POST':
        body = json.loads(request.body.decode("utf-8"))
        book_id = body['book_id']
        orderitem = OrderItem.objects.filter(order_id=pk, book_id = book_id).first()
        if not orderitem:
            quantity = 1
            price = Book.objects.filter(id=book_id).values('price')
            OrderItem.objects.create(order_id=pk, book_id=book_id, quantity=quantity, price=price)
            return HttpResponse('item has added', status=201)
        else:
            return HttpResponse('item has already added!!', status=208)
        
    if request.method == 'GET':
         # wrap in list(), because QuerySet is not JSON serializable
        orderitems = list(OrderItem.objects.filter(order_id = pk).select_related('book', 'book__author').values('id', 'quantity', 'book__title', 'book__author__f_name', 'book__author__l_name', 'price'))
        return JsonResponse({'data': orderitems}, status=200)
    
    if request.method == 'UPDATE':
        body = json.loads(request.body.decode("utf-8"))
        item = OrderItem.objects.get(pk = body['orderitem_id'])
        if body['op'] == '+':
            item.quantity = item.quantity + 1
        else:
            item.quantity = item.quantity - 1
        if(item.quantity == 0):
            item.delete()
            return HttpResponse(content='item has deleted', status=200)
        else:
            item.save()
            return HttpResponse(content='item has updated', status=206)
    
        
        
    
# CUSTOEMR VIEWS
def customer_view(request):
    user = request.user
    if request.method == 'GET':
        customer= Customer.objects.get(user_id=user.id)
        return JsonResponse({'customer_id': customer.id, 'message': 'customer id is sent'}, status=200)
        
    if request.method == 'UPDATE':
        body = json.loads(request.body.decode('utf-8'))
        phone_number = body['phone_number']
        
        customer = Customer.objects.get(user = user)
        customer.phone_number = phone_number
        customer.save()
        return JsonResponse({'message': 'customer has updated'}, status = 200)
    
    
def address_view(request, pk):
    if request.method == 'UPDATE':
        context = {}
        body = json.loads(request.body.decode('utf-8'))
        address_line = body['address_line']
        zipcode = body['zipcode']
        city_id = body['city_id']
        
        address = Address.objects.get(pk = pk)
        
        
        if address_line != 'null':
            address.address_line1 = address_line
            context['address'] = 'changed'
        if zipcode != 'null':
            address.zipcode = zipcode
            context['zipcode'] = 'changed'
        if city_id != 'null':
            city = City.objects.get(pk = city_id)
            address.city = city
            context['city'] = 'changed'
            
        address.save()
        
        return JsonResponse(context, status = 200)
        
        
            

def calculate_total_price_of_orderitems(items: OrderItem):
    total_price = 0
    for i in items:
        total_price = total_price + (i.price * i.quantity)
    return total_price

# ///////////////////
# dashborad dashborad
# ///////////////////
@login_required
def dashborad_view(request):
    context = {'message': ''}
    user = request.user
    
    customer = Customer.objects.get(user = user)
    
    # every customers have two null addresses when first they created
    # so we must check these two addresses are not null and then send them to the template 
    all_addresses = Address.objects.filter(customer = customer).select_related('city')
    not_null_addresses = []
    for ad in all_addresses:
        if ad.city.id != 4:
            not_null_addresses.append(ad)
    
    open_order = Order.objects.get(customer = customer, status = 'P')
    all_orderitems = OrderItem.objects.filter(order = open_order)
    
    all_cities = City.objects.all()
    not_null_cities = []
    for c in all_cities:
        if c.id != 4:
            not_null_cities.append(c)
            
    
    wishlist = WishList.objects.get(user = user)
    all_wishitems = WishItem.objects.filter(wishlist = wishlist).select_related('content_type')
    
    open_order.total_price = calculate_total_price_of_orderitems(all_orderitems)
    open_order.save()
    
    context['ordersitems'] = all_orderitems
    context['total_price'] = open_order.total_price
    context['wishitems'] = all_wishitems 
    context['cities'] = not_null_cities 
    context['addresses'] = not_null_addresses
    context['ada'] = all_addresses[0].id
    context['adb'] = all_addresses[1].id
    context['phone_number'] = customer.phone_number
    
    return render(request, 'bookshop/dashboard.html', context=context)

@login_required
def factor_view(request, pk):
    if request.method == 'UPDATE':
        body = json.loads(request.body.decode('utf-8'))
        ad_id = body['address_id']
        customer_id = body['customer_id']

        order_info = {}
        order = Order.objects.get(id = pk)
        order.status = 'WF'
        order.address_id = ad_id
        order.save()
        order_info['id'] = order.pk
        order_info['status'] = order.get_status_display()
        order_info['address'] = order.address.address_line1
        order_info['zipcode'] = order.address.zipcode
        order_info['city'] = order.address.city.name
        order_info['total_price'] = order.total_price
        order_info['phone_number'] = order.customer.phone_number
        
        items = []
        orderitems = OrderItem.objects.filter(order_id = pk).select_related('book', 'book__author')
        for item in orderitems:
            items.append({
                'author': item.book.author.full_name,
                'book': item.book.title,
                'price': item.price,
                'quantity': item.quantity
            })
            
        user_info = {}
        user = request.user
        user_info['full_name'] = f'{user.first_name} {user.last_name}'
        
        order = Order.objects.create(customer_id = customer_id)
        
        context = {
            'user':user_info,
            'order': order_info,
            'items': items,
            'new_order_id': order.pk
                   }
        
        
        return JsonResponse(context, status = 200)
            
            

    
    

"""
authenticate(request=None, **credentials)¶
    Use authenticate() to verify a set of credentials.
    It takes credentials as keyword arguments, username and password for the default case,
    checks them against each authentication backend,
    and returns a User object if the credentials are valid for a backend. 
    If the credentials aren’t valid for any backend or if a backend raises PermissionDenied, it returns None.
"""
def login_page(request):
    context = {'message': []}
    if request.method == 'POST':
        input = request.POST.get('username_email')
        password = request.POST.get('password')
        
        # cant check raw password against hash password
        # userpass = User.objects.filter(username=input, password=password)
        
        user = authenticate(username = input, password = password)
        
        if user: 
            login(request,user=user)
            context['message'] = 'شما وارد شدید'
            return redirect('bookshop:home')
        else:
            context['message'] = 'نام کاربری یا رمز عبور شما اشتباه است'
        return render(request, 'bookshop/login.html', context=context)
        
    
    return render(request, 'bookshop/login.html')


def logout_view(request):
    logout(request)
    return redirect('bookshop:home')

def signup_page(request):
    context = {'error_message': [], 'creation': False}
    if request.method == 'POST':
        # the data is sent by a js fetch
        body = json.loads(request.body.decode("utf-8"))
        username = body['username']
        email = body['email']
        if User.objects.filter(username=username).first():
            context['error_message'].append( '!!این نام کاربری موجود نیست')
        if User.objects.filter(email = email).first():
            context['error_message'].append('!!با این آدرس ایمیل قبلا ثبت نام شده است')
        else:
            form = SignupForm(body)
            try:
                if form.is_valid():
                    password = form.cleaned_data['password']
                    
                    # create stores the plain_text password in the db
                    # User.objects.create(username=username, email= email, password = password)
                    
                    # do not attempt to manipulate the password attribute of the user directly.
                    # This is why a helper function is used when creating a user.
                    #create_user hashs the password and stores it in the db
                    User.objects.create_user(username=username, email= email, password = password)
                    print('user has created')
                    
                    context['creation'] = True
            except Exception as e:
                # Django cannot convert Exception object to JSON format and raise error.
                # To fix it you should convert error to string and pass result to response:
                context['error_message'].append(str(e))
        
        return HttpResponse(content=json.dumps(context))

            
    return render(request, 'bookshop/signup.html')


def check_user_auth(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return JsonResponse({'user': 'is_authenticated'}, status = 200)
        return JsonResponse({'user': 'is not authenticated'}, status = 200)
    
@login_required
def user_view(request):
    if request.method == "UPDATE":
        context = {'message': 'the user has updated'}
        status_code = 200

        user_id = request.user.id
        
        body = json.loads(request.body.decode("utf-8"))
        f_name = body['f_name']
        l_name = body['l_name']
        username = body['username']
        
        user_object = User.objects.get(id = user_id)
        
        if(f_name != 'null'):
            user_object.first_name = f_name
            context['first_name'] = 'changed'
        if(l_name != 'null'):
            user_object.last_name = l_name
            context['last_name'] = 'changed'
        if(username != 'null'):
            # check for uniqueness
            if(not User.objects.filter(username = username)):
                user_object.username = username
                context['username'] = 'changed'
            else:
                context.clear()
                context['message'] = 'nothings has changed, username is not available'
                status_code = 400
            
        if(status_code == 200):
            user_object.save()
            
        return JsonResponse(context, status = status_code)
        
        
    return HttpResponse( status= 405 )