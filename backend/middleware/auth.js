const jwt = require('jsonwebtoken')
const appConfig = require('../config/config')


module.exports = function (req,res,next) {
    // Get the token from the header
    const token = req.header('x-auth-token')
    //Check if no tokeN
    if(!token){
        return res.status(401).json({msg:'UnAuthorized'})
    }
    //veriy taken
    try{
        const decoded = jwt.verify(token,appConfig.jwtSecret)
        req.user = decoded.user;
        next()
    }
    catch (e){
        return res.status(401).json({msg:'Token is not valid'})
    }
}