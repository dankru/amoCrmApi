require('dotenv').config()
let auth = require('./auth');

let date = Math.floor(Date.now() / 1000) + 24 * 60 * 60  //tomorrow;
let access_token = auth.readAuthData()[0];
let contacts = new Array();

// TODO: Добавить проверку на то, что такая задача уже существует
// TODO: Сделать код чище
const httpStatuses = {
    OK: 200,
    NoContent: 204,
    BadRequest: 400,
    NotAuthorized: 401
}

let page = 1;

/**
 * gets contacts array asynchronously, filters and flattens it
 * @callback createTasks
 */
async function getContacts() {
    try {
        const response = await fetch("https://noiafugace.amocrm.ru/api/v4/contacts?limit=25&with=leads&page=" + page, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        })
        
        if (response.status === httpStatuses.NoContent) {
            contacts = contacts.flat(1);
            contacts = contacts.filter(contact => contact._embedded.leads.length != 0);
            console.log(contacts);
            createTasks(contacts);
        }
        
        else {
            const json = await response.json();
            contacts = contacts.concat(json._embedded.contacts);
            page++;
            getContacts();
        }
    }
    catch (error) {
        console.log(error);
    }
}

/**
 * creates task for each contact
 * @param {(object|Array)} contacts flattened array of contacts
 * @returns {String} response http status
 */
function createTasks() {
    let body = [];

    contacts.forEach(contact => {
        let obj = {
            "responsible_user_id": parseInt(process.env.userId),
            "text": "Контакт без сделок",
            "complete_till": date,
            "entity_id": contact.id,
            "entity_type": "contacts"
        }
        body.push(obj);
    });
    console.log(body);
    fetch('https://noiafugace.amocrm.ru/api/v4/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
    })
        .then(res => res.json())
        .then(json => {
            console.log(json);
        })
        .catch(err => {
            console.log(err);
        })
}
getContacts();