BtnAddToCartEl = document.querySelectorAll('.btn_add_to_cart');
CategorySelectBoxEl = document.querySelector('#category-select-box')
BooksContainerEl = document.querySelector('.books_container')
OrderBooksHighestEl = document.querySelector('.order_highest_price_btn')
OrderBooksLowestEl = document.querySelector('.order_lowest_price_btn')
OrderBooksnewestEl = document.querySelector('.order_newest_btn')
PaginationContainerEl = document.querySelector('.pagination_container')
SearchEl = document.querySelector('#search')

// if selectbox for category didnt change the defalut value will send to the server
let category_id = 'all'
let order = 'none'
// new page's number for pagination of all requests
let current_page = 1
let total_page
// this variable is use for  search
let search_word = 'none'

BtnAddToCartEl.forEach(element => {
    element.addEventListener('click', () =>{
        bookid = element.getAttribute("book-id")
        add_item_to_cart(bookid, element)
    })
});


CategorySelectBoxEl.addEventListener('change', () => {
    id = CategorySelectBoxEl.value
        category_id = id

        // pagination stuff
        // reset the current_page for the new content search
        current_page = 1

        get_books()

})

OrderBooksHighestEl.addEventListener('click', sort_books.bind('highest_price'))
OrderBooksLowestEl.addEventListener('click', sort_books.bind('lowest_price'))
OrderBooksnewestEl.addEventListener('click', sort_books.bind('newest'))

function sort_books() {

    // Guard clause for eleminating repeated requests to the server
    if (this[0] === order[0])
         return 0


    order = this
    OrderBooksHighestEl.classList.remove('text-green-600')
    OrderBooksLowestEl.classList.remove('text-green-600')
    OrderBooksnewestEl.classList.remove('text-green-600')
    if(order[0] === 'h'){
        OrderBooksHighestEl.classList.add('text-green-600')

    }
    else if(order[0] === 'l') {
        OrderBooksLowestEl.classList.add('text-green-600')
    }
    else{
        OrderBooksnewestEl.classList.add('text-green-600')
    }
    // pagination stuff
    // reset the current_page for the new content search
    current_page = 1

    get_books()
}


function get_books(){
    url = `http://127.0.0.1:8000/books/?category=${category_id}&order=${order}&page=${current_page}&q=${search_word}`
    // reset the search word
    search_word = 'none'
    fetch(url, {
        headers: {

        }, 
        method: 'GET',
    })
    .then(response => response.json())
    .then(content => {
            total_page = content['number_of_pages']
            update_pagination_ui()
            BooksContainerEl.innerHTML = ''
            content['books'].forEach(book => {
                html = `<div class="flex items-start justify-between max-w-[500px] p-4 mb-6 border border-gray-500 rounded-sm">
                <a href="${book.book_detail_url}">
                  <img class="w-[130px] h-[140px] opacity-90 hover:opacity-100  transation-all duration-150" src="${ book.img_full_url }" alt="${ book.title }">
                </a> 
                  <div class="ml-10">
                    <a href="${book.book_detail_url}">
                      <p class="hover:text-gray-600 text-xl font-bold text-gray-800 mb-5  transation-all duration-150">${ book.title }</p>
                    </a>
                    <div class="flex justify-end">
                      <p class="mx-2" id="author">${ book.author_full_name }</p>
                      <label class="text-sm" for="author"> :نویسنده  </label>
                    </div>
                    <div class="flex justify-end">
                      <p class="mx-2" id="category">${ book.category_name }</p>
                      <label class="text-sm" for="category"> :دسته کتاب </label>
                    </div>
                    <div class="flex justify-end ">
                      <p class="mx-2 font-semibold" id="price"> ${ book.price }</p>
                      <label class="text-sm " for="price"> :قیمت</label>
                     </div>
                    <button book-id="${ book.id }" class="btn_add_to_cart rounded-full border border-gray-200 bg-gray-400 p-1 mx-4 my-3 opacity-80 hover:opacity-100 hover:scale-125  transation-all duration-150">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </button>
                  </div>
              </div>`
                BooksContainerEl.insertAdjacentHTML("beforeend", html);

            });
            // set event listener for new button elements
            BooksContainerEl.querySelectorAll('.btn_add_to_cart').forEach(element => {
                element.addEventListener('click', () => {
                    bookid = element.getAttribute("book-id")
                    add_item_to_cart(bookid, element)
                })
            });
        })
}


draw_pagination_ui()

document.querySelector('.btn_paginator_first').addEventListener('click', () => change_page('first'))
document.querySelector('.btn_paginator_previous').addEventListener('click', () => change_page('previous'))
document.querySelector('.btn_paginator_next').addEventListener('click', () => change_page('next'))
document.querySelector('.btn_paginator_last').addEventListener('click', () => change_page('last'))


function change_page(op) {
    let old_page = current_page
    if(op === 'first')
        current_page = 1
    else if(op === 'previous' && old_page !== 1)
        current_page = old_page - 1
    else if(op === 'next' && old_page < total_page )
        current_page = old_page + 1
    else if(op === 'last')
        current_page = total_page

    if( old_page !== current_page){
        get_books()
    }
}


function update_pagination_ui() {
    PaginationContainerEl.querySelector('.current_page_span').innerHTML = current_page
    PaginationContainerEl.querySelector('.number_of_pages_span').innerHTML = total_page
}

// draw pagination ui
function draw_pagination_ui(){
    total_page = PaginationContainerEl.getAttribute('number-of-pages')
    html = `
    <p class="btn_paginator_first cursor-pointer text-lg  p-1 mx-2 hover:text-gray-600 border border-transparent hover:border-gray-500 rounded-sm">اولین</p>
    <p class="btn_paginator_previous cursor-pointer text-lg text-sky-700 p-1 mx-2 hover:text-gray-600 border border-transparent hover:border-gray-500 rounded-sm">قبلی</p>
    <span class="cursor-none">
      <span class='current_page_span'> ${current_page} </span> /  <span class='number_of_pages_span'> ${total_page} </span> 
    </span>
    <p class="btn_paginator_next cursor-pointer text-lg text-sky-700 p-1 mx-2 hover:text-gray-600 border border-transparent hover:border-gray-500 rounded-sm">بعدی</p>
    <p class="btn_paginator_last cursor-pointer text-lg  p-1 mx-2 hover:text-gray-600 border border-transparent hover:border-gray-500 rounded-sm">آخرین</p>
    `
    PaginationContainerEl.innerHTML = html
    
}

SearchEl.addEventListener('keydown', (event) => {
    value = SearchEl.value
    if(event['key'] === 'Enter' && value !== '' ){
        SearchEl.value = ''
        // we want a search happens for all books in all category
        category_id = 'all'
        search_word = value
        current_page = 1
        get_books()
    }
})