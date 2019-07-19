const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'eithan.mndez@gmail.com',
		subject: 'Thanks for joining in!',
		text: `Welcome to the task-manager app, ${name}. Let me know how you feel with the app.`
	});
};

const sendCancelationEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'eithan.mndez@gmail.com',
		subject: 'Account cancelation email',
		text: `It's a shame that you leave us ${name}. What could we do to keep you on board on the application?`
	});
};

module.exports = {
	sendWelcomeEmail,
	sendCancelationEmail
};
