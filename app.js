require('dotenv').config()
let auth = require('./auth');

let date = Math.floor(Date.now() / 1000) + 24 * 60 * 60  //tomorrow;
let access_token = auth.readAuthData()[0];
let contacts = new Array();

// TODO: Сделать код чище

let page = 1;

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

        if (response.status === 204) {
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
        .then(res => {
            if (res.status === 204) {
                callback(contacts);
            } else { return res.json() }
        })
        .then(json => {
            let tasks = json._embedded.tasks.filter(task => task.text === 'Контакт без сделок');
            // filter from existing tasks with same message
            contacts = contacts.filter(contact => { return !tasks.some(task => { return task.entity_id === contact.id }) });
            callback(contacts);
        })
        .catch(err => {
            console.log(err);
        })
}

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



getContacts(filterTasks);