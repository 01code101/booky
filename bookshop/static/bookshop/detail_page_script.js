'strict mode'
BtnWishlistEl = document.querySelector('.btn_wishlist')
BtnLikeEl = document.querySelector('.btn_like')
NumberOfLikesEl = document.querySelector('.number_of_likes')
BtnAddToCartEl = document.querySelector('.btn_add_to_cart')
BtnSubmitCommentEl = document.querySelector('.btn_submit_comment')
CommentTextAreaEl = document.querySelector('.comment_textarea')
CommentsContainerEl = document.querySelector('.comments_container')
MessageContainerEl = document.querySelector('.message_container')
MessagePEl = document.querySelector('.message_p')

csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value



BtnLikeEl.addEventListener('click',() => {  like_book()  })
BtnWishlistEl.addEventListener('click',() => {  add_to_wishlist()  })
BtnAddToCartEl.addEventListener('click',() => { 
    url = window.location.href 
    // url.split('/') ==> ['http:', '', '127.0.0.1:8000', 'book', '12', '']
    bookid = url.split('/')[4]
    add_item_to_cart(bookid)  })
if(BtnSubmitCommentEl)
BtnSubmitCommentEl.addEventListener('click',() => {  add_comment()  })



function like_book() {
    url = window.location.href + 'likes/'
    request_method = ''
    status_code = 0

    if (BtnLikeEl.classList.contains('user_liked')){
        request_method = 'DELETE'
    }
    else{
        request_method = 'POST'
    }
    console.log(request_method);
    fetch(url, {
        headers: {
            "X-CSRFToken": csrf_token,
        },
        method: request_method,
    })
    .then(response => {
        status_code = response.status
        return  response.json() 
    } )
    .then(data => {
        console.log(status_code);
        if (status_code === 201){
                BtnLikeEl.classList.remove('bg-rose-100')
                BtnLikeEl.classList.add('bg-rose-500')
                BtnLikeEl.classList.add('user_liked')
                NumberOfLikesEl.innerHTML = parseInt(NumberOfLikesEl.innerHTML) + 1
            }
        else if(status_code === 200){
                BtnLikeEl.classList.remove('bg-rose-500')
                BtnLikeEl.classList.remove('user_liked')      
                BtnLikeEl.classList.add('bg-rose-100')
                NumberOfLikesEl.innerHTML = parseInt(NumberOfLikesEl.innerHTML) - 1
        }
        else if (status_code === 401){
            show_message('لطفا وارد شوید')
        }
    })
}



function add_to_wishlist(){
   url = window.location.href + 'wish/'
   request_method = ''
   status_code = 0
   request_method = 'POST'
   if (BtnWishlistEl.classList.contains('user_wishbook')){

    request_method = 'DELETE'
   }

    console.log(request_method);
    fetch(url, {
        headers: {
            "X-CSRFToken": csrf_token,
        },
        method: request_method,
    })
    .then(response => {
        status_code = response.status
        return  response.json() 
    } )
    .then(data => {
        console.log(status_code);
        if (status_code === 201){
                BtnWishlistEl.classList.add('bg-sky-500')
                BtnWishlistEl.classList.add('user_wishbook')
            }
        else if(status_code === 200){
                BtnWishlistEl.classList.remove('bg-sky-500')
                BtnWishlistEl.classList.remove('user_wishbook')      
        }
        else if (status_code === 401){
            show_message('لطفا وارد شوید')
        }
    })
}

function add_comment() {
    text = CommentTextAreaEl.value
    if (text !== ''){
        url = window.location.href + 'comments/'
   status_code = 0
    fetch(url, {
        headers: {
            "X-CSRFToken": csrf_token,
        },
        method: 'POST',
        body: JSON.stringify({
            text: text
        })
    })
    .then(response => {
        status_code = response.status
        return  response.json() 
    } )
    .then(data => {
        console.log(status_code);
        if (status_code === 201){
            CommentTextAreaEl.value = 'نظر شما ثبت شد'
            CommentTextAreaEl.classList.add('text-green-600')
            setTimeout(() => {
                CommentTextAreaEl.classList.remove('text-green-600')
                CommentTextAreaEl.value = ''
            }, 4000);
            get_all_comments()
        }
        else if(status_code === 429){
            CommentTextAreaEl.value = 'شما مجاز به ارسال نظر مجدد تا 1 ساعت آینده نخواهید بود'
            CommentTextAreaEl.classList.add('text-red-600')
            setTimeout(() => {
                CommentTextAreaEl.classList.remove('text-red-600')
                CommentTextAreaEl.value = ''
            }, 7000);
        }
    })
    }
}

function get_all_comments() {

    status_code = 0
    url = window.location.href + 'comments/'
    fetch(url, {
        method: 'GET'

    })
    .then(response => {
        status_code = response.status
        return  response.json() 
    } )
    .then(data => {
        if (status_code === 200){
            comments = data['comments']
            html  = ''
            console.log(comments);
            comments.forEach(cm => {
                console.log(cm);
                html = html + `<div class="border-1 border-gray-200 p-1 my-2 rounded-md border-2 border-green-100">
                <p class="font-bold flex justify-end">
                    ${cm.user__username}
                    <svg class="w-4 h-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                      </p>
                      <p class="m-1 text-gray-700 max-w-[300px]">
                      ${cm.comment_text}
                      </p>
              </div>`
            });

            CommentsContainerEl.innerHTML = html
            
        }
        
    })
}

function show_message(ms) {
    MessageContainerEl.classList.remove('hidden')
    MessagePEl.innerHTML = ms
    setTimeout(() => {
        MessageContainerEl.classList.add('hidden')
    }, 3000);
}