const express = require('express');
const mysql = require('mysql2/promise');
const validation = require('../../middleware/validation');
const checkIfLoggedIn = require('../../middleware/authorization');
const { mysqlConfig } = require('../../config');
const setsSchema = require('../../middleware/validationSchemas/setsValidation');

const router = express.Router();

router.post('/', checkIfLoggedIn, validation(setsSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] =
      await con.execute(`INSERT INTO sets (exercise_id, weight, sets, reps, user_id)
    VALUES(${mysql.escape(req.body.exercise_id)}, ${mysql.escape(
        req.body.weight,
      )}, ${mysql.escape(req.body.sets)}, ${mysql.escape(
        req.body.reps,
      )},${mysql.escape(req.user)})`);
    await con.end();
    if (!data.insertId) {
      return res.status(500).send({
        msg: 'Something wrong with the server. Please try again later',
      });
    }
    return res.send({ msg: 'data successfully added' });
  } catch (err) {
    console.log(err);
    return res.send({
      msg: 'something wrong with the server. Please try again later',
    });
  }
});

module.exports = router;
