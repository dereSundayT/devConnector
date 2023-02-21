const mongoose = require('mongoose')
const appConfig = require('./config')
// const config = require('config')
// const {appConfig} = require("./config");
// const db = config.get("mongoURI")

const connectDB = async () => {
	try {
		mongoose.set('strictQuery', true)
		await mongoose.connect(
			`mongodb+srv://${appConfig.db_user_name}:${appConfig.db_password}@mernstackcluster.iviidv1.mongodb.net/?retryWrites=true&w=majority`,
			{
				useNewUrlParser: true,
				useFindAndModify: false,
				// useCreateIndex : true
			}
		)
		console.log('MongoDB Connected...')
	} catch (err) {
		console.error(err.message)
		//application should fail :: Exist process with failure
		process.exit(1) // research about it
	}
}

module.exports = connectDB
