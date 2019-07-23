const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');
/*  user test object */
const userOnseId = new mongoose.Types.ObjectId();

const userOne = {
	_id: userOnseId,
	name: 'Persona1',
	email: 'example@gmail.com',
	password: 'persona1!!!',
	tokens: [
		{
			token: jwt.sign({ _id: userOnseId }, process.env.JWT_SECRET)
		}
	]
};

const userTowId = new mongoose.Types.ObjectId();

const userTwo = {
	_id: userTowId,
	name: 'Persona2',
	email: 'example2@gmail.com',
	password: 'persona2!!!',
	tokens: [
		{
			token: jwt.sign({ _id: userTowId }, process.env.JWT_SECRET)
		}
	]
};

const taskOne = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Task One',
	completed: false,
	owner: userOne._id
};

const taskTwo = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Task Two',
	completed: true,
	owner: userOne._id
};

const taskThree = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Task Three',
	completed: true,
	owner: userTwo._id
};

const setUpDatabase = async () => {
	await Task.deleteMany();
	await User.deleteMany();
	await new User(userOne).save();
	await new User(userTwo).save();

	await new Task(taskOne).save();
	await new Task(taskTwo).save();
	await new Task(taskThree).save();
};

module.exports = {
	setUpDatabase,
	userOne,
	userOnseId,
	userTwo,
	taskOne,
	taskTwo,
	taskThree
};
