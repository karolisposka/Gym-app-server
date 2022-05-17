const jwt = require('jsonwebtoken');
const { jwtCode } = require('../config');

const checkIfLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    req.user = jwt.verify(token, jwtCode);
    return next();
  } catch (err) {
    res
      .status(500)
      .send({ msg: 'Something wrong with the server. Please try again later' });
  }
};

module.exports = checkIfLoggedIn;
