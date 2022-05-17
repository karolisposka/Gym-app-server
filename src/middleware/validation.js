const joi = require('joi');

const validation = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validateAsync(req.body);
    return next();
  } catch (err) {
    res.status(400).send({ msg: 'wrong data passed' });
  }
};

module.exports = validation;
