const dotenv = require('dotenv')
dotenv.config()

const appConfig = {
	appPortNo: process.env.PORT || 5000,
	db_user_name: process.env.MONGO_DB_USERNAME,
	db_password: process.env.MONGO_DB_PASSWORD,
	jwtSecret: process.env.JWT_SECRET,
	github_client_secret: process.env.GITHUB_CLIENT_SECRET,
	github_client_id: process.env.GITHUB_CLIENT_ID,
}

module.exports = appConfig
