const express = require('express')
const router = express.Router()

const request = require('request')
const config = request('config')

const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const { check, validationResult } = require('express-validator')

/**
 * @route GET api/me
 * @desc  Get Current users profile
 * @access Private
 */
router.get('/me', auth, async (req, res) => {
	//
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			'user',
			['name', 'avatar']
		)
		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' })
		}
		return res.json({ profile })
	} catch (e) {
		return res.status(500).json(e.message)
	}
})

/**
 * @route POST api/profile
 * @desc  Create or update users profile
 * @access Private
 */
router.post(
	'/',
	[
		auth,
		check('status', 'Status is required').not().isEmpty(),
		check('skills', 'Skills is required').not().isEmpty(),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
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
			linkedin,
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
			profileFields.skills = skills.split(',').map((skill) => skill.trim())
		}

		//Build Social Object
		profileFields.social = {}
		if (youtube) profileFields.social.youtube = youtube
		if (twitter) profileFields.social.twitter = twitter
		if (facebook) profileFields.social.facebook = facebook
		if (linkedin) profileFields.social.linkedin = linkedin
		if (instagram) profileFields.social.instagram = instagram

		try {
			let profile = await Profile.findOne({ user: req.user.id })
			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true } //
				)
				return res.json(profile)
			}
			// create new profile
			profile = new Profile(profileFields)
			await profile.save()
			return res.json(profile)
		} catch (e) {
			console.log(e.message)
			res.status(500).json('server error')
		}
	}
)

/**
 * @route GET api/profile
 * @desc  GET ALL PROFILE
 * @access Public
 */

router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar'])
		res.json(profiles)
	} catch (err) {
		console.log(err.message)
		res.status(500).send('Server Error')
	}
})

/**
 * @route GET api/profile/user/:user_id
 * @desc  GET ALL PROFILE BY USER ID
 * @access Public
 */

router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.user_id }).populate(
			'user',
			['name', 'avatar']
		)

		if (!profile)
			return res.status(400).json({ msg: 'There is no profile for this user' })

		res.json(profile)
	} catch (err) {
		console.log(err.message)
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not Found' })
		}
		res.status(500).send('Server Error')
	}
})

/**
 * @route DELETE api/profile/user/:user_id
 * @desc  DELETE profile , user & post
 * @access Private
 */

router.delete('/', auth, async (req, res) => {
	try {
		//remove profile
		await Profile.findOneAndRemove({ user: req.user.id })
		await User.findOneAndRemove({ _id: req.user.id })

		//remove user posts
		res.json({ msg: 'User deleted' })
	} catch (err) {
		console.log(err.message)
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not Found' })
		}
		res.status(500).send('Server Error')
	}
})

//experience
/**
 * @route PUT api/profile/experience
 * @desc  Add profile experience
 * @access Private
 */
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company name  is required').not().isEmpty(),
			check('from', ' From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			})
		}

		const { title, company, location, from, to, current, description } = req.body

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		}

		try {
			const profile = await Profile.findOne({ user: req.user.id })
			profile.experience.unshift(newExp)
			await profile.save()
			res.json(profile)
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
	}
)

/**
 * @route DELETE api/profile/experience/:exp_id
 * @desc  DELETE profile experience
 * @access Private
 */
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id })

		let removeIndex = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id)

		profile.experience.splice(removeIndex, 1)
		await profile.save()

		res.json(profile)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

//education
/**
 * @route PUT api/profile/education
 * @desc  Add profile education
 * @access Private
 */
router.put(
	'/experience',
	[
		auth,
		[
			check('school', 'Title is required').not().isEmpty(),
			check('degree', '  is required').not().isEmpty(),
			check('fieldofstudy', ' Field of study is required').not().isEmpty(),
			check('from', ' From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			})
		}

		const { school, degree, fieldofstudy, from, to, current, description } =
			req.body

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		}

		try {
			const profile = await Profile.findOne({ user: req.user.id })
			profile.education.unshift(newEdu)
			await profile.save()
			res.json(profile)
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
	}
)

/**
 * @route DELETE api/profile/education/:edu_id
 * @desc  DELETE profile education
 * @access Private
 */
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id })

		let removeIndex = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id)

		profile.education.splice(removeIndex, 1)
		await profile.save()

		res.json(profile)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

/**
 * @route GET api/profile/github/:username
 * @desc  GET user repos from github
 * @access Public
 */

router.get('/github/:username', async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5
			&sort=created:asc
			&client_id=${config.get('github_client_id')}
			&client_secret=${config.get('github_client_secret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' },
		}

		request(options, (error, response, body) => {
			if (error) console.error(error)

			if (response.statusCode !== 200)
				res.status(404).json({ msg: 'github profile not found' })

			return res.json(JSON.parse(body))
		})
	} catch (err) {
		console.log(err.message)
		res.status(500).send('Server error')
	}
})

module.exports = router
