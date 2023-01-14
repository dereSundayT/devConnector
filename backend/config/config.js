const dotenv = require('dotenv');
dotenv.config();


const appConfig = {
    'appPortNo' : process.env.PORT || 5000,
    'db_user_name' : process.env.MONGO_DB_USERNAME,
    'db_password' : process.env.MONGO_DB_PASSWORD
}

module.exports = appConfig