const express = require('express')
const router = express.Router()
//TODO :: Read about this
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require("express-validator")
const appConfig = require('../../config/config')
const User = require('../../models/User')

//jst.io
/**
 * @route GET api/users
 * @desc  Register User
 * @access Public
 */
router.post('/',
    [
        check('name', 'Name is Required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter password').isLength({min: 6})
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        let {name, email, password} = req.body
        try {
            //see if the use exist
            let user = await User.findOne({email})
            if (user) {
                return res.status(400).json({
                    errors: [{msg: 'User already exists'}]
                })
            }
            // get users gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                default: 'mm'
            })
            user = new User({
                name, email, avatar, password
            })
            // Encrypt password
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            await user.save()
            //Return json web token
            const payload = {
                user: {
                    id: user.id,
                }
            }
            jwt.sign(payload,
                appConfig.jwtSecret,
                {
                    expiresIn: 360000000
                },
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