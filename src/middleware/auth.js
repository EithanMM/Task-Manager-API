const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
	try {
		/* Obtain the token from the header. */
		const token = req.header('Authorization').replace('Bearer ', '');

		/* Verify if the obtained token is valid. */
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		/* Obtein the user acording to the _id Object 
        and with tokens.token we are looking for the token provided.*/
		const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
		if (!user) throw new Error();
		/* store the user in a "custom word" in request. */
		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		res.status(401).send({ error: 'please authenticate.' });
	}
};

module.exports = auth;
