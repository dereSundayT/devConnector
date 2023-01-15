const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const {check, validationResult} = require("express-validator")


/**
 * @route GET api/profile
 * @desc  Get Current users profile
 * @access Private
 */
router.get('/me', auth, async (req, res) => {
    //
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({msg: "There is no profile for this user"})
        }
        return res.json({profile})
    } catch (e) {
        return res.status(500).json(e.message)
    }
})


router.post('/', [auth,
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Status is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body

    //BWild Profile objs
    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername

    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }

    //Build Social Object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (twitter) profileFields.social.twitter = twitter
    if (facebook) profileFields.social.facebook = facebook
    if (linkedin) profileFields.social.linkedin = linkedin
    if (instagram) profileFields.social.instagram = instagram

    try {
        let profile = await Profile.findOne({user: req.user.id})
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true}
            );
            return res.json(profile)
        }
        // create new profile
        profile = new Profile(profileFields)
        await  profile.save()
        return res.json(profile)
    } catch (e) {
        console.log(e.message)
        res.status(500).json('server error')
    }
})

module.exports = router;