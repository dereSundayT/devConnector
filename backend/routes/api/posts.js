const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

/**
 * @route POST api/posts
 * @desc  Create a post
 * @access Private
 */
router.post(
	'/',
	[auth, [check('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		try {
			const user = await User.findById(req.user.id).select('-password')
			const newPost = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			}
			const post = await Post.save(newPost)

			return res.json(post)
		} catch (error) {
			return res.status(500).json({
				msg: 'Server Error',
			})
		}
	}
)

/**
 * @route GET api/posts
 * @desc  get all post
 * @access Private
 */
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({
			date: -1,
		})

		res.json(posts)
	} catch (error) {
		return res.status(500).json({
			msg: 'Server Error',
		})
	}
})

/**
 * @route GET api/posts/:id
 * @desc  get post by id
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) {
			return res.status('404').json({ msg: 'post not found' })
		}
		res.json(post)
	} catch (error) {
		if (error.kind === 'ObjectId') {
			return res.status('404').json({ msg: 'post not found' })
		}
		return res.status(500).json({
			msg: 'Server Error',
		})
	}
})

/**
 * @route DELETE api/posts/:id
 * @desc  delete a post by id
 * @access Private
 */
router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)

		if (!post) {
			return res.status('404').json({ msg: 'post not found' })
		}

		if (post.user.toString() !== req.user.id) {
			return res.status('401').json({ msg: 'user not authorized' })
		}

		await post.remove()

		res.json({ msg: 'Post removed' })
	} catch (error) {
		if (error.kind === 'ObjectId') {
			return res.status('404').json({ msg: 'post not found' })
		}
		return res.status(500).json({
			msg: 'Server Error',
		})
	}
})

/**
 * @route PUT api/posts/like/:id
 * @desc  Like A post
 * @access Private
 */
router.put('/like/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)

		//check if user already liked this post
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id).length > 0
		) {
			return res.status(400).json({
				msg: 'post already liked',
			})
		}
		post.likes.unshift({
			user: req.user.id,
		})

		await post.save()
		return res.json(post.likes)
	} catch (error) {
		return res.status(500).json({
			msg: 'Server Error',
		})
	}
})

/**
 * @route PUT api/posts/like/:id
 * @desc  Like A post
 * @access Private
 */
router.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)

		//check if user already liked this post
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id).length ===
			0
		) {
			return res.status(400).json({
				msg: 'cant unlike this post',
			})
		}
		//
		const removeIndex = post.likes
			.map((like) => like.user.toString())
			.indexOf(req.user.id)
		post.likes.splice(removeIndex, 1)

		await post.save()
		return res.json(post.likes)
	} catch (error) {
		return res.status(500).json({
			msg: 'Server Error',
		})
	}
})

/**
 * @route POST api/posts/comment/:id
 * @desc  Comment on  a POst
 * @access Private
 */
router.post(
	'/comment/:id',
	[auth, [check('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		try {
			const user = await User.findById(req.user.id).select('-password')
			const post = await Post.findById(req.params.id)

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			}

			post.comments.unshift(newComment)

			await post.save()

			return res.json(post.comments)
		} catch (error) {
			return res.status(500).json({
				msg: 'Server Error',
			})
		}
	}
)

/**
 * @route DELETE  api/posts/comment/:id/:comment_id
 * @desc  Delete a comment
 * @access Private
 */
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		//get the post
		const post = await Post.findById(req.params.id)
		//pul out comment
		const comment = post.comments.find(
			(comment) => comment.id === req.params.comment_id
		)
		if (!comment) {
			return res.status(404).json({ msg: 'Comment not found' })
		}
		//check user
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'USer not authorized' })
		}

		const removeIndex = post.comments
			.map((comment) => comment.user.toString())
			.indexOf(req.user.id)
		post.comments.splice(removeIndex, 1)

		await post.save()
		return res.json(post.comments)
	} catch (error) {
		return res.status(500).json({
			msg: 'Server Error',
		})
	}
})
module.exports = router
