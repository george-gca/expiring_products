// TODO: when adding or editing items, only update the list, don't reload the whole list

import { clearDatabase, exportToJson, importFromJson } from './idb-backup-and-restore.mjs'

// #region Global variables

var DateTime = luxon.DateTime;

const FOODS_TABLE = "foods_os";
const foodsListElement = document.getElementById('foods-list');
let foodItems = {};
let sortedFoodItems = [];

const MEDICINES_TABLE = "medicines_os";
const medicinesListElement = document.getElementById('medicines-list');
let medicineItems = {};
let sortedMedicineItems = [];

const FOODS_HISTORY_TABLE = "foods_history_os";
const MEDICINES_HISTORY_TABLE = "medicines_history_os";

// Create an instance of a db object for us to store the open database in
let db;

// #endregion

// #region UI Event listeners

// finds when the add item modal is shown and clear the form
// also update needed information
document.getElementById('add-item-modal').addEventListener('shown.bs.modal', function () {
  // set the correct form action
  const formElement = document.getElementById('add-item-modal').querySelector('form');
  formElement.addEventListener("submit", addItemFromForm);

  // clear the form
  const nameElement = document.getElementById('new-item-name');
  nameElement.value = "";

  const quantityElement = document.getElementById('new-item-quantity');
  quantityElement.value = "";

  const durationElement = document.getElementById('new-item-duration');
  durationElement.value = "";

  // update the date input and its min value to the current date
  const expiringDateElement = document.getElementById('new-item-expiring-date');
  const currentDate = new Date();
  expiringDateElement.min = currentDate.toISOString().split('T')[0];
  expiringDateElement.valueAsDate = currentDate;

  // clear the datalist options
  const datalistOptions = document.getElementById('datalistOptions');
  while (datalistOptions.firstChild) {
    datalistOptions.removeChild(datalistOptions.firstChild);
  }

  // add the items from the history to the datalist
  const tab = document.querySelector('.nav-link.active').id;
  let table;

  if (tab === "foods-tab") {
    table = FOODS_HISTORY_TABLE;
  } else if (tab === "medicines-tab") {
    table = MEDICINES_HISTORY_TABLE;
  } else {
    console.error("Tab not found:", tab);
  }

  // open our object store and then get a cursor - which iterates through all the
  // different data items in the store
  let objectStore;
  try {
    objectStore = db.transaction([table]).objectStore(table);
  } catch (error) {
    console.error("Error opening object store", table, ":", error);
  }

  objectStore.openCursor().addEventListener("success", (e) => {
    // Get a reference to the cursor
    const cursor = e.target.result;

    // If there is still another data item to iterate through, keep running this code
    if (cursor) {
      const option = document.createElement("option");
      datalistOptions.appendChild(option);
      option.value = cursor.value.name;
      option.setAttribute("data-value", cursor.value.duration);
      // Iterate to the next item in the cursor
      cursor.continue();
    }
  });
});

// finds when the edit item modal is shown and update the modal with the item data
// also update needed information
document.getElementById('edit-item-modal').addEventListener('show.bs.modal', function (event) {
  // get the button that triggered the modal
  const button = event.relatedTarget;
  const listElementId = button.parentElement.parentElement.id;
  let items;

  if (listElementId === "foods-list") {
    items = foodItems;
  } else if (listElementId === "medicines-list") {
    items = medicineItems;
  }

  // update the modal with the item data
  const id = button.getAttribute('data-bs-id');
  const item = items[id];

  const name = item.name;
  const quantity = item.quantity;
  const formElement = document.getElementById('edit-item-modal').querySelector('form');

  formElement.setAttribute("data-item-id", id);
  formElement.setAttribute("data-list-id", listElementId);
  formElement.addEventListener("submit", editItem);

  document.getElementById('edit-item-modal-title').textContent = 'Editar ' + name;

  const openedItemsElement = document.getElementById('opened-items')
  const consumedItemsElement = document.getElementById('consumed-items')
  const discardedItemsElement = document.getElementById('discarded-items')

  openedItemsElement.value = 0;
  consumedItemsElement.value = 0;
  discardedItemsElement.value = 0;

  openedItemsElement.max = quantity;
  consumedItemsElement.max = quantity;
  discardedItemsElement.max = quantity;

  // make sure that the sum of opened, consumed and spoiled items is less than or equal to the quantity
  formElement.addEventListener('submit', function (event) {
    const openedItems = parseInt(document.getElementById('opened-items').value);
    const consumedItems = parseInt(document.getElementById('consumed-items').value);
    const spoiledItems = parseInt(document.getElementById('discarded-items').value);

    if (openedItems + consumedItems + spoiledItems > quantity) {
      event.preventDefault();
      alert('A soma dos itens abertos, consumidos e descartados deve ser menor ou igual à quantidade');
    } else if (openedItems + consumedItems + spoiledItems == 0) {
      event.preventDefault();
    }
  });
});

document.getElementById('new-item-name').addEventListener('change', function (event) {
  const datalist = document.getElementById('new-item-name');
  const options = Array.from(document.getElementById('datalistOptions').children);

  options.forEach((option) => {
    console.log(option);
    if (option.value === datalist.value) {
      const duration = option.getAttribute("data-value");
      document.getElementById('new-item-duration').value = duration;
      return;
    }
  });
});

function editItem(e) {
  // prevent default - we don't want the form to submit in the conventional way
  e.preventDefault();

  const listId = e.target.getAttribute("data-list-id");
  const listElement = document.getElementById(listId);
  let items;
  let sortedItems;
  let table;

  if (listId === "foods-list") {
    items = foodItems;
    sortedItems = sortedFoodItems;
    table = FOODS_TABLE;
  } else if (listId === "medicines-list") {
    items = medicineItems;
    sortedItems = sortedMedicineItems;
    table = MEDICINES_TABLE;
  } else {
    console.error("List not found");
    console.log(listElement);
  }

  const id = Number(e.target.getAttribute("data-item-id"));
  const openedItems = parseInt(document.getElementById('opened-items').value);
  const consumedItems = parseInt(document.getElementById('consumed-items').value);
  const discardedItems = parseInt(document.getElementById('discarded-items').value);

  if (openedItems > 0) {
    openItem(id, openedItems, items, table);
  }

  if (consumedItems > 0) {
    consumeItem(id, consumedItems, items, table);
  }

  if (discardedItems > 0) {
    discardItem(id, discardedItems, items, table);
  }

  displayData(listElement, items, sortedItems, table);
}

function openItem(id, quantity, items, table) {
  const today = DateTime.now();

  let expiringDate;
  if (items[id].expiring_date < today) {
    localStorage.setItem("expired_unopened_items", localStorage.getItem("expired_unopened_items") + quantity);
    expiringDate = items[id].expiring_date;
    // console.log('Opened expired item');
  } else {
    expiringDate = today.plus({days: items[id].duration}).endOf('day');
    if (expiringDate > items[id].expiring_date) {
      expiringDate = items[id].expiring_date;
      // console.log('Opened item will expire before the duration');
    } else {
      // console.log('Opened item');
    }
  }

  if (items[id].quantity > quantity) {
    addData({
      name: items[id].name,
      quantity: quantity,
      expiring_date: expiringDate.toISO(),
      duration: items[id].duration,
      date_opened: today.toISO(),
      opened: true
    }, table);

    // let editedItem = { ...items[id] };
    let editedItem = items[id];
    editedItem.quantity -= quantity;
    editData(editedItem, table);
  } else {
    let editedItem = items[id];
    editedItem.expiring_date = expiringDate;
    editedItem.date_opened = today;
    editedItem.opened = true;
    editData(editedItem, table);
  }
}

function consumeItem(id, quantity, items, table) {
  const today = DateTime.now();

  if (items[id].expiring_date < today) {
    localStorage.setItem("consumed_expired_items", localStorage.getItem("consumed_expired_items") + quantity);
  } else {
    localStorage.setItem("consumed_items", localStorage.getItem("consumed_items") + quantity);
  }

  if (items[id].quantity > quantity) {
    // let editedItem = { ...items[id] };
    let editedItem = items[id];
    editedItem.quantity -= quantity;
    editData(editedItem, table);
  } else {
    deleteData(id, table);
  }
}

function discardItem(id, quantity, items, table) {
  const today = DateTime.now();

  if (items[id].expiring_date < today) {
    localStorage.setItem("expired_discarded_items", localStorage.getItem("expired_discarded_items") + quantity);

    if (items[id].opened) {
      localStorage.setItem("expired_opened_items", localStorage.getItem("expired_opened_items") + quantity);
    }
  } else {
    localStorage.setItem("consumed_items", localStorage.getItem("consumed_items") + quantity);
  }

  if (items[id].quantity > quantity) {
    // let editedItem = { ...items[id] };
    let editedItem = items[id];
    editedItem.quantity -= quantity;
    editData(editedItem, table);
  } else {
    deleteData(id, table);
  }
}

function addItemFromForm(e) {
  // prevent default - we don't want the form to submit in the conventional way
  e.preventDefault();

  // find which list the item should be added to
  let listElement;
  let items;
  let sortedItems;
  let table;
  let history_table;

  // get current active tab
  const tab = document.querySelector('.nav-link.active').id;

  if (tab === "foods-tab") {
    listElement = foodsListElement;
    items = foodItems;
    sortedItems = sortedFoodItems;
    table = FOODS_TABLE;
    history_table = FOODS_HISTORY_TABLE;
  } else if (tab === "medicines-tab") {
    listElement = medicinesListElement;
    items = medicineItems;
    sortedItems = sortedMedicineItems;
    table = MEDICINES_TABLE;
    history_table = MEDICINES_HISTORY_TABLE;
  } else {
    console.error("Tab not found:", tab);
  }

  // grab the values entered into the form fields and store them in an object ready for being inserted into the DB
  // const newItem = { title: titleInput.value, body: bodyInput.value };

  const nameInput = document.getElementById("new-item-name");
  const quantityInput = document.getElementById("new-item-quantity");
  const expiringDateInput = document.getElementById("new-item-expiring-date");
  const durationInput = document.getElementById("new-item-duration");
  let expiringDate = DateTime.fromISO(expiringDateInput.value).endOf('day');

  addDataAndUpdateUI(
    {
      name: nameInput.value,
      quantity: quantityInput.value,
      expiring_date: expiringDate.toISO(),
      duration: durationInput.value,
      date_opened: null,
      opened: false
    },
    listElement, items, sortedItems, table);

  addHistoryData(nameInput.value, durationInput.value, history_table);

  nameInput.value = "";
  quantityInput.value = "";
  expiringDateInput.value = "";
  durationInput.value = "";
}

function sortItems(items, sortedItems) {
  sortedItems.length = 0;
  sortedItems.push(...Object.values(items));
  // sort the items by expiring date, opened and quantity
  sortedItems.sort((a, b) => a.expiring_date - b.expiring_date || b.opened - a.opened || b.quantity - a.quantity);
}

// detect when export-products-input is clicked and export the products table
document.getElementById('export-products-input').addEventListener('click', function (e) {
  exportToJson(db)
  .then(result => {
    const blob = new Blob([result], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expiring_products.json';
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  })
  .catch(error => {
    console.error('Something went wrong during export:', error);
  })
});

// detect when import-products-input is clicked and import the products table
document.getElementById('import-products-input').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const result = e.target.result;
    clearDatabase(db)
    .then(() => importFromJson(db, result))
    .then(() => {
      console.log('Successfully cleared database and imported data')
      displayData(foodsListElement, foodItems, sortedFoodItems, FOODS_TABLE);
      displayData(medicinesListElement, medicineItems, sortedMedicineItems, MEDICINES_TABLE);
    })
    .catch(error => {
      console.error('Could not clear & import database:', error)
    })
  };

  reader.readAsText(file);
});

// #endregion

// #region PWA code

function getPWADisplayMode() {
  if (document.referrer.startsWith("android-app://")) return "twa";
  if (window.matchMedia("(display-mode: browser)").matches) return "browser";
  if (window.matchMedia("(display-mode: standalone)").matches) return "standalone";
  if (window.matchMedia("(display-mode: minimal-ui)").matches) return "minimal-ui";
  if (window.matchMedia("(display-mode: fullscreen)").matches) return "fullscreen";
  if (window.matchMedia("(display-mode: window-controls-overlay)").matches) return "window-controls-overlay";
  return "unknown";
}

window.addEventListener("DOMContentLoaded", () => {
  const displayMode = getPWADisplayMode();

  // hide github-corner and change theme button if not in browser mode
  if (displayMode !== "browser") {
    const githubCorner = document.querySelector(".github-corner");
    githubCorner.style.display = "none";

    // const themeButton = document.querySelector("#change-theme-button");
    // themeButton.style.display = "none";
  }
});

// #endregion

// #region DB code

// Open our database; it is created if it doesn't already exist
// (see the upgradeneeded handler below)
const openRequest = window.indexedDB.open("expiring_dates_db", 1);

// error handler signifies that the database didn't open successfully
openRequest.addEventListener("error", () =>
  console.error("Database failed to open")
);

// success handler signifies that the database opened successfully
openRequest.addEventListener("success", () => {
  console.log("Database opened successfully");

  // Store the opened database object in the db variable. This is used a lot below
  db = openRequest.result;

  // Run the displayData function to display the items already in the IDB
  displayData(foodsListElement, foodItems, sortedFoodItems, FOODS_TABLE);
  displayData(medicinesListElement, medicineItems, sortedMedicineItems, MEDICINES_TABLE);
});

// Set up the database tables if this has not already been done
openRequest.addEventListener("upgradeneeded", (e) => {
  // Grab a reference to the opened database
  db = e.target.result;

  // Create an objectStore in our database to store items and an auto-incrementing key
  // An objectStore is similar to a 'table' in a relational database
  const foodsObjectStore = db.createObjectStore(FOODS_TABLE, {
    keyPath: "id",
    autoIncrement: true,
  });

  // Define what data items the objectStore will contain
  foodsObjectStore.createIndex("name", "name", { unique: false });
  foodsObjectStore.createIndex("quantity", "quantity", { unique: false });
  foodsObjectStore.createIndex("expiring_date", "expiring_date", { unique: false });
  foodsObjectStore.createIndex("duration", "duration", { unique: false });
  foodsObjectStore.createIndex("date_opened", "date_opened", { unique: false });
  foodsObjectStore.createIndex("opened", "opened", { unique: false });

  const medicinesObjectStore = db.createObjectStore(MEDICINES_TABLE, {
    keyPath: "id",
    autoIncrement: true,
  });

  // Define what data items the objectStore will contain
  medicinesObjectStore.createIndex("name", "name", { unique: false });
  medicinesObjectStore.createIndex("quantity", "quantity", { unique: false });
  medicinesObjectStore.createIndex("expiring_date", "expiring_date", { unique: false });
  medicinesObjectStore.createIndex("duration", "duration", { unique: false });
  medicinesObjectStore.createIndex("date_opened", "date_opened", { unique: false });
  medicinesObjectStore.createIndex("opened", "opened", { unique: false });

  const foodsHistoryObjectStore = db.createObjectStore(FOODS_HISTORY_TABLE, {
    keyPath: "name",
    autoIncrement: false,
    unique: true
  });

  // Define what data items the objectStore will contain
  foodsHistoryObjectStore.createIndex("duration", "duration", { unique: false });

  const medicinesHistoryObjectStore = db.createObjectStore(MEDICINES_HISTORY_TABLE, {
    keyPath: "name",
    autoIncrement: false,
    unique: true
  });

  // Define what data items the objectStore will contain
  medicinesHistoryObjectStore.createIndex("duration", "duration", { unique: false });

  console.log("Database setup complete");
});

function addHistoryData(name, duration, table) {
  // open a read/write db transaction, ready for adding the data
  const transaction = db.transaction([table], "readwrite");

  // call an object store that's already been added to the database
  const objectStore = transaction.objectStore(table);

  // Make a request to add our newItem object to the object store
  const addRequest = objectStore.put({name: name, duration: duration});

  addRequest.addEventListener("success", () => {
    console.log("Item added to the", table, "database:", {name: name, duration: duration});
  });

  // Report on the success of the transaction completing, when everything is done
  transaction.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");
  });

  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error")
  );
}

// Define the addData() function
function addDataAndUpdateUI(newItem, listElement, items, sortedItems, table) {
  // open a read/write db transaction, ready for adding the data
  const transaction = db.transaction([table], "readwrite");

  // call an object store that's already been added to the database
  const objectStore = transaction.objectStore(table);

  // Make a request to add our newItem object to the object store
  const addRequest = objectStore.add(newItem);

  addRequest.addEventListener("success", () => {
    console.log("Item added to the", table, "database:", newItem);
  });

  // Report on the success of the transaction completing, when everything is done
  transaction.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");

    // update the display of data to show the newly added item, by running displayData
    displayData(listElement, items, sortedItems, table);
  });

  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error")
  );
}

function addData(newItem, table) {
  // open a read/write db transaction, ready for adding the data
  const transaction = db.transaction([table], "readwrite");

  // call an object store that's already been added to the database
  const objectStore = transaction.objectStore(table);

  // Make a request to add our newItem object to the object store
  const addRequest = objectStore.add(newItem);

  addRequest.addEventListener("success", () => {
    console.log("Item added to the", table, "database:", newItem);
  });

  // Report on the success of the transaction completing, when everything is done
  transaction.addEventListener("complete", () => {
    console.log("Transaction completed:", table, "database modification finished.");
  });

  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error")
  );
}

function displayData(listElement, items, sortedItems, table) {
  // Here we empty the contents of the list element each time the display is updated
  // If you didn't do this, you'd get duplicates listed each time a new item is added
  while (listElement.firstChild) {
    listElement.removeChild(listElement.firstChild);
  }

  for (let key in items) {
    delete items[key];
  }

  // Open our object store and then get a cursor - which iterates through all the
  // different data items in the store
  let objectStore;
  try {
    objectStore = db.transaction([table]).objectStore(table);
  } catch (error) {
    console.error("Error opening object store", table, ":", error);
  }

  objectStore.openCursor().addEventListener("success", (e) => {
    // Get a reference to the cursor
    const cursor = e.target.result;

    // If there is still another data item to iterate through, keep running this code
    if (cursor) {
      items[cursor.value.id] = cursor.value;
      items[cursor.value.id].expiring_date = DateTime.fromISO(cursor.value.expiring_date);
      // Iterate to the next item in the cursor
      cursor.continue();
    } else {
      // if list item is empty, display a 'No items stored' message
      if (Object.keys(items).length === 0) {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        listItem.textContent = "Não há items aqui.";
        listElement.appendChild(listItem);
        console.log("No items to display from the", table, "database.");
      } else {
        sortItems(items, sortedItems);

        for (const item of sortedItems) {
          // Create a list item to put each data item inside when displaying it
          // structure the HTML fragment, and append it inside the list
          const listItem = document.createElement("li");

          listItem.innerHTML = `
            <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" data-bs-toggle="modal" data-bs-target="#edit-item-modal" data-bs-id="${item.id}">
              <div class="d-flex align-items-center">
                <div class="ms-2 me-auto">
                  <div class="fw-bold">${item.name}</div>
                  ${DateTime.fromISO(item.expiring_date).setLocale('pt-BR').toRelative()}
                </div>
              </div>

              <div class="d-flex align-items-center">
                <span class="badge text-bg-primary rounded-pill">${item.quantity}</span>
                <span class="ms-2"><i class="fa-solid fa-chevron-right"></i></span>
              </div>
            </button>
          `;

          listElement.appendChild(listItem);
          // Store the ID of the data item inside an attribute on the listItem, so we know
          // which item it corresponds to. This will be useful later when we want to edit items
          listItem.setAttribute("data-item-id", item.id);
        };

        // if there are no more cursor items to iterate through, say so
        console.log("All items from", table, "displayed");
      }
    }
  });
}

// Define the editData() function
function editData(editedItem, table) {
  // open a database transaction and edit the item, finding it using the id we retrieved above
  const objectStore = db.transaction([table], "readwrite").objectStore(table);
  const getRequest = objectStore.get(editedItem.id);

  getRequest.onerror = (event) => {
    // Handle errors!
    console.log("Error editing item:", event);
  };
  getRequest.onsuccess = (event) => {
    // Get the old value that we want to update
    const storedData = event.target.result;

    // update the value(s) in the object that you want to change
    storedData.name = editedItem.name;
    storedData.quantity = editedItem.quantity;
    storedData.expiring_date = editedItem.expiring_date.toISO();
    storedData.duration = editedItem.duration;
    storedData.date_opened = editedItem.date_opened;
    storedData.opened = editedItem.opened;

    // Put this updated object back into the database.
    const requestUpdate = objectStore.put(storedData);
    requestUpdate.onerror = (event) => {
      // Do something with the error
      console.log("Error updating item:", event);
    };
    requestUpdate.onsuccess = (event) => {
      // Success - the data is updated!
      console.log("Item updated:", editedItem);
    };
  };
}

// Define the deleteData() function
function deleteData(id, table) {
  // retrieve the name of the item we want to delete. We need
  // to convert it to a number before trying to use it with IDB; IDB key
  // values are type-sensitive.
  // open a database transaction and delete the item, finding it using the id we retrieved above
  const transaction = db.transaction([table], "readwrite");
  const objectStore = transaction.objectStore(table);
  const deleteRequest = objectStore.delete(id);

  // report that the data item has been deleted
  transaction.addEventListener("complete", () => {
    console.log(`Item ${id} deleted.`);

    // Again, if list item is empty, display a 'No items stored' message
    // if (!listElement.firstChild) {
    //   const listItem = document.createElement("li");
    //   listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    //   listItem.textContent = "No items stored.";
    //   listElement.appendChild(listItem);
    // }
  });
}

// #endregion
