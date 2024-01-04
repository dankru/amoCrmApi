require('dotenv').config()
let CONFIG = require('./config.json');
let auth = require('./auth');
const { access } = require('fs');

let page = 1;
let contacts = [];
let userId = 10499042;
let date = Math.floor(Date.now() / 1000) + 24 * 60 * 60  //tomorrow;
let access_token = auth.readAuthData()[0];
// TODO: Добавить проверку на то, что такая задача уже существует
// TODO: Сделать код чище

const httpStatuses = {
    'OK': 200,
    'NoContent': 204,
    'BadRequest': 400,
    'NotAuthorized': 401
}

// getContacts возвращает Контакты, либо ошибку
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
        if (res.status === httpStatuses.NoContent) {
            contacts = contacts.flat(1);
            contacts = contacts.filter(contact => contact._embedded.leads.length != 0);
            createTasks(contacts);
        }
        else if (res.status === httpStatuses.OK) {
            const json = await res.json()
            contacts.push(json._embedded.contacts);
            page++;
            getContacts();
        }
        else if (res.status === httpStatuses.NotAuthorized) {
            console.log('Неверный логин или пароль');
        }
    }
    catch (error) {
        console.log(error);
    }
}

// createTasks Возвращает статус
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
getContacts();