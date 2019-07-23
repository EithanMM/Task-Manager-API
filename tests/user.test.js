const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { setUpDatabase, userOne, userOnseId } = require('./fixtures/db');

/* Function that runs before the test are executed */
beforeEach(setUpDatabase);
/********************* TEST CASES  ******************************/
test('Should sign up new user', async () => {
	const response = await request(app) /* set the configuration of the server to bind it with supertest package.*/
		.post('/users') /* Specify what kind of method we want to trigger and the url.*/
		.send({
			/* Send an object with the data we want to test */
			name: 'Juan',
			email: 'juan@gmail.com',
			password: 'thisisnotgood'
		})
		.expect(201); /* What kind of response we spect, once the operation is done. */

	//Assert that teh database was changed correctly.
	const user = await User.findById(response.body.user._id);
	expect(user).not.toBeNull();

	//Assertions about the response body
	expect(response.body).toMatchObject({
		user: {
			name: 'Juan',
			email: 'juan@gmail.com'
		},
		token: user.tokens[0].token
	});
});

test('Should login existing user', async () => {
	const response = await request(app)
		.post('/users/login')
		.send({
			email: userOne.email,
			password: userOne.password
		})
		.expect(200);
	//Assertion if the token is the correct one.
	const user = await User.findById(userOnseId);
	expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistent user', async () => {
	await request(app)
		.post('/users/login')
		.send({
			email: userOne.email,
			password: 'kasandrakageisshit'
		})
		.expect(400);
});

test('Should get profile for user', async () => {
	/* set is for setting up a header to recognize the auth token */
	await request(app).get('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
	await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
	await request(app).delete('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200);

	const user = await User.findById(userOnseId);
	expect(user).toBeNull();
});

test('Should not delete user for unauthenticated user', async () => {
	await request(app).delete('/users/me').send().expect(401);
});

test('Should uploead avatar image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg') /* This is used to attach documents or pics */
		.expect(200);
	const user = await User.findById(userOnseId);
	expect(user.avatar).toEqual(expect.any(Buffer)); /* Check if the avatar property equals any Buffer */
});

test('Should update valid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Mike'
		})
		.expect(200);
	const user = await User.findById(userOnseId);
	expect(user.name).toEqual('Mike');
});

test('Should not update invalid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			genre: 'Male'
		})
		.expect(400);
});
