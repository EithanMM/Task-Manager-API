const express = require('express');
//Load database connection
require('./db/mongoose');
//Load route from User
const userRouter = require('./routers/user');
//Load rute for task
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

const multer = require('multer');
const upload = multer({
	dest: 'images',
	limits: {
		fileSize: 1000000
	}
});

app.post('/upload', upload.single('upload'), (req, res) => {
	res.send();
});

/* Automatically parse JSON to an Object */
app.use(express.json());

/* Enables the using of router*/
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
	console.log('Server is up on port ' + port);
});
