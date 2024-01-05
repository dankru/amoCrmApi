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
function filterTasks(callback) {

    contacts = contacts.flat(1);
    contacts = contacts.filter(contact => contact._embedded.leads.length != 0);

    fetch("https://noiafugace.amocrm.ru/api/v4/tasks?filter[entity_type][]='contacts'", {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
    })
        .then(res => res.json())
        .then(json => {
            let tasks = json._embedded.tasks.filter(task => task.text === 'Контакт без сделок');
            contacts = contacts.filter(contact => !tasks.includes(contact.id));

        })
        .catch(err => {
            console.log(err);
        })
    console.log(contacts);
    callback(contacts);
}
async function getContacts(callback) {
    try {
        const response = await fetch("https://noiafugace.amocrm.ru/api/v4/contacts?limit=25&with=leads&page=" + page, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        })

        if (response.status == 204) {
            callback(createTasks);
        }

        else {
            const json = await response.json();
            contacts = contacts.concat(json._embedded.contacts);
            page++;
            getContacts(callback);
        }
    }
    catch (error) {
        console.log(error);
    }
}




getContacts(filterTasks);
// filterTasks();