const express = require('express');
const mysql = require('mysql2/promise');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  mysqlConfig,
  jwtCode,
  mailServerPassword,
  mailServer,
} = require('../../config');
const {
  loginValidation,
  registerValidation,
  changePasswordValidation,
  resetPasswordValidation,
  newPasswordValidation,
} = require('../../middleware/validationSchemas/usersValidation');
const validation = require('../../middleware/validation');
const checkIfLoggedIn = require('../../middleware/authorization');
const router = express.Router();

router.post('/login', validation(loginValidation), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT id, password
       FROM users 
       WHERE email=${mysql.escape(req.body.email)}
        LIMIT 1`,
    );
    await con.end();
    if (data.length !== 1) {
      return res.status(400).send({ msg: 'user does not exist' });
    }
    checkHash = bcrypt.compareSync(req.body.password, data[0].password);
    if (!checkHash) {
      return res.status(400).send({ msg: 'wrong password' });
    }
    const token = jwt.sign(data[0].id, jwtCode);
    console.log(token);
    return res.send({ msg: 'successfully logged in', token });
  } catch (err) {
    return res.send({
      msg: 'Something wrong with the server. Please try again later',
    });
  }
});

router.post('/register', validation(registerValidation), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const [data] = await con.execute(`INSERT INTO users (email, password)
    VALUES(${mysql.escape(req.body.email)}, ${mysql.escape(hashedPassword)})`);
    await con.end();
    if (!data.insertId) {
      return res.status(500).send({
        msg: 'Something wrong with the server. Please try again later',
      });
    }
    return res.send({ msg: 'registration completed' });
  } catch (err) {
    if (err.errno === 1062) {
      return res.send({ msg: 'User already exist' });
    }
    return res
      .status(500)
      .send({ msg: 'Something wrong with the server. Please try again later' });
  }
});

router.post(
  '/change-password',
  validation(changePasswordValidation),
  checkIfLoggedIn,
  async (req, res) => {
    try {
      const con = await mysql.createConnection(mysqlConfig);
      const [data] = await con.execute(
        `SELECT id, email, password FROM users WHERE id=${mysql.escape(
          req.user.id,
        )} LIMIT 1`,
      );
      const chechHash = bcrypt.compareSync(
        req.body.oldPassword,
        data[0].password,
      );

      if (!chechHash) {
        await con.end();
        return res.status(400).send({ err: 'Incorrect old password' });
      }

      const newPasswordHash = bcrypt.hashSync(req.body.newPassword, 10);

      const changePassDBRes = await con.execute(
        `UPDATE users SET password=${mysql.escape(newPasswordHash)} WHERE id=${
          req.user.id
        }`,
      );

      await con.end();
      return res.send({ msg: 'Password changed' });
    } catch (err) {
      console.log(`${err} change`);
      return res
        .status(500)
        .send({ msg: 'something wrong with server, please try again later' });
    }
  },
);

router.post(
  '/reset-password',
  validation(resetPasswordValidation),
  async (req, res) => {
    try {
      const con = await mysql.createConnection(mysqlConfig);
      const [data1] = await con.execute(
        `SELECT id FROM users WHERE email = ${mysql.escape(
          req.body.email,
        )} LIMIT 1`,
      );

      if (data1.length !== 1) {
        await con.end();
        return res.send({
          msg: 'If your email is correct, you will shortly get a message',
        });
      }

      const randomCode = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '');

      const [data2] = await con.execute(`
    INSERT INTO reset_tokens (email, code)
    VALUES (${mysql.escape(req.body.email)}, '${randomCode}')
  `);

      if (!data2.insertId) {
        return res
          .status(500)
          .send({ msg: 'something wrong with server, please try again later' });
      }
      const response = await fetch(mailServer, {
        method: 'POST',
        body: JSON.stringify({
          auth: mailServerPassword,
          to: req.body.email,
          text: `Please visit this link http://127.0.0.1:5500/newPassword.html?email=${encodeURI(
            req.body.email,
          )}&token=${randomCode}`,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      console.log(json);

      if (!json.id) {
        return res.status(500).send({
          msg: 'something wrong with the server, please try again later',
        });
      }

      return res.send({
        msg: 'If your email is correct, you will shortly get a message',
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        msg: 'something wrong with the server, please try again later',
      });
    }
  },
);

router.post(
  '/new-password',
  validation(newPasswordValidation),
  async (req, res) => {
    try {
      const con = await mysql.createConnection(mysqlConfig);
      const [data] = await con.execute(
        `SELECT * FROM reset_tokens WHERE email=${mysql.escape(
          req.body.email,
        )} AND code=${mysql.escape(req.body.token)} LIMIT 1`,
      );

      if (data.length !== 1) {
        await con.end();
        return res
          .status(400)
          .send({ err: 'Invalid change password request. Please try again' });
      }

      if (
        (new Date().getTime() - new Date(data[0].timestamp).getTime()) / 60000 >
        30
      ) {
        await con.end();
        return res
          .status(400)
          .send({ err: 'Invalid change password request. Please try again' });
      }

      const hashedPassword = bcrypt.hashSync(req.body.password, 10);

      const [changeResponse] = await con.execute(`
      UPDATE users
      SET password = ${mysql.escape(hashedPassword)}
      WHERE email = ${mysql.escape(req.body.email)}
    `);

      if (!changeResponse.affectedRows) {
        await con.end();
        return res
          .status(500)
          .send({ msg: 'something wrong with server, please try again later' });
      }

      await con.execute(`
      DELETE FROM reset_tokens
      WHERE id = ${data[0].id}
    `);

      await con.end();
      return res.send({ msg: 'Password change request complete' });
    } catch (err) {
      console.log(`${err} change`);
      return res
        .status(500)
        .send({ msg: 'something wrong with server, please try again later' });
    }
  },
);

module.exports = router;
