const express = require('express');
const cors = require('cors');
const { port } = require('./config');
const app = express();
app.use(cors());
app.use(express.json());
const userRoutes = require('../src/routes/v1/users');
const exercisesRoute = require('../src/routes/v1/exercises');
const setsRoute = require('../src/routes/v1/addSet');
const statsRoute = require('../src/routes/v1/dashboard');

app.use('/v1/users/', userRoutes);
app.use('/v1/exercises/', exercisesRoute);
app.use('/v1/addSet/', setsRoute);
app.use('/v1/dashboard/', statsRoute);

app.get('/', (req, res) => {
  res.send({ msg: 'server is running' });
});

app.listen(port, () => {
  return console.log(`server is running on ${port} port`);
});
