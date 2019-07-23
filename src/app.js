const express = require('express');
//Load database connection
require('./db/mongoose');
//Load route from User
const userRouter = require('./routers/user');
//Load rute for task
const taskRouter = require('./routers/task');

const app = express();
/* Automatically parse JSON to an Object */
app.use(express.json());
/* Enables the using of router*/
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
