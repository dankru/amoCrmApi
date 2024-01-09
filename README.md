# Скрипт для создания задач amoCRM
Данный скрипт проводит интеграцию с amoCRM и для каждого контакта без сделки создаёт задачу с текстом "Контакт без сделок"
## Инструкция к использованию
### 1. Общая настройка проекта
Ввести в терминал:
1. git init - инициализировать git репозиторий
2. git pull https://github.com/dankru/amoCrmApi.git - скачать данные из удалённого репозитория
3. npm install - установить зависимости 
4. touch .env tokens.json - создать файлы .env и tokens.json
5. Вставить пустые фигурные скобки {} в tokens.json - иначе произойдёт ошибка из-за неправильного форматирования json'а
### 2. Добавление необходимых для интеграции данных
Для интеграции с amoCRM в файл .env добавьте следующие данные (пример может быть найден в .env.example): 
1. Ваш Id пользователя, он находится в настройках профиля.
USER_ID = xxxx
2. Секретный ключ. Можно найти в amoМаркет > Установленные > нужная вам интеграция > Ключи и доступы
SECRET_KEY = xxxx
3. ID интеграции. Можно найти там же
INTEGRATION_ID = xxxx
4. Код авторизации. Можно найти там же
AUTHORIZATION_CODE = xxxx
5. Базовый URL. Ссылка на ваш кабинет amoCRM. В таком же виде как пример ниже:
BASE_URL = https://xxxx.amocrm.ru
### 3. Запуск скрипта
1. Ввести node app.js в терминал, произойдёт интеграция
2. Ввести node app.js в терминал повторно, создадутся задачи.
​
После первого запуска повторная интеграция не требуется,  но может потребоваться обновление токенов. Сообщение об этом выведется в терминале.
​
Если для какого-либо из контактов уже существует задача с текстом "Контакт без сделок", задача для этого контакта не будет создана.