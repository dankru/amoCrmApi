require('dotenv').config()
let CONFIG = require('./config.json');
let fs = require('fs');

// trades for access and refresh tokens
function integrate() {

    let body = {
        "client_id": process.env.client_id,
        "client_secret": process.env.client_secret,
        "code": process.env.code,
        "grant_type": "authorization_code",
        "redirect_uri": "https://localhost.com"
    };

    fetch('https://noiafugace.amocrm.ru/oauth2/access_token', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(json => {
            console.log(json);
            let tokensObj = {
                "access_token": json.access_token,
                "refresh_token": json.refresh_token
            }
            fs.writeFileSync('./config.json', JSON.stringify(tokensObj), { encoding: 'utf8' })
        })
        .catch(err => {
            console.log(err)
        })
}

function refreshTokens() {
    let body = {
        "client_id": env.getEnvValue('client_id'),
        "client_secret": env.getEnvValue('secret_key'),
        "grant_type": "refresh_token",
        "refresh_token": env.getEnvValue('refresh_token'),
        "redirect_uri": "https://localhost.com"
    };
    fetch('https://noiafugace.amocrm.ru/oauth2/access_token', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(json => {
            console.log(json);
            env.setEnvValue('refresh_token', json.refresh_token);
            env.setEnvValue('access_token', json.access_token);
        })
        .catch(err => {
            console.log(err)
        })
}

// readAuthData возвращает массив [access_token, refresh_token];
function readAuthData() {
    // read tokens
    let data = fs.readFileSync('./config.json', { encoding: 'utf8', flag: 'r' });
    // parse tokens
    let dataJson = JSON.parse(data);
    //return rokens
    return [dataJson.access_token, dataJson.refresh_token];
}

module.exports.readAuthData = readAuthData;
module.exports.refreshTokens = refreshTokens;