const { create } = require('domain');
const fs = require('fs');

let access_token = '';
let refresh_token = '';
let page = 1;
let contacts = [];
let userId = 10499042;
let date = Math.floor(Date.now() / 1000) + 24 * 60 * 60  //tomorrow;

// TODO: Добавить проверку на то, что такая задача уже существует
// TODO: Сделать код чище

function readAuthData() {
    const authData = fs.readFileSync('./authorization.json', { encoding: 'utf8' });

    let tokens = JSON.parse(authData);

    access_token = tokens.access_token;
    refresh_token = tokens.access_token;
}

async function getContacts() {
    try {
        const res = await fetch('https://noiafugace.amocrm.ru/api/v4/contacts?limit=25&with=leads&page=' + page, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        })
        if (res.status == 204) {
            contacts = contacts.flat(1);
            contacts = contacts.filter(contact => contact._embedded.leads.length == 0);
            createTasks(contacts);
        }
        else {
            const json = await res.json()
            contacts.push(json._embedded.contacts);
            page++;
            getContacts();
        }
    }
    catch (error) {
        console.log(error);
    }
}

function createTasks(contacts) {
    let body = [];
    contacts.forEach(contact => {
        let obj = {
            "responsible_user_id": userId,
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

readAuthData();
getContacts();