const base_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users/"
const dataPanel = document.querySelector("#data-Panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const searchUser = document.querySelector('#search-user')
const inputOption = document.querySelector('#input-option')
const inputAge = document.querySelector('#input-age')
const navbar = document.querySelector('.navbar')
const myFriends = []
let userGender = ''
let userAge = ''
let filteredMyFriends = []
let newfilteredMyFriends = myFriends
const myFriends_PER_PAGE = 20
const mynewFriends = JSON.parse(localStorage.getItem('favoriteFriends'))

axios.get(base_URL).then((response) => {
  myFriends.push(...response.data.results)
  renderPaginator(myFriends.length)
  renderMyFriendsList(getMyFriendsPage(1))
});

function renderMyFriendsList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-2">
      <div class="mt-3 mb-2">
        <div class="card shadow-sm rounded">
          <img src="${item.avatar}" class="card-img-top" alt="...">
          <div class="card-body">
          <p class="card-text">${item.name + " " + item.surname}</p>
          </div>
          <div class="card-footer">
          <button type="button" class="btn btn-primary btn-show-myfriends" data-bs-toggle="modal" data-bs-target="#myFriends-modal" data-id="${item.id}">More</button>
          <button type="button" class="btn btn-success add-Delete-Icon" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
  `;
  });
  dataPanel.innerHTML = rawHTML;
}

//More && add按鈕
dataPanel.addEventListener("click", function onImgClicked(event) {
  if (event.target.matches(".btn-show-myfriends")) {
    showMyFriendsModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".add-Delete-Icon")) {
    addToFavorite(Number(event.target.dataset.id))
  }
});

//More modal
function showMyFriendsModal(id) {
  const modalTitle = document.querySelector("#myFriends-modal-title");
  const modalImg = document.querySelector(".modal-avatar");
  const modalBirthday = document.querySelector("#myFriends-modal-birthday");
  const modalRegion = document.querySelector("#myFriends-modal-region");
  const modalAge = document.querySelector("#myFriends-modal-age");
  const modalEmail = document.querySelector("#myFriends-modal-email");

  modalImg.src = "";

  axios.get(base_URL + id).then((response) => {
    const data = response.data;
    modalTitle.innerText = data.name + " " + data.surname;
    modalBirthday.innerText = "Birthday:" + data.birthday;
    modalRegion.innerText = "Region:" + data.region;
    modalAge.innerText = "Age:" + data.age;
    modalEmail.innerText = "email:" + data.email;
    modalImg.src = data.avatar;
  });
}

//搜尋監聽器
searchForm.addEventListener('input', searchFormInput)
//input && submit
function searchFormInput(event) {
  event.preventDefault()
  const inputValue = searchInput.value.trim().toLowerCase()
  filteredMyFriends = newfilteredMyFriends.filter((friends) => friends.name.toLowerCase().includes(inputValue) || friends.surname.toLowerCase().includes(inputValue))
  console.log(filteredMyFriends)
  if (!filteredMyFriends.length) {
    document.querySelector('.pagination').innerHTML = ''
    return dataPanel.innerHTML = `<h1 class="text-center" style="line-height:300px";>請輸入存在的姓名!</h1>`
  }
  renderMyFriendsList(getMyFriendsPage(1))
  renderPaginator(filteredMyFriends.length)
}


//添加到收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  const friends = myFriends.find((friends) => friends.id === id)
  if (list.some((friends) => friends.id === id)) {
    return alert('已經在收藏清單！')
  }
  list.push(friends)
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
  renderMyFriendsList(myFriends);
}

//切割頁數
function getMyFriendsPage(page) {
  const data = filteredMyFriends.length ? filteredMyFriends : myFriends
  const startIndex = (page - 1) * myFriends_PER_PAGE
  return data.slice(startIndex, startIndex + myFriends_PER_PAGE)
}

//分頁器
const paginator = document.querySelector('.pagination')
function renderPaginator(totalAmount) {
  const numberPerPage = Math.ceil(totalAmount / myFriends_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberPerPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMyFriendsList(getMyFriendsPage(page));
})
//篩選器按鈕
searchUser.addEventListener('click', function filterUser(event) {
  searchInput.value = ''
  if (event.target.matches('#filter-submit')) {
    checkUserFilter()
    if (!newfilteredMyFriends.length) {
      document.querySelector('.pagination').innerHTML = ''
      return dataPanel.innerHTML = `<h1 class="text-center" style="line-height:800px";>查無符合條件用戶!</h1>`
    }
    renderMyFriendsList(getMyFriendsPage(1))
    renderPaginator(filteredMyFriends.length)
  } else if (event.target.matches('#filter-clear')) {
    filteredMyFriends = myFriends
    newfilteredMyFriends = myFriends
    renderMyFriendsList(getMyFriendsPage(1))
    renderPaginator(myFriends.length)
  }
})
//篩選性別＆＆年齡
function checkUserFilter() {
  let userGender = inputOption.value
  let userAge = Number(inputAge.value)
  if (inputAge.value === '0' && userAge.length!==0) return alert('請勿輸入非年齡的數字')
  if (userGender === 'no' || userGender === '性別選擇：') {
    if (inputAge.value.length === 0) {
      filteredMyFriends = myFriends
      newfilteredMyFriends = myFriends
    } else {
      newfilteredMyFriends = myFriends.filter((friends) => friends.age === userAge)
      filteredMyFriends = myFriends.filter((friends) => friends.age === userAge)
    }
  } else {
    if (isNaN(userAge)) return alert('請勿輸入非年齡的數字')
    if (!userAge) {
      newfilteredMyFriends = myFriends.filter((friends) => friends.gender === userGender)
      filteredMyFriends = myFriends.filter((friends) => friends.gender === userGender)
    }
    else {
      newfilteredMyFriends = myFriends.filter((friends) => friends.gender === userGender && friends.age === userAge)
      filteredMyFriends = myFriends.filter((friends) => friends.gender === userGender && friends.age === userAge)
    }
  }
}
//清空按鈕
navbar.addEventListener('click', (event) => {
  if (event.target.matches('#filter-clear')) {
    searchInput.value = ''
    inputAge.value = ''
    inputOption.value = '性別選擇：'
    filteredMyFriends = myFriends
    newfilteredMyFriends = myFriends
    renderMyFriendsList(getMyFriendsPage(1))
    renderPaginator(myFriends.length)
  }
})


