const express = require('express')
const router = express.Router()



/**
 * @route GET api/profile
 * @desc  Test Route
 * @access Public
 */
router.get('/',(req,res) => {
    //
    res.json('hello')
})

module.exports = router;