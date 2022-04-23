const base_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users/";
const dataPanel = document.querySelector("#data-Panel");
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const myFriends = JSON.parse(localStorage.getItem('favoriteFriends'))

function renderMyFriendsList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-2">
      <div class="mt-3 mb-2">
        <div class="card">
          <img src="${item.avatar}" class="card-img-top" alt="...">
          <div class="card-body">
          <p class="card-text">${item.name + " " + item.surname}</p>
          </div>
          <div class="card-footer">
          <button type="button" class="btn btn-primary btn-show-myfriends" data-bs-toggle="modal" data-bs-target="#myFriends-modal" data-id="${item.id}">More</button>
          <button type="button" class="btn btn-danger delete-myFavorite-botton" data-id="${item.id}" id="addDeleteIcon">x</button>
          </div>
        </div>
      </div>
    </div>
  `;
  });
  dataPanel.innerHTML = rawHTML;
}

//More按鈕
dataPanel.addEventListener("click", function onImgClicked(event) {
  if (event.target.matches(".btn-show-myfriends")) {
    showMyFriendsModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".delete-myFavorite-botton")) {
    removeMyFriends(Number(event.target.dataset.id))
  }
});

//More modal
function showMyFriendsModal(id) {
  const modalTitle = document.querySelector("#myFriends-modal-title");
  const modalImg = document.querySelector(".modal-avatar");
  const modalBirthday = document.querySelector("#myFriends-modal-birthday");
  const modalRegion = document.querySelector("#myFriends-modal-region");
  const modalEmail = document.querySelector("#myFriends-modal-email");

  modalImg.src = "";

  axios.get(base_URL + id).then((response) => {
    const data = response.data;
    modalTitle.innerText = data.name + " " + data.surname;
    modalBirthday.innerText = "Birthday:" + data.birthday;
    modalRegion.innerText = "Region:" + data.region;
    modalEmail.innerText = "email:" + data.email;
    console.log(data.avatar);
    modalImg.src = data.avatar;
  });
}

//搜尋監聽器
searchForm.addEventListener('input', searchFormInput)
//input && submit
function searchFormInput(event) {
  event.preventDefault()
  const inputValue = searchInput.value.trim().toLowerCase()
  let fileredMyFriends = []
  fileredMyFriends = myFriends.filter((friends) => friends.name.toLowerCase().includes(inputValue) || friends.surname.toLowerCase().includes(inputValue))
  if (!fileredMyFriends.length) {
    document.querySelector('.pagination').innerHTML = ''
    return dataPanel.innerHTML = `<h1 class="text-center" style="line-height:300px";>請輸入存在的姓名!</h1>`
  }
  renderMyFriendsList(fileredMyFriends)
}
//移除收藏清單項目
function removeMyFriends(id) {
  if (!myFriends || !myFriends.length) return
  const myFriendsIndex = myFriends.findIndex((friends) => friends.id === id)
  if (myFriendsIndex === -1) return
  myFriends.splice(myFriendsIndex, 1)
  localStorage.setItem('favoriteFriends', JSON.stringify(myFriends))
  renderMyFriendsList(myFriends)
}

renderMyFriendsList(myFriends)