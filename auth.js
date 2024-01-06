require('dotenv').config()
let CONFIG = require('./config.json');
let fs = require('fs');

function authorize(callback) {
    let integrated = CONFIG.integrated === true;
    if (!integrated) {
        console.log('not integrated, trying to integrate');
        integrate();
    }
    else {
        console.log('Refreshing access token');
        refreshTokens();
    }
}

// trades for access and refresh tokens
async function integrate() {

    let body = {
        "client_id": process.env.client_id,
        "client_secret": process.env.client_secret,
        "code": process.env.code,
        "grant_type": "authorization_code",
        "redirect_uri": "https://localhost.com"
    };
    try {
        const response = await fetch('https://noiafugace.amocrm.ru/oauth2/access_token', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        if (response.status === 200) {
            const json = await response.json();
            let tokensObj = {
                "access_token": json.access_token,
                "refresh_token": json.refresh_token,
                "integrated": true
            }
            fs.writeFileSync('./config.json', JSON.stringify(tokensObj), { encoding: 'utf8' });
            console.log('integration success, please run again');
        }
        else {
            console.log("integration error, please make sure integration codes are correct");
        }
    }
    catch (error) {
        console.log("Integration failed: \n");
        console.log(error);
    }

}

function refreshTokens() {
    let body = {
        "client_id": process.env.client_id,
        "client_secret": process.env.client_secret,
        "grant_type": "refresh_token",
        "refresh_token": CONFIG.refresh_token,
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
            let obj = {
                "access_token": json.access_token,
                "refresh_token": json.refresh_token,
                "integrated": true
            }
            fs.writeFileSync('./config.json', JSON.stringify(obj));
        })
        .catch(err => {
            console.log("Token refreshing failed: \n");
            console.log(err)
        })
}

// readAuthData возвращает массив [access_token, refresh_token];
function readAuthData() {
    //return rokens
    return [CONFIG.access_token, CONFIG.refresh_token, CONFIG.integrated];
}

module.exports.readAuthData = readAuthData;
module.exports.refreshTokens = refreshTokens;
module.exports.authorize = authorize;