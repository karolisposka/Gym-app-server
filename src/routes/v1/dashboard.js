const express = require('express');
const mysql = require('mysql2/promise');
const checkIfLoggedIn = require('../../middleware/authorization');
const { mysqlConfig } = require('../../config');
const router = express.Router();

router.get('/stats', checkIfLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    console.log(req.user);
    const [data] = await con.execute(
      `SELECT *, exercises.id FROM sets LEFT JOIN exercises ON sets.exercise_id = exercises.id WHERE sets.user_id = ${req.user} `,
    );
    await con.end();
    if (data.length < 1) {
      return res.send({ msg: 'data does not exist' });
    }
    return res.send(data);
  } catch (err) {
    return res.send('something wrong with server, please try later');
  }
});

router.get('/userData', checkIfLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT reps, weight, sets, created_at, exercises.title FROM sets LEFT JOIN exercises ON sets.exercise_id = exercises.id WHERE sets.user_id =${mysql.escape(
        req.user,
      )}`,
    );
    await con.end();
    res.send(data);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ msg: 'something wrong with server, please try later' });
  }
});

module.exports = router;
