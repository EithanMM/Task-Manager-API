const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

//User schema
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Email is invalid!');
				}
			}
		},
		password: {
			type: String,
			trim: true,
			required: true,
			minlength: 7,
			validate(value) {
				if (value.toLowerCase().includes('password')) {
					throw new Error('the password cannot be password');
				}
			}
		},
		age: {
			type: Number,
			default: 0,
			validate(value) {
				if (value < 0) throw new Error('Age must be positive number!');
			}
		},
		tokens: [
			{
				token: {
					type: String,
					required: true
				}
			}
		],
		avatar: {
			type: Buffer
		}
	},
	{
		timestamps: true
	}
);

/* Virtual relation that the program do with Users - Tasks*/
userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner'
});

/* Function that is created and implemented into the model of the User */
/* static methods are accesible on the model - model methods*/
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) throw new Error('Unable to login.');

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) throw new Error('Unable to login.');

	return user;
};

/* Methods that are accesible on the instances - instance methods */
userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {});
	user.tokens = user.tokens.concat({ token }); /* add the token to the array of tokens of the user. */
	await user.save();
	return token;
};

/* this function allow us to manipulate the JSON object, so we can decide what date we decide to send. */
userSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;

	return userObject;
};
/** Middlewares - hash the plain text before saving **/
userSchema.pre('save', async function(next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next(); /* method to finish the middleware*/
});

/** Delete user task when user is removed */
userSchema.pre('remove', async function(next) {
	const user = this;
	await Task.deleteMany({ owner: user._id });
	next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
