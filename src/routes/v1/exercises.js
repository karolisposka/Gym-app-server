const express = require('express');
const mysql = require('mysql2/promise');
const checkIfLoggedIn = require('../../middleware/authorization');
const { mysqlConfig } = require('../../config');

const router = express.Router();

router.get('/', checkIfLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`SELECT * FROM exercises`);
    await con.end();
    if (data.length < 1) {
      return res.send({
        msg: 'something wrong with the server.Please try again later',
      });
    }
    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ msg: 'Something wrong with the server. Please try again later' });
  }
});

module.exports = router;
