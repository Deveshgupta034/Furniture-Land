from django.db import reset_queries
from django.http.response import HttpResponse
from django.shortcuts import render,redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login,logout
from .forms import CreateUserForm
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib import auth

from .models import *

from django.contrib import messages


import json
import datetime
from store.models import *

from .utils import cartData,guestOrder
# Create your views here.

def store(request):
     data = cartData(request)
     cartItems = data['cartItems']    
     products = Product.objects.all()
     context = {'products': products, 'cartItems': cartItems }
     return render(request, 'store/store.html', context)

def cart(request):
     data = cartData(request)
     cartItems = data['cartItems']
     order = data['order']
     items = data['items']
     
     context = {'items':items, 'order':order, 'cartItems':cartItems}
     return render(request, 'store/cart.html', context)

def checkout(request):
     data = cartData(request)

     cartItems = data['cartItems']
     order = data['order']
     items = data['items']

     context = {'items':items, 'order':order, 'cartItems':cartItems}
     return render(request, 'store/checkout.html', context)

def updateItem(request):
     data = json.loads(request.body)
     productId = data['productId']
     action = data['action']

     print('Action:',action)
     print('productId:',productId)


     customer = request.user.customer
     product = Product.objects.get(id=productId)
     order,created = Order.objects.get_or_create(customer=customer,complete=False) 
     orderItem,created = OrderItem.objects.get_or_create(order=order, product=product)


     if action =='add':
          orderItem.quantity = (orderItem.quantity + 1)
     elif action == 'remove':
          orderItem.quantity = (orderItem.quantity - 1)
     orderItem.save()

     if orderItem.quantity<=0:
          orderItem.delete()
     return JsonResponse('Item was added', safe=False)



def processOrder(request):
     transaction_id = datetime.datetime.now().timestamp()
     data = json.loads(request.body)

     # if request.user.is_authenticated:
     customer = request.session.get('customer')
     # customer = Customer.objects.get(username=user_name,password=pasword)
     order, created = Order.objects.get_or_create(customer=customer,complete = False)
          
     # else:
          # customer,order = guestOrder(request,data)

     total = float(data['form']['total'])
     order.transaction_id = transaction_id

     if total == float(order.get_cart_total):
          order.complete = True
     order.save()

     if order.shipping == True:
          ShippingAddress.objects.create(
               customer = customer,
               order = order,
               address = data['shipping']['address'],
               city = data['shipping']['city'],
               state = data['shipping']['state'],
               zipcode = data['shipping']['zipcode']
          )
     
     msg_plain = render_to_string('store/temp.txt')
     context = {'user': request.session.get('name')}
     msg_html = render_to_string('store/email_template.html',context)

     send_mail("Order Confirmation" , msg_plain , settings.EMAIL_HOST_USER ,
               [request.session.get('email')] , html_message = msg_html
               )

     messages.info(request,'Transaction Completed')
     return JsonResponse('Payment complete!', safe=False)


def search(request):
     if request.method=='POST':
          data = cartData(request)
          cartItems = data['cartItems']  
          query = request.POST['search']
          filterproduct = Product.objects.filter(name__icontains=query)
          context = {'filterproduct': filterproduct, 'cartItems' : cartItems, 'query':query}
          return render(request, "store/search.html",context)

     
def kids(request):
     data = cartData(request)

     cartItems = data['cartItems']
     order = data['order']
     items = data['items']
     products = Product.objects.filter(category=1)
     context = {'items':items, 'order':order, 'cartItems':cartItems, 'products': products}
     return render(request,'store/kids.html', context)


def sofa(request):
     data = cartData(request)
     cartItems = data['cartItems']
     order = data['order']
     items = data['items']
     products = Product.objects.filter(category=3)
     context = {'items':items, 'order':order, 'cartItems':cartItems, 'products': products}
     return render(request,'store/sofa.html', context)


def dining_table(request):
     data = cartData(request)
     cartItems = data['cartItems']
     order = data['order']
     items = data['items']
     products = Product.objects.filter(category=4)
     context = {'items':items, 'order':order, 'cartItems':cartItems, 'products': products}
     return render(request,'store/dining_table.html', context)


def decor(request):
     data = cartData(request)
     cartItems = data['cartItems']
     order = data['order']
     items = data['items']
     products = Product.objects.filter(category=5)
     context = {'items':items, 'order':order, 'cartItems':cartItems, 'products': products}
     return render(request,'store/decor.html', context)


def productView(request, pk):
    product = Product.objects.get(name=pk)
    data = cartData(request)
    order = data['order']
    cartItems = data['cartItems'] 
    context = {'product': product, 'cartItems' : cartItems, 'order' : order}
    return render(request, 'store/view.html', context) 


# def signup(request):
#      data = cartData(request)
#      cartItems = data['cartItems']    
#      order = data['order']
#      products = Product.objects.all()
#      context = { 'cartItems': cartItems, 'orer': order,'products' : products}
#      return render(request, 'store/signup.html',context)

# data = cartData(request)
     # cartItems = data['cartItems']    
     # order = data['order']
     # products = Product.objects.all()
     # context = { 'cartItems': cartItems, 'order': order,'products' : products}
     # form = CreateUserForm()

     # form = CreateUserForm(request.POST)
          # if form.is_valid():
          #      form.save()
          #      messages.success(request,"Hooray!!! Your are now Registered...")
          #      return redirect('store')

def signup(request):
     data = cartData(request)
     cartItems = data['cartItems']    
     order = data['order']
     products = Product.objects.all()
     
     if request.method=="POST":
          naam=request.POST['naam']
          uname=request.POST['uname']
          emid=request.POST['emid']
          passw=request.POST['passw']
          REG=Customer(name=naam,username=uname,email=emid,password=passw)
          REG.save()
          msg="You are registered successfully..."
          # auth.login(request,REG)
          return render(request,'store/login.html',{'msg':msg})
     # else:
     #      return HttpResponse("Try Again")

     context = { 'cartItems': cartItems, 'order': order,'products' : products}
     return render(request, 'store/signup.html',context)
     
     


def loginfunc(request):
     data = cartData(request)
     cartItems = data['cartItems']    
     order = data['order']
     if request.method=='POST':
          user_name = request.POST.get('loginusername')
          pasword = request.POST.get('loginpassword')

          try:
            customer=Customer.objects.get(username=user_name,password=pasword)
          except:
            customer=None

          # customer = auth.authenticate(request,username=user_name, password=pasword)
          
          if customer is not None:
               # auth.login(request, customer)
               request.session['name'] = customer.name
               request.session['email'] = customer.email
               messages.success(request, "Hooray!!! You are logged in..")
               # return redirect('main.html')
               return redirect('store')
          else:
               messages.error(request,"You entered incorrect username or password!!!")
               return redirect('store')

          # try:
          #    data=Customer.objects.get(username=user_name, password=pasword)
          # except:
          #    data=None
          # msg = "Try again..."
          # if(data):

          # #   request.session['customer']=data.id
          # #   request.session['name'] = data.name
          #   request.session['username']=user_name
          # #   request.session['phone']=data.phone
          # #   request.session['address']=data.address

          #   return redirect('store')
          # else:
          #    return render(request,'store',{'msg':msg})

     context = { 'cartItems': cartItems, 'order': order}
     return render(request, 'store/login.html',context )



#Gobind's Code
# try:
#             data=Customer.objects.get(email=email,password=password)
#         except:
#             data=None

#         msg="Try again..."
#         if(data):

#             request.session['customer']=data.id
#             request.session['name'] = data.firstName+' '+data.lastName
#             request.session['email']=email
#             request.session['phone']=data.phone
#             request.session['address']=data.address

#             return redirect('homepage')
#         else:
#             return render(request,'account.html',{'msg':msg})



def logoutUser(request):
     # logout(request)
     request.session.clear()
     messages.error(request,"You are logged out")
     return redirect('store')

def forgot(request):
     return render(request, 'store/forgot_password.html')
          
def about(request):
     data = cartData(request)
     cartItems = data['cartItems']    
     order = data['order']
     context = { 'cartItems': cartItems, 'order': order}
     return render(request, 'store/aboutus.html',context)

def contact(request):
     data = cartData(request)
     cartItems = data['cartItems']    
     order = data['order']
     context = { 'cartItems': cartItems, 'order': order}

     return render(request, 'store/contactus.html',context)

def getinfo(request):
     if request.method=='POST':
          name = request.POST.get('fullname')
          eml = request.POST.get('email')
          msg = request.POST.get('message')

          info = Contact.objects.create(name=name,email=eml,message=msg)
          info.save()
          messages.success(request, "Message sent")
          return redirect('store')
# from django.core.mail import EmailMessage
# from django.conf import settings
# from django.template.loader import render_to_string

# def success(request, uid):
#      template = render_to_string('store/email_template.html',{'name': 'deveshgupta034@gmail.com'})

#      email = EmailMessage(
#           'Thanks for purchasing the product',
#           template,
#           settings.EMAIL_HOST_USER,
#           ['deveshgupta034@gmail.com'],
#           ) 
#      email.fail_silently=False
#      email.send()

#      return render(request,'store/main.html')