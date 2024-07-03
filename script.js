// ****** select items **********

const form = document.querySelector(".grocery-form");
const alert = document.querySelector(".alert");
const grocery = document.getElementById("grocery");
const submitBtn = document.querySelector(".submit-btn");
const container = document.querySelector(".grocery-container");
const list = document.querySelector(".grocery-list");
const clearBtn = document.querySelector(".clear-btn");
// edit option
let editElement;
let editFlag = false;
let editID = "";

// ****** event listeners **********

// submit form
form.addEventListener("submit", addItem);
// clear list
clearBtn.addEventListener("click", clearItems);
// display items onload
window.addEventListener("DOMContentLoaded", setupItems);

// ****** functions **********

// add item
function addItem(e) {
    e.preventDefault();
    const value = grocery.value;
    const id = new Date().getTime().toString();

    if (value !== "" && !editFlag) {
        createListItem(id, value);
        // display alert
        displayAlert("item added to the list", "success");
        // show container
        container.classList.add("show-container");
        // set local storage
        addToLocalStorage(id, value);
        // set back to default
        setBackToDefault();
    } else if (value !== "" && editFlag) {
        editElement.innerHTML = value;
        displayAlert("value changed", "success");

        // edit local storage
        editLocalStorage(editID, value);
        setBackToDefault();
    } else {
        displayAlert("please enter value", "danger");
    }
}

// display alert
function displayAlert(text, action) {
    alert.textContent = text;
    alert.classList.add(`alert-${action}`);
    // remove alert
    setTimeout(function() {
        alert.textContent = "";
        alert.classList.remove(`alert-${action}`);
    }, 1000);
}

// clear items
function clearItems() {
    const items = document.querySelectorAll(".grocery-item");
    if (items.length > 0) {
        items.forEach(function(item) {
            list.removeChild(item);
        });
    }
    container.classList.remove("show-container");
    displayAlert("empty list", "danger");
    setBackToDefault();
    localStorage.removeItem("list");
}

// delete item
function deleteItem(e) {
    const element = e.currentTarget.parentElement.parentElement;
    const id = element.dataset.id;

    list.removeChild(element);

    if (list.children.length === 0) {
        container.classList.remove("show-container");
    }
    displayAlert("item removed", "danger");

    setBackToDefault();
    // remove from local storage
    removeFromLocalStorage(id);
}

// edit item
function editItem(e) {
    const element = e.currentTarget.parentElement.parentElement;
    // set edit item
    editElement = e.currentTarget.parentElement.previousElementSibling;
    // set form value
    grocery.value = editElement.innerHTML;
    editFlag = true;
    editID = element.dataset.id;
    //
    submitBtn.textContent = "edit";
}

// set back to defaults
function setBackToDefault() {
    grocery.value = "";
    editFlag = false;
    editID = "";
    submitBtn.textContent = "submit";
}

// ****** local storage **********

// add to local storage
function addToLocalStorage(id, value) {
    const grocery = { id, value };
    let items = getLocalStorage();
    items.push(grocery);
    localStorage.setItem("list", JSON.stringify(items));
}

function getLocalStorage() {
    return localStorage.getItem("list") ?
        JSON.parse(localStorage.getItem("list")) :
        [];
}

function removeFromLocalStorage(id) {
    let items = getLocalStorage();

    items = items.filter(function(item) {
        if (item.id !== id) {
            return item;
        }
    });

    localStorage.setItem("list", JSON.stringify(items));
}

function editLocalStorage(id, value) {
    let items = getLocalStorage();

    items = items.map(function(item) {
        if (item.id === id) {
            item.value = value;
        }
        return item;
    });
    localStorage.setItem("list", JSON.stringify(items));
}

// SETUP LOCALSTORAGE.REMOVEITEM('LIST');

// ****** setup items **********

function setupItems() {
    let items = getLocalStorage();

    if (items.length > 0) {
        items.forEach(function(item) {
            createListItem(item.id, item.value);
        });
        container.classList.add("show-container");
    }
}

function createListItem(id, value) {
    const element = document.createElement("article");
    let attr = document.createAttribute("data-id");
    attr.value = id;
    element.setAttributeNode(attr);
    element.classList.add("grocery-item");
    element.setAttribute("draggable", "true");
    element.innerHTML = `<p class="title">${value}</p>
            <div class="btn-container">
              <!-- edit btn -->
              <button type="button" class="edit-btn">
                <i class="fas fa-edit"></i>
              </button>
              <!-- delete btn -->
              <button type="button" class="delete-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `;
    // add event listeners to both buttons;
    const deleteBtn = element.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", deleteItem);
    const editBtn = element.querySelector(".edit-btn");
    editBtn.addEventListener("click", editItem);

    // add drag and drop event listeners
    element.addEventListener("dragstart", dragStart);
    element.addEventListener("dragover", dragOver);
    element.addEventListener("drop", drop);
    element.addEventListener("dragend", dragEnd);

    // append child
    list.appendChild(element);
}

// Drag and Drop Functions

let dragSrcEl = null;

function dragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drop(e) {
    e.stopPropagation(); // stops the browser from redirecting.
    if (dragSrcEl !== this) {
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');

        // Update event listeners for new elements
        const deleteBtnSrc = dragSrcEl.querySelector(".delete-btn");
        deleteBtnSrc.removeEventListener("click", deleteItem);
        deleteBtnSrc.addEventListener("click", deleteItem);
        const editBtnSrc = dragSrcEl.querySelector(".edit-btn");
        editBtnSrc.removeEventListener("click", editItem);
        editBtnSrc.addEventListener("click", editItem);

        const deleteBtnDst = this.querySelector(".delete-btn");
        deleteBtnDst.removeEventListener("click", deleteItem);
        deleteBtnDst.addEventListener("click", deleteItem);
        const editBtnDst = this.querySelector(".edit-btn");
        editBtnDst.removeEventListener("click", editItem);
        editBtnDst.addEventListener("click", editItem);
    }
    return false;
}

function dragEnd(e) {
    this.classList.remove('dragging');
}

// Update local storage order after drag and drop
function updateLocalStorageOrder() {
    const items = document.querySelectorAll(".grocery-item");
    const newItems = [];
    items.forEach(item => {
        const id = item.getAttribute("data-id");
        const value = item.querySelector(".title").textContent;
        newItems.push({ id, value });
    });
    localStorage.setItem("list", JSON.stringify(newItems));
}

list.addEventListener("dragend", updateLocalStorageOrder);
