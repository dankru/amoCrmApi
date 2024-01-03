let secret_key = 'Vgc475wU0KaX0kKJetbsTkVtHPiKzXoKhHjQCNnbEFvnNWnsbqW5A8etRpE3C8iU';
let client_id = '129b4643-b25b-4913-ae76-e369ac242645';
let code = 'def50200e9e281a2b9320452e3434840cbe58bca48a55cd73dc11d132a8888d02b5d645387a2a3570347027bb42af9a27c73d1a4f998364ff7484ee46ced24e816d758fcde35d7f48087b881aae6f7b4ba26b56607c82506ba423b3cf8f84ea53bd948f3cc66275efd9829b4afe081511d0bd5180caef6826bd0ee7fcb550c4a7364585bada6fb6c5a2d0683ff4c3223df0039c361a67ed5090e8a9162aaa48ee72aa3dcb2e4f66f772a94a430dc06911ddb5adf3a47255eb0ef3c01c26b34e90b8a4cb7a681dd0af1d16a0c936de9942ec6e76ff83659538ae693c8fcde4add8f371abb6c17f43c675f2a40d6eb7daa4f32641e684e355d6d123e6f809f3ab9feaf77e5bb8c54b94453b078519da6498fa4eee691b4c97c10a8429d566bbaa71c943f5274968ddeefa77706ec2a746a5e6c7cfdf5d2c3cc34b57503692d98b2df8880560edc86ecee5bf84dcd010ab2fdd374cd2834cb564287cc0cf0b1f185429b389485bb81e6c1a4447d6b3427b57acdcf68c9a14c211c7cf26fdaf5b0de870e310162a6a53b0fd46e23a4da48f023f4f42ef1c52972265a25969f55f6aad982b9ab54dc76b6bb12da3dfa7b028c6ff1c5769dc4f6b862bb4942c2982d0a098d09908b8c98c0ef012147d468dd6efc368e820db5be0ad318fc3be2280d617f0322a2a690';

function authorize() {

    let body = {
        "client_id": client_id,
        "client_secret": secret_key,
        "code": code,
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
            const obj = {
                "refresh_token": json.refresh_token,
                "access_token": json.access_token
            }
            fs.writeFileSync('./authorization.json', JSON.stringify(obj), { encoding: 'utf8', flag: 'w' });
        })
        .catch(err => {
            console.log(err)
        })
}