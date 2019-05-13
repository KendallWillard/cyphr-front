// Global Variables
const BASE_URL = 'https://fathomless-badlands-87760.herokuapp.com'
let user_store = [];
let cyphr_store = [];
let filtered_store = [];
let filterCyphrs = false;
let currentUser = {};
let currentCyphr = {};
let updateCyphrId = 0;
let newCyphrButton = document.querySelector('#new-cyphr-button');
let profileContainer = document.querySelector('#profile-container');
let homeButton = document.querySelector('#home-button');
let createUserForm = document.querySelector('#create-user-form');
let newUserButton = document.querySelector('#new-user-button');
let createUserButton = document.querySelector('#create-user-button');
let createCyphrForm = document.querySelector('#create-cyphr-form');
let cyphrDisplayContainer = document.querySelector('#cyphr-display-container');
let cyphrRows; 
let bgColor;
let searchIndex;
let cyphrShowPage = document.querySelector('#cyphr-show-page');
let searchButton = document.querySelector('.form-inline');
let userLoginForm = document.querySelector('#user-login-form');
let navLoginButton = document.querySelector('#login-logout-button')
let usernameInput = document.querySelector('#username-input');
let updateCyphrButton = document.querySelector('#update-cyphr-button');
let deleteCyphrButton = document.querySelector('#delete-cyphr-button');
let createCyphrButton = document.querySelector('#create-cyphr-button');
let updateCyphrForm = document.querySelector('#update-cyphr-form');


// Wait for all the api data to load before selecting it
function addATimeout() {
    setTimeout(function() {
        cyphrRows = document.querySelector('#cyphr-display-container');
            cyphrRows.addEventListener('click', event => {
                event.stopImmediatePropagation(); // This line of code fixed a bug that when a cyphr was selected
                                                  // it would sometimes fire the update patch multiple times
                if(event.target.className === "card-title") {
                    showCyphrPage();
                    renderCyphrPage(event.target.innerHTML);
                }
                
            }, false) // Set handler to use bubbling instead of capturing
    }, 1500);
}

// Event listener for search bar
searchButton.addEventListener('submit', event => {
    event.preventDefault();
    let searchValue = (document.querySelector('#search-button').value);
    getSearchList(searchValue)
    searchButton.reset();
})

// Event listener for create new cyphr button
createCyphrForm.addEventListener('submit', event => {
    event.preventDefault();
    postCyphr(getCyphrFormData())
    // getCyphrs()
    cyphr_store.push(getCyphrFormData())
    cyphr_store[cyphr_store.length - 1].id = cyphr_store[cyphr_store.length - 2].id + 1;
    createCyphrForm.reset();
    renderCyphrs();
    showHomePage();
})

// Event listener for create new user button
createUserForm.addEventListener('submit', event => { 
    event.preventDefault(); 
    user_store.push(getUserFormData());
    currentUser = user_store.find(elem => elem.username === usernameInput.value) // Store currentUser after a new one is created
    postUser(user_store[user_store.length -1 ])
    createUserForm.reset();
    showUserLoginPage();
})

// event listener for nav bar new user button
newUserButton.addEventListener('click', event => {
    showCreateUserPage();
})

// event listener for nav bar home button
homeButton.addEventListener('click', event => {
    showHomePage();
})

// event listener for nav bar new cyphr button
newCyphrButton.addEventListener('click', event => {
    showCreateCyphrPage();
})

// event listener for nav bar login/logout button
navLoginButton.addEventListener('click', event => {
    event.preventDefault();
    showUserLoginPage();
})

// event listener for LOGIN form page
userLoginForm.addEventListener('submit', event => {
    event.preventDefault();
    currentUser = user_store.find(elem => elem.username === usernameInput.value)
    showHomePage();
    userLoginForm.reset();
})

// Event listener for update cyphr show page button
updateCyphrButton.addEventListener('click', event => {
    event.preventDefault();
    renderUpdateCyphrPage()
})

// Event listener for delete cyphr show page button
deleteCyphrButton.addEventListener('click', event => {
    event.preventDefault();
    deleteCyphr();
    let indexToDestroy = cyphr_store.map(elem => elem.description).indexOf(currentCyphr.description);
    cyphr_store.splice(indexToDestroy, 1);
    showHomePage();
    renderCyphrs();
    
})

// Event listener for update cyphr FORM page
updateCyphrForm.addEventListener('submit', event => {
    event.preventDefault();
    let cyphrToUpdate = getCyphrUpdateFormData();
    //find index of cyphr to update
    let indexToUpdate = cyphr_store.map(elem => elem.description).indexOf(cyphrToUpdate.description);
    updateCyphrId = cyphr_store[indexToUpdate].id;
    cyphr_store[indexToUpdate] = cyphrToUpdate;
    updateCyphr(cyphrToUpdate)
    showHomePage();
    renderCyphrs();
})

//Retreive the new user form data
function getUserFormData() {
    return {
        first_name:  document.querySelector('#validationDefault01').value,
        last_name: document.querySelector('#validationDefault02').value,
        username: document.querySelector('#validationDefaultUsername').value,
        address: document.querySelector('#validationDefault03').value,
        city: document.querySelector('#validationDefault04').value,
        state: document.querySelector('#validationDefault05').value,
        zip: document.querySelector('#validationDefault06').value,
        email: document.querySelector('#validationDefault07').value,
        phone_number: document.querySelector('#validationDefault08').value,
        image_url: document.querySelector('#validationDefault09').value
    }
}

// Retrieve the new cyphr form data
function getCyphrFormData() {
    return {
        title:  document.querySelector('#validationDefault10').value,
        description: document.querySelector('#cyphr-description').value,
        location: document.querySelector('#validationDefault13').value,
        email: document.querySelector('#validationDefault11').value,
        phone: document.querySelector('#validationDefault12').value,
        tags: document.querySelector('#validationDefault14').value,
        forSale: document.querySelector('#exampleRadios1').checked,
        image: document.querySelector('#validationDefault15').value,
        postTime: "2019-05-19T07:18:00.000Z",
        expTime: "2019-05-19T07:18:00.000Z",
        user_id: currentUser.id,
        price: Number(document.querySelector('#price-validation').value),
        views: 0
    }
}

// Retrieve the cyphr update form data
function getCyphrUpdateFormData() {
    return {
        title:  document.querySelector('#validationDefault20').value,
        description: document.querySelector('#cyphr-update-description').value,
        location: document.querySelector('#validationDefault23').value,
        email: document.querySelector('#validationDefault21').value,
        phone: document.querySelector('#validationDefault22').value,
        tags: document.querySelector('#validationDefault24').value,
        forSale: document.querySelector('#Radios1').checked,
        image: document.querySelector('#validationDefault25').value,
        postTime: "2019-05-19T07:18:00.000Z",
        expTime: "2020-05-19T07:18:00.000Z",
        user_id: currentUser.id,
        price: Number(document.querySelector('#price-update-validation').value)
    }
}

// Display all the cyphrs currently stored on the local network
function renderCyphrs() {
    deleteAllCyphrs();
    addCyphrHtml();
}

// display the cyphr show page and update the cyphr views
function renderCyphrPage(target) {
    currentCyphr = cyphr_store.find(elem => elem.title === target);    
    updateCyphrViews(currentCyphr); // PATCH REQUEST to update cyphr views in database
    let image = cyphrShowPage.querySelector('img');
    image.src = currentCyphr.image;
    let h5 = cyphrShowPage.querySelector('.card-title');
    h5.innerHTML = currentCyphr.title;
    let p = cyphrShowPage.querySelector('.card-text');
    p.innerHTML = currentCyphr.description;
    let location = cyphrShowPage.querySelector('#location-cyphr')
    location.innerHTML = `Location: ${currentCyphr.location}`;
    let email = cyphrShowPage.querySelector('#email-cyphr');
    email.innerHTML = `Email: ${currentCyphr.email}`;
    let phone = cyphrShowPage.querySelector('#phone-cyphr');
    phone.innerHTML = `Phone: ${currentCyphr.phone}`;
    let expires = cyphrShowPage.querySelector('#expire-cyphr');
    expires.innerHTML = `Expires: ${currentCyphr.expTime}`;
    let price = cyphrShowPage.querySelector('#price-cyphr');
    price.innerHTML = `Price: $${currentCyphr.price}`;
}


// Fill in a cyphr container with the cyphr information from the cyphr form
function addCyphrHtml() {
    filterCyphrs ? searchIndex = filtered_store : searchIndex = cyphr_store
    for(cyphr of searchIndex) {
        cyphr.forSale ? bgColor = "bg-danger" : bgColor = "bg-success"
        let div = document.createElement('div')
        div.setAttribute("class", "cyphr-div");
        div.innerHTML = `
        <div class="row">
            <div class="offset-md-3 col-12 col-md-8">
                <div class="card mb-3 card text-white ${bgColor} mb-3" id="cyphr-container" style="max-width: 540px;">
                    <div class="row no-gutters">
                        <div class="col-md-4" >
                            <img src="${cyphr.image}" id="cyphr-image" class="card-img" alt="...">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${cyphr.title}</h5>
                                <p class="card-text">${cyphr.description}</p>
                                <p class="card-location">${cyphr.location}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>  
        `
        cyphrDisplayContainer.appendChild(div);
    }
    filterCyphrs = false;
}

// Fetch all the cyphrs from the backend rails api server
function getCyphrs() {
    cyphr_store = []
    return fetch(`${BASE_URL}/api/v1/cyphrs`)
        .then(response => response.json())
        .then(result => {
            result.map(cyphr => cyphr_store.push(cyphr));
            renderCyphrs();
        })
}

// Fetch all the users from the backend rails api server
function getUsers() {
    return fetch(`${BASE_URL}/api/v1/users`)
        .then(response => response.json())
        .then(result => {
            result.map(user => user_store.push(user));
        })
}

// Save the user to the api database
function postUser(user) {
    fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .catch(error => console.error(error))
}

// Save the cyphr to the api databse
function postCyphr(cyphr) {
        fetch(`${BASE_URL}/api/v1/cyphrs`, {
            method: 'POST',
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({cyphr})
        })
        .catch(error => console.error(error))
}

// Update the cyphr and store it in the database
function updateCyphr(cyphr) {
    cyphr.id = updateCyphrId;
    fetch(`${BASE_URL}/api/v1/cyphrs/${updateCyphrId}`, {
        method: 'PATCH',
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cyphr)
    })
    .catch(error => console.error(error))
}

// Update the cyphr views in the database
function updateCyphrViews(myObj) {
    let cyphrViews = myObj.views + 1;
    //Update cyphr_store to reflect database
    cyphr_store.find(elem => elem.id === myObj.id).views += 1;
    let cyphr = {
        views: cyphrViews,
        id: myObj.id
    }
    fetch(`${BASE_URL}/api/v1/cyphrs/${myObj.id}`, {
        method: 'PATCH',
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cyphr)
    })
    .catch(error => console.error(error))
}

// Remove cyphr from rails api database
function deleteCyphr() {
    fetch(`${BASE_URL}/api/v1/cyphrs/${currentCyphr.id}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': `${BASE_URL}`,
            'Access-Control-Allow-Credentials': 'true'

        },
        body: JSON.stringify(cyphr)
    })
    .catch(error => console.error(error))
}

// Display the search results on the home apge
function getSearchList(searchInput) {
    filtered_store = cyphr_store.filter(elem => elem.tags.includes(searchInput));
    filterCyphrs = true;
    showHomePage();
    renderCyphrs();
}

// Render the update cyphr form page
function renderUpdateCyphrPage() {
    showCyphrUpdatePage();
    allocateUpdateValues();
}

// Render the cyphr views list
function renderCyphrViewList() {
    setCyphrViewList();
    let userCyphrs = getUserCyphrs();
    for(let i = 0; i < userCyphrs.length; i++) {
        let cyphrListTitle = document.querySelector(`#cyphr-${i}`)
        cyphrListTitle.innerHTML = userCyphrs[i].title + `
            <span class="badge badge-primary badge-pill" id="user-cyphr-${i}">${userCyphrs[i].views}</span>
        `
    }
}

// Set att the cyphr view list values to an empty string and 0, respectively
function setCyphrViewList() {
    for(let i = 0; i < 6; i++) {
        let cyphrListTitle = document.querySelector(`#cyphr-${i}`)
        cyphrListTitle.innerHTML = "" + `
            <span class="badge badge-primary badge-pill" id="user-cyphr-${i}"></span>
        `
    }
}
// Self explanatory
function showCreateUserPage() {
    profileContainer.style.display = "none";
    createUserForm.style.display = "";
    createCyphrForm.style.display = "none";
    cyphrShowPage.style.display = "none";
    userLoginForm.style.display = "none"
    updateCyphrForm.style.display = "none";
}

function showHomePage() {
    getUserInfo();
    addATimeout();
    renderCyphrViewList();
    profileContainer.style.display = "";
    createUserForm.style.display = "none";
    cyphrShowPage.style.display = "none";
    createCyphrForm.style.display = "none";
    userLoginForm.style.display = "none"
    updateCyphrForm.style.display = "none";
}

function showCreateCyphrPage() {
    createUserForm.style.display = "none";
    profileContainer.style.display = "none";
    cyphrShowPage.style.display = "none";
    createCyphrForm.style.display = "";
    userLoginForm.style.display = "none"
    updateCyphrForm.style.display = "none";

}

function showCyphrPage() {
    createUserForm.style.display = "none";
    profileContainer.style.display = "none";
    createCyphrForm.style.display = "none";
    cyphrShowPage.style.display = "";
    userLoginForm.style.display = "none";
    updateCyphrForm.style.display = "none";

}

function showUserLoginPage() {
    userLoginForm.style.display = "";
    createUserForm.style.display = "none";
    profileContainer.style.display = "none";
    createCyphrForm.style.display = "none";
    cyphrShowPage.style.display = "none";
    updateCyphrForm.style.display = "none";
}

function showCyphrUpdatePage() {
    userLoginForm.style.display = "none";
    createUserForm.style.display = "none";
    profileContainer.style.display = "none";
    createCyphrForm.style.display = "none";
    cyphrShowPage.style.display = "none";
    updateCyphrForm.style.display = "";
}


function getUserInfo() {
    let image = profileContainer.querySelector('img');
    image.src = currentUser.image_url;
    let name = profileContainer.querySelector('.card-title');
    name.innerHTML = currentUser.first_name + " " + currentUser.last_name;
}

function deleteAllCyphrs() {
    while(cyphrDisplayContainer.firstElementChild) {
        cyphrDisplayContainer.removeChild(cyphrDisplayContainer.firstElementChild)
    }
}

function getUserCyphrs() {
    return cyphr_store.filter(elem => elem.user_id === currentUser.id)
}

// prepopulate update form with current values
function allocateUpdateValues() {
    let title = document.querySelector('#validationDefault20');
    title.value = currentCyphr.title;
    let description = document.querySelector('#cyphr-update-description');
    description.value = currentCyphr.description;
    let email = document.querySelector('#validationDefault21');
    email.value = currentCyphr.email;
    let phone = document.querySelector('#validationDefault22');
    phone.value = currentCyphr.phone;
    let location = document.querySelector('#validationDefault23');
    location.value = currentCyphr.location;
    let tags = document.querySelector('#validationDefault24');
    tags.value = currentCyphr.tags;
    let image_url = document.querySelector('#validationDefault25');
    image_url.value = currentCyphr.image;
    let price = document.querySelector('#price-update-validation');
    price.value = currentCyphr.price;
}

getCyphrs();
getUsers();























// function previewFile() {
//   let preview = document.createElement('img');
//   let file = document.querySelector('input[type=file]').files[0];
//   let reader = new FileReader();

//   reader.addEventListener("load", function () {
//     preview.src = reader.result;
//   }, false);

//   if (file) {
//     console.log('hola')
//     reader.readAsDataURL(file);
//   }
// }