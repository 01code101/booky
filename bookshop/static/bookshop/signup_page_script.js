// signup form
MessageContainerEl = document.querySelector('.message_container')
BtnSignup = document.querySelector('.btn_signup_form')
username = document.querySelector('#username')
email = document.querySelector('#email')
password = document.querySelector('#password')
password2 = document.querySelector('#password2')


BtnSignup.addEventListener('click', () => {
    // console.log('clicked')
    if (password.value.length === 0 || password.value.length === 0 || password.value.length === 0 || password2.value.length === 0){
        console.log('لطفا اطلاعات را کامل وارد کنید')
    }
    else
    if((password.value === password2.value)){
        csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value
        url = 'http://127.0.0.1:8000/signup'
        fetch(url, {
            headers: {
                "X-CSRFToken": csrf_token,
            },
            method: "POST",
            body: JSON.stringify(
            {   username: username.value,
                email: email.value,
                password: password.value,        
            })})
            .then(resoponse => resoponse.json())
            .then(data => {
                //  // Initialize the DOM parser
                // // const parser = new DOMParser();
                // // Parse the text
                // // const doc = parser.parseFromString(html, "text/html");
                // document.documentElement.innerHTML = html
                // data = Object(data)
                if(data['creation'])
                    window.open('http://127.0.0.1:8000/')
                else{ 
                    html = ''
                    data['error_message'].forEach(error => {
                        html += `<div><p class='text-red-400'> ${error} </p></div>`
                    });
                    MessageContainerEl.innerHTML = html
                }
            })
        }
    else{
        console.log('رمز های ورودی باهم منطبق نیست')
    }
})