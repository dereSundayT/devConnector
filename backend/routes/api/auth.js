const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const {check, validationResult} = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const appConfig = require("../../config/config");


/**
 * @route GET api/auth
 * @desc  Test Route
 * @access Private
 */
router.get('/', auth, async (req, res) => {
    //
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)

    } catch (e) {
        res.status(401).json('error')
    }

})


/**
 * @route GET api/auth
 * @desc  Login User
 * @access Public
 */
router.post('/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter password').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        let {email, password} = req.body
        try {
            //see if the use exist
            let user = await User.findOne({email})
            if (!user) {
                return res.status(400).json({
                    errors: [{msg: 'Invalid Credentials'}]
                })
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    errors: [{msg: 'Invalid Credentails'}]
                })
            }

            //Return json web token
            const payload = {user: {id: user.id}}
            jwt.sign(payload,
                appConfig.jwtSecret,
                {expiresIn: 360000000},
                (err, token) => {
                    if (err) throw  err;
                    res.json({token})
                }
            )
        } catch (e) {
            console.error(e.message)
            res.status(500).send('Server error')
        }
    })

module.exports = router;