CartContainerEl = document.querySelector('.cart_container')
CartItemContainerEl = document.querySelector('.cart_item_container')
UsernameHeaderEl = document.querySelector('.username-header')



cart_id = localStorage.getItem('cart_id')
csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value
let cartitems = null
let User_logged_in = false
let order_id = null
let customer_id = null

UsernameHeaderEl.addEventListener('mouseenter', () => {
    CartItemContainerEl.classList.add('hidden')
    CartItemContainerEl.classList.remove('block')
})

CartItemContainerEl.addEventListener('mouseleave', () => {
    CartItemContainerEl.classList.remove('block')
    CartItemContainerEl.classList.add('hidden')
})

function add_item_to_cart(bookid, element = null) {
    if(User_logged_in){
        ok_message = 'item has added'
        url = `http://127.0.0.1:8000/order/${order_id}/items/`
        console.log('order url');
    } 
    else{
        ok_message = 'item has added'
        url = `http://127.0.0.1:8000/carts/${cart_id}/items/`
        console.log('cart url');
    }
 
    fetch(url, {
        headers: {
            "X-CSRFToken": csrf_token,
        }, 
        method: 'POST',
        body: JSON.stringify({  
                book_id: bookid
            })
        })
        .then(response => response.text())
        .then(data => {
            if(data === ok_message && element !== null){
                element.classList.toggle('bg-gray-400')
                element.classList.toggle('bg-green-500')
            }

            get_items()

        })
}

CartContainerEl.addEventListener('mouseenter', () => {
    CartItemContainerEl.classList.add('block')
    CartItemContainerEl.classList.remove('hidden')

    html = `<div class='flex flex-row-reverse text-lg text-gray-800 justify-end space-x-4 py-1 px-3 mb-3'>
    <p class="ml-10"> کتاب</p>
    <p class=""> نویسنده</p>
    <p class=""> تعداد </p>
    <p class=""> قیمت </p>
    </div>`
    let total_price = 0

    if(cartitems !== null)
    cartitems.forEach(element => {
        html = html + `<div class='cartitem-${element.id} flex flex-row-reverse text-md  justify-end space-x-4 py-1 px-3 mb-3'>
        <p class="font-semibold justify-self-start mx-3"> ${element.book__title}</p>
        <p class=""> ${element.book__author__f_name} ${element.book__author__l_name}</p>
        <p class="quantity_container"> 
            <span cartitem-id="${element.id}" class='subtract_item text-lg font-bold text-gray-500 hover:text-gray-900'>-</span>
                <span class='quantity_value'>${element.quantity}</span>
            <span cartitem-id="${element.id}" class='add_item text-lg font-bold text-gray-500 hover:text-gray-900'>+</span>
        </p>
        <p class="text-purple-600"> ${element.price}</p>
        </div>`
        total_price = total_price + (element.price * element.quantity)
    });
    html = html + `
    <div class='flex items-center'>
    <button class='btn-order-in-cart px-4 py-2 m-4 bg-green-400 hover:bg-green-600 rounded-lg text-white font-bold'>سفارش</button>
    <p class="total_price_cart text-gray-600 mx-auto p-4"> قیمت کل: ${total_price.toFixed(2)}</p>
    </div>
    `
    CartItemContainerEl.innerHTML = html

    // CartItemContainerEl.querySelector('.btn-order-in-cart').addEventListener('click',  )


    document.querySelectorAll('.add_item').forEach(element => {
        element.addEventListener('click', () => {
            item_id = element.getAttribute("cartitem-id")
            update_cartitem(item_id, '+', element)
            
        })
    });

    document.querySelectorAll('.subtract_item').forEach(element => {
        element.addEventListener('click', () => {
            item_id = element.getAttribute("cartitem-id")
            update_cartitem(item_id, '-', element)
        })
    });
})


function update_cartitem(item_id, op, element) {
    if(User_logged_in){
        url = `http://127.0.0.1:8000/order/${order_id}/items/`
        body_ = {
            orderitem_id: item_id,
            op: op
        }
    }else{
        url = `http://127.0.0.1:8000/carts/${cart_id}/items/`
        body_ = {
            cartitem_id: item_id,
            op: op
        }
    }
    fetch(url, {
        headers:{
            "X-CSRFToken": csrf_token,
        },
        method: 'UPDATE',
        body: JSON.stringify(body_)
    })
    .then(response => response.text())
    .then(content => {
        console.log(content);
            if(content=== 'item has updated'){
                quantity_spane = element.parentElement.querySelector('.quantity_value')
                if(op === '+'){   
                    quantity_spane.innerHTML = parseInt(quantity_spane.innerHTML) + 1
                }
                else{
                    quantity_spane.innerHTML = parseInt(quantity_spane.innerHTML) - 1
                }
                cartitems.forEach(element => {
                    if(element.id === parseInt(item_id)){
                        // update the cartitems variable
                        element.quantity = quantity_spane.innerHTML
                        // update the total price of the cart
                        total_priceEl = CartItemContainerEl.querySelector('.total_price_cart')
                        if(op === '+')
                            total_price = parseFloat(total_priceEl.innerHTML.replace('قیمت کل:', '')) + parseFloat(element.price)
                        else
                            total_price = parseFloat(total_priceEl.innerHTML.replace('قیمت کل:', '')) - parseFloat(element.price)
                        total_priceEl.innerHTML = 'قیمت کل:' + total_price.toFixed(2)
                }
                });
            }
            else if(content === 'item has deleted'){
                console.log('kjg');
                element.parentElement.parentElement.classList.add('blur-sm')
                element.parentElement.parentElement.classList.add('pointer-events-none')
                cartitems.forEach((element, index )=> {
                    if(element.id === parseInt(item_id)){
                        // update the total price of the cart
                        total_priceEl = CartItemContainerEl.querySelector('.total_price_cart')
                        console.log(total_priceEl.innerHTML)
                        console.log(element.price)
                        total_price = parseFloat(total_priceEl.innerHTML.replace('قیمت کل:', '')) - parseFloat(element.price)
                        console.log(total_price)
                        total_priceEl.innerHTML = 'قیمت کل:' + total_price.toFixed(2)
                        // delete from cartimes
                        console.log(index)
                        cartitems.splice(index, 1)
                        console.log(cartitems)
                    }
                });
                
            }
         })
}




// cart get func
function get_items() {
    if(User_logged_in){
        console.log('get items by this order id::',order_id);
        url = `http://127.0.0.1:8000/order/${order_id}/items/`
    }else{
        console.log('get items by this uuid:',cart_id);
        url = `http://127.0.0.1:8000/carts/${cart_id}/items/`
    }
    fetch(url, {
            headers: {
                "X-CSRFToken": csrf_token,
            }, 
            method: 'GET',
    })
    .then(response => response.json())
    .then(content => {
            cartitems = content['data']
         })
}



// whenever the document has loaded, it does some cirtical workflows
window.addEventListener('load',  () => {
    // this funciton sends a request to the server and get the sataus of the user
    // and then updates the user_logged_in variable
    check_user_auth()

    if(cart_id === null && User_logged_in === false){
        url = 'http://127.0.0.1:8000/carts/'
        fetch(url, {
            headers: {
                "X-CSRFToken": csrf_token,
            },
            method: "POST",
        })
        .then(response => response.text())
        .then(data => {
            console.log('cart created ---- cart_id:',data)
            cart_id = data.replaceAll('-', '')
            localStorage.setItem('cart_id', cart_id)
        })
    }

    
    if(User_logged_in){
        essential_works_after_user_logged_in()
    }
    
    if(cart_id !== null || User_logged_in)
        get_items()

    // if cart_id doesn't exists, it means we doesnt need to do this, because it already has done
    if(cart_id !== null){
        if(User_logged_in){
              // asynchronous functions or contains asynchronous apis
             // delete cart and transefer its book to order
             // then will call get_items()
             delete_cart()
        }else{
            console.log('خطا در اعتبار سنجنی کاربر');
        }
    }

}) 


//  this function sends AJAX request synchronously
// this func checks for user authentication
function check_user_auth() { 
    url = 'http://127.0.0.1:8000/check/user/'
    ajax = new XMLHttpRequest()
    ajax.open('GET', url, async=false )
    ajax.send()
    data = ajax.responseText
    // Deserialize
    data = JSON.parse(data)


    if (data['user'] === 'is_authenticated'){
        User_logged_in = true
    }
    else{
        User_logged_in = false
    }
}

async function essential_works_after_user_logged_in() {
    // synchronous functions
    user_customer()
    customer_order()
}

function user_customer(){
    url = 'http://127.0.0.1:8000/customer/'
    ajax = new XMLHttpRequest()

    ajax.open('GET', url, async=false )
    // ajax.setRequestHeader('X-CSRFToken', csrf_token); // Add the csrf_token as a header
    ajax.send()
    data = ajax.responseText
    // Deserialize
    data = JSON.parse(data)

    customer_id = data['customer_id']
}

function customer_order(){
    url = `http://127.0.0.1:8000/customer/${customer_id}/order/`
    ajax = new XMLHttpRequest()

    ajax.open('GET', url, async=false )
    // ajax.setRequestHeader('X-CSRFToken', csrf_token); // Add the csrf_token as a header
    rdata = JSON.stringify({customer_id: customer_id})
    ajax.send(rdata)
    data = ajax.responseText
    // Deserialize
    data = JSON.parse(data)

    order_id = data['order_id']
}


// 1-delete the cart item from browser localstorage
// 2-stores the cart in the db for a particular user
function delete_cart() {
    url = `http://127.0.0.1:8000/cart/${cart_id}`
    fetch(url, {
        headers: {
            "X-CSRFToken": csrf_token,
        },
        method: "DELETE"
    })
    .then(response => {
        response.text()
        console.log(response);
        if (response.status !== 500){
            localStorage.removeItem('cart_id')

            // this will get cart's items from orderitem
            get_items()
        }
    })
}