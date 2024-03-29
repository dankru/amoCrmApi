require('dotenv').config()
let auth = require('./auth');

let date = Math.floor(Date.now() / 1000) + 24 * 60 * 60  //tomorrow;
let access_token = auth.readAuthData()[0];
let contacts = new Array();
let limit = 25;
let page = 1;
let baseUrl = "https://noiafugace.amocrm.ru"
/**
 * Gets contacts and passes them to a callback chain
 * @param {Array} contacts - array of contacts
 * @param {filterTasks} callback - next callback in chain
 */
async function getContacts(contacts, callback) {
    try {
        const response = await fetch(process.env.BASE_URL + "/api/v4/contacts?limit=" + limit + "&with=leads&page=" + page, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        })

        if (response.status === 204) {
            callback(contacts, createTasks);
        }

        else if (response.status === 401) {
            auth.authorize();
        }

        else {
            const json = await response.json();
            contacts = contacts.concat(json._embedded.contacts);
            page++;
            getContacts(contacts, callback);
        }
    }
    catch (error) {
        console.log("Failed getting contacts: \n");
        console.log(error);
    }
}

/**
 * Filters contacts array and passes it to a callback chain
 * @callback filterTasks
 * @param {Array.<Object>} contacts - array of contacts
 * @param {createTasks} callback - next callback in chain
 */
async function filterTasks(contacts, callback) {
    try {
        // flatten arrays from different pages
        contacts = contacts.flat(1);
        // filter out contacts with leads
        contacts = contacts.filter(contact => contact._embedded.leads.length == 0);
        // get existing tasks
        const response = await fetch(process.env.BASE_URL + "/api/v4/tasks?filter[entity_type][]='contacts'", {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        })
        // if no existing tasks, skip filtering
        if (response.status === 204) {
            callback(contacts);
        }
        else {
            const json = await response.json();
            // leave tasks with same text only
            let tasks = json._embedded.tasks.filter(task => task.text === 'Контакт без сделок');
            // filter out contacts which already have tasks
            contacts = contacts.filter(contact => { return !tasks.some(task => { return task.entity_id === contact.id }) });
            callback(contacts);
        }
    }

    catch (error) {
        console.log('Task filtering failed: \n')
        console.log(error);
    }
}
/**
 * Creates tasks for filtered contacts
 * @callback createTasks 
 * @param {Array.<Object>} contacts - filtered array of contacts
 */
async function createTasks(contacts) {

    let body = [];
    // if we have contacts without task left
    if (contacts.length !== 0) {
        // create task objects
        contacts.forEach(contact => {
            let obj = {
                "responsible_user_id": parseInt(process.env.USER_ID),
                "text": "Контакт без сделок",
                "complete_till": date,
                "entity_id": contact.id,
                "entity_type": "contacts"
            }

            body.push(obj);
        });
        // create tasks
        try {
            const response = await fetch(process.env.BASE_URL + "/api/v4/tasks", {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token
                }
            })
            const json = await response.json();
            console.log("tasks created: " + json._embedded.tasks.length);
        }
        catch (error) {
            console.log('task creation failed: \n')
            console.log(error);
        }
    }
    else {
        console.log("Every task was filtered out, no tasks were created");
    }
}

getContacts(contacts, filterTasks);