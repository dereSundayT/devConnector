const express  = require("express")
const connectDB = require('./config/db')
const appConfig = require("./config/config");

const app = express()




//Connect Database
connectDB()
app.listen(appConfig.appPortNo, () => console.log(`Server started ${appConfig.appPortNo}`))