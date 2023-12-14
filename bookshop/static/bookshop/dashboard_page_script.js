'strict mode'

OrderSectionEl = document.querySelector('.orders-section')
WishlistSectionEl = document.querySelector('.wishlist-section')
CustomerSectionEl = document.querySelector('.customer-section')
PasswordSectionEl = document.querySelector('.password-section')

OrderTabEl = document.querySelector('.order-tab')
WishlistTabEl = document.querySelector('.wishlist-tab')
CustomerTabEl = document.querySelector('.customer-tab')
PasswordTabEl = document.querySelector('.password-tab')

MessagePEl = document.querySelector('.message-p')
ALLInfoLabelsEl = document.querySelectorAll('#info-label')

// customer form
FirstNameInputEl = document.getElementById('first-name')
LastNameInputEl = document.getElementById('last-name')
UsernameInputEl = document.getElementById('username')
EmailInputEl = document.getElementById('email')
PhoneNumberInputEl = document.getElementById('phone-number')
// address 1
City1InputEl = document.getElementById('city1')
Address1InputEl = document.getElementById('address1')
Zipcode1InputEl = document.getElementById('zipcode1')
Address1BoxEl = document.querySelector('.address1-box')
// address 1
City2InputEl = document.getElementById('city2')
Address2InputEl = document.getElementById('address2')
Zipcode2InputEl = document.getElementById('zipcode2')
// button for form submit
BtnSubmitFormEl = document.querySelector('.btn-form-submit')

FormInputsEl = document.querySelectorAll('input')
FormTextareaEl = document.querySelectorAll('textarea')
FormSelectboxEl = document.querySelectorAll('select')

BtnSubmitOrderEl = document.querySelector('.btn-submit-order')

Address1El = document.querySelector('.address-1')
Address2El = document.querySelector('.address-2')
FactorBoxel = document.querySelector('.factor-box')
// end of selections
// /////////////////
ad1_id = document.querySelector('.address1-box').id
ad2_id = document.querySelector('.address2-box').id

let selected_address_for_order = 0



OrderTabEl.addEventListener('click', show_section.bind(null,'order'))
WishlistTabEl.addEventListener('click', show_section.bind(null,'wishlist'))
CustomerTabEl.addEventListener('click', show_section.bind(null,'customer'))
PasswordTabEl.addEventListener('click', show_section.bind(null,'password'))

BtnSubmitFormEl.addEventListener('click', submit_form)

let has_data_changed = {
    'first-name': 'null',
    'last-name': 'null',
    'username': 'null',
    'phone-number': 'null',
    'city1': 'null',
    'address1': 'null',
    'zipcode1': 'null',
    'city2': 'null',
    'address2': 'null',
    'zipcode2': 'null',
}
 
FormInputsEl.forEach(i => {
    i.addEventListener('change', () => {
        // console.log(i.id);
        if( i.value !== '')
            // console.log(i.value);
            has_data_changed[i.id] = i.value
            console.log(has_data_changed);
    })
});
FormTextareaEl.forEach(i => {
    i.addEventListener('change', () => {
        // console.log(i.id);
        if( i.value !== '')
            // console.log(i.value);
            has_data_changed[i.id] = i.value
            console.log(has_data_changed);
    })
});
FormSelectboxEl.forEach(i => {
    i.addEventListener('change', () => {
        // console.log(i.id);
            has_data_changed[i.id] = i.value
            console.log(has_data_changed);
    })
});

if(Address1El)
Address1El.addEventListener('click', () => {
    selected_address_for_order = Address1El.id
    Address1El.classList.add('border-indigo-600')
    Address1El.classList.remove('border-white')
    Address2El.classList.add('border-white')
    Address2El.classList.remove('border-indigo-600')
})
if(Address2El)
Address2El.addEventListener('click', () => {
    selected_address_for_order = Address2El.id
    Address2El.classList.add('border-indigo-600')
    Address2El.classList.remove('border-white')
    Address1El.classList.add('border-white')
    Address1El.classList.remove('border-indigo-600')

})



BtnSubmitOrderEl.addEventListener('click', () => {
    console.log(selected_address_for_order);
    if (selected_address_for_order !== 0){
        FactorBoxel.classList.remove('hidden')
        FactorBoxel.classList.add('block')

        url = `http://127.0.0.1:8000/factor/order/${order_id}`
        fetch(url,{
            headers: {
                "X-CSRFToken": csrf_token,
            },
            method: 'UPDATE',
            body: JSON.stringify({
                address_id: selected_address_for_order,
                customer_id: customer_id
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data['order']['address']);
            document.querySelector('.factor-order-number').innerHTML = data['order']['id']
            document.querySelector('.factor-address').innerHTML = data['order']['address']
            document.querySelector('.factor-phone-number').innerHTML = data['order']['phone_number']
            document.querySelector('.factor-fullname').innerHTML = data['user']['full_name']
            document.querySelector('.factor-order-number').innerHTML = data['order']['zipcode']
            document.querySelector('.factor-zipcode').innerHTML = data['order']['id']
            document.querySelector('.factor-total-price').innerHTML = data['order']['total_price']
            document.querySelector('.factor-order-status').innerHTML = data['order']['status']

            html = ''
            Array.from(data['items']).forEach(i => {
                html = html + `
                <p>${i.price}</p>
                <p>${i.quantity}</p>
                <p>${i.book}</p>
                `
            })
            grid = document.querySelector('.factor-item-grid')
            grid.innerHTML = grid.innerHTML + html

            document.querySelector('.orderitems-box').innerHTML = ''

            document.querySelector('.factor-btn-pay').addEventListener('click', ()  => {

                FactorBoxel.classList.add('hidden')
                FactorBoxel.classList.remove('block')
                
                order_id = data['new_order_id']
                alert('درگاه پرداخت موجود نیست')
            })
            
        })

    }
    else
        alert('!!!آدرسی انتخاب نشده است')
})



// end of eventListeners
// /////////////////////








function show_section(section) {

    // hidden all the section
    OrderSectionEl.classList.add('hidden')
    WishlistSectionEl.classList.add('hidden')
    CustomerSectionEl.classList.add('hidden')
    PasswordSectionEl.classList.add('hidden')
    // make simple all the tabs
    OrderTabEl.classList.remove('scale-y-[1.16]', '-translate-y-[3px]','bg-indigo-600')
    WishlistTabEl.classList.remove('scale-y-[1.16]', '-translate-y-[3px]','bg-indigo-600')
    CustomerTabEl.classList.remove('scale-y-[1.16]', '-translate-y-[3px]','bg-indigo-600')
    PasswordTabEl.classList.remove('scale-y-[1.16]', '-translate-y-[3px]','bg-indigo-600')

    if(section === 'order'){
        OrderSectionEl.classList.remove('hidden')
        OrderTabEl.classList.add('scale-y-[1.16]', '-translate-y-[3px]','bg-indigo-600')
    }else if(section === 'wishlist'){
        WishlistSectionEl.classList.remove('hidden')
        WishlistTabEl.classList.add('scale-y-[1.16]', '-translate-y-[3px]','bg-indigo-600')
        
    }else if(section === 'customer'){
        CustomerSectionEl.classList.remove('hidden')
        CustomerTabEl.classList.add('scale-y-[1.16]', '-translate-y-[3px]','bg-indigo-600')
        
    }else if(section === 'password'){
        PasswordSectionEl.classList.remove('hidden')
        PasswordTabEl.classList.add('scale-y-[1.16]', '-translate-y-[3px]','bg-indigo-600')
    }

}

function submit_form() {
    let message = ''
    console.log(has_data_changed);

    url = 'http://127.0.0.1:8000/user/'
    // check if all data are not null
    if(has_data_changed['first-name'] !== 'null' || has_data_changed['last-name'] !== 'null' || has_data_changed['username'] !== 'null'){
        fetch(url, {
            headers: {
                "X-CSRFToken": csrf_token,
            },
            method: 'UPDATE',
            body: JSON.stringify({
                f_name : has_data_changed['first-name'],
                l_name : has_data_changed['last-name'],
                username : has_data_changed['username'],
            })
        })
        .then(response => response.json())
        .then(data => {
            has_data_changed['first-name'] = 'null'
            has_data_changed['last-name'] = 'null'
            has_data_changed['username'] = 'null'
            console.log(data);
        })
        message = 'اطلاعات کاربری بروزرسانی شدن'
    }
    else
        message = 'اطلاعات کاربری تغییری نکرده است'

    // customer will retrieve by user inforamation. 
    url = 'http://127.0.0.1:8000/customer/'
    // check if all data are not null
    if(has_data_changed['phone-number'] !== 'null'){
        fetch(url, {
            headers: {
                "X-CSRFToken": csrf_token,
            },
            method: 'UPDATE',
            body: JSON.stringify({
                phone_number : has_data_changed['phone-number'],
            })
        })
        .then(response => response.json())
        .then(data => {
            has_data_changed['phone-number'] = 'null'
            console.log(data);
        })
        message = message + ' <br> شماره تلفن بروزرسانی شد'
    }
    else
        message =  message + ' <br> شماره تلفن تغییری نکرده است'
    
        url = `http://127.0.0.1:8000/address/${ad1_id}/`
        // check if all data are not null
        if(has_data_changed['address1'] !== 'null' || has_data_changed['zipcode1'] !== 'null' || has_data_changed['city1'] !== 'null'){
            fetch(url, {
                headers: {
                    "X-CSRFToken": csrf_token,
                },
                method: 'UPDATE',
                body: JSON.stringify({
                    address_line: has_data_changed['address1'],
                    zipcode: has_data_changed['zipcode1'],
                    city_id: has_data_changed['city1'],
                })
            })
            .then(response => response.json())
            .then(data => {
                has_data_changed['address1'] = 'null'
                has_data_changed['zipcode1'] = 'null'
                has_data_changed['city1'] = 'null'
                console.log(data);
            })
            message = message + '<br>  آدرس  یک بروز رسانی شد'
        }
        else
            message = message + ' <br>  آدرس یک تغییری نکرده است'

        url = `http://127.0.0.1:8000/address/${ad2_id}/`
        // check if all data are not null
        if(has_data_changed['address2'] !== 'null' || has_data_changed['zipcode2'] !== 'null' || has_data_changed['city2'] !== 'null'){
            fetch(url, {
                headers: {
                    "X-CSRFToken": csrf_token,
                },
                method: 'UPDATE',
                body: JSON.stringify({
                    address_line: has_data_changed['address2'],
                    zipcode: has_data_changed['zipcode2'],
                    city_id: has_data_changed['city2'],
                })
            })
            .then(response => response.json())
            .then(data => {
                
                has_data_changed['address2'] = 'null'
                has_data_changed['zipcode2'] = 'null'
                has_data_changed['city2'] = 'null'
                console.log(data);
            })
            message = message + ' <br>  آدرس  دو بروز رسانی شد'
        }
        else
            message = message + ' <br>  آدرس دو تغییری نکرده است'


        
        MessagePEl.innerHTML = message
        MessagePEl.classList.remove('hidden')
        setTimeout(() => {
            MessagePEl.classList.add('hidden')
        }, 10000);
        

  


     

}






// console.log('in validation function');
// if(data['first_name'] !== '' && data['last-name'] !== '' && data['username'] !== ''  && data['phone-number'] !== ''){
//     // same inpusts get null to not get updated by the server
//     if(initial_data['first_name'] === data['first_name'])
//         data['first_name'] = 'null'
//     if(initial_data['last_name'] === data['last_name'])
//         data['last_name'] = 'null'
//     if(initial_data['username'] === data['username'])
//         data['username'] = 'null'
//     if(initial_data['phone_number'] === data['phone_number'])
//         data['phone_number'] = 'null'
    

    
//     if(data['address1'] !== '' && data['city1'] !== 'null' && data['zipcode1'] !== ''){
//         MessagePEl.classList.add('hidden')
//         ALLInfoLabelsEl.forEach(l => {
//             l.classList.remove('text-red-600')
//         });
//         Address1BoxEl.classList.remove('border-red-600')

//         if(initial_data['address1'] === data['address1'])
//         data['address1'] = 'null'
//         if(initial_data['city1'] === data['city1'])
//         data['city1'] = 'null'
//         if(initial_data['zipcode1'] === data['zipcode1'])
//         data['zipcode1'] = 'null'
//         return true
//     }else{
//         MessagePEl.innerHTML = 'آدرس یک باید کامل شود'
//         MessagePEl.classList.remove('hidden')
//         Address1BoxEl.classList.add('border-red-600')
//         return false
//     }
// }else{
//     MessagePEl.innerHTML = 'همه ی ورودی ها باید پر شوند!!!'
//     MessagePEl.classList.remove('hidden')
//     ALLInfoLabelsEl.forEach(l => {
//         l.classList.add('text-red-600')
//     });
//     return false
// }