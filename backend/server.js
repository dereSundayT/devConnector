const express  = require("express")
const connectDB = require('./config/db')
const appConfig = require("./config/config");

const app = express()

//Connect Database
connectDB()

//Define route
app.use('/api/users', require('./routes/api/users'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/auth', require('./routes/api/auth'))

//
app.listen(appConfig.appPortNo, () => console.log(`Server started ${appConfig.appPortNo}`))