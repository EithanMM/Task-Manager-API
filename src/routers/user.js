const express = require('express');
const router = express.Router();
const authentication = require('../middleware/auth');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

//Load the User model
const User = require('../models/user');

// To upload a file
const multer = require('multer');
const upload = multer({
	limits: {
		fileSize: 1000000 /* Set the max size of the file in bytes.*/
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('The file must be jpg, jpeg or png'));
		}

		cb(undefined, true);
	}
});

/******************** CREATE AN USER  ************************/
router.post('/users', async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});
/************************************************************/

/******************** LOGIN    USER  ************************/
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();

		res.send({ user, token });
	} catch (error) {
		res.status(400).send();
	}
});
/************************************************************/

/******************** VIEW     USER  ************************/
router.get('/users/me', authentication, async (req, res) => {
	res.send(req.user);
});
/************************************************************/

/******************** LOGOUT    USER  ************************/
router.post('/users/logout', authentication, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token; /* remmoves the token*/
		});

		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send(error);
	}
});
/************************************************************/

/******************** UPDATE    USER  ************************/
router.patch('/users/me', authentication, async (req, res) => {
	const updates = Object.keys(req.body); /* convert the Object into an array of properties(string) */
	const allowedUpdates = [ 'name', 'email', 'password', 'age' ];
	/* every is a boolean method */
	const isAllowed = updates.every((update) => allowedUpdates.includes(update));

	if (!isAllowed) return res.status(400).send({ error: 'Invalid updates!' });

	try {
		/* dinamic updating of the fields of user*/
		updates.forEach((property) => (req.user[property] = req.body[property]));

		await req.user.save();
		res.send(req.user);
	} catch (error) {
		res.status(400).send(error);
	}
});
/************************************************************/

/******************** DELETE    USER  ************************/
router.delete('/users/me', authentication, async (req, res) => {
	try {
		await req.user.remove();
		sendCancelationEmail(req.user.email, req.user.name);
		res.send(req.user);
	} catch (error) {
		res.status(500).send(error);
	}
});
/************************************************************/

/******************** DELETE ALL TOKENS **********************/
router.post('/users/logoutAll', authentication, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send(error);
	}
});
/************************************************************/

/******************** UPLOAD AVATAR  *************************/
router.post(
	'/users/me/avatar',
	authentication,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);
/************************************************************/

/******************** RENDER AVATAR  ************************/
router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user || !user.avatar) throw new Error();

		res.set('Content-Type', 'image/png'); /* Specify the header of the content */
		res.send(user.avatar);
	} catch (error) {
		res.status(404).send();
	}
});
/************************************************************/

/******************** DELETE  AVATAR  ************************/
router.delete('/users/me/avatar', authentication, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send();
});
/************************************************************/

module.exports = router;
