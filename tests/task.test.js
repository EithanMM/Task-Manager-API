const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { setUpDatabase, userOne, userTwo, taskOne, taskTwo, taskThree } = require('./fixtures/db');
/* --runInBand is a command that allow us to run the test in series avoiding conflicts. */
/* Function that runs before the test are executed */
beforeEach(setUpDatabase);

test('Should create task for user', async () => {
	const response = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: 'Desc from test'
		})
		.expect(201);

	const task = await Task.findById(response.body._id);
	expect(task).not.toBeNull();

	expect(task.completed).toBe(false);
});

test('Should fetch the task for userOns', async () => {
	const response = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(response.body.length).toBe(2);
});

test('Second user cannot delete task of user one', async () => {
	const response = await request(app)
		.delete('/task/' + taskOne._id)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);
	const task = await Task.findById(taskOne._id);
	expect(task).not.toBeNull();
});
