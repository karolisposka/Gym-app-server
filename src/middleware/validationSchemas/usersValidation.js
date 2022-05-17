const joi = require('joi');

const loginValidation = joi.object({
  email: joi.string().email().trim().required(),
  password: joi.string().required(),
});

const registerValidation = joi.object({
  email: joi.string().email().trim().required(),
  password: joi.string().min(8).required(),
});

const changePasswordValidation = joi.object({
  oldPassword: joi.string().min(8).required(),
  newPassword: joi.string().min(8).required(),
});

const resetPasswordValidation = joi.object({
  email: joi.string().email().lowercase().required(),
});

const newPasswordValidation = joi.object({
  email: joi.string().email().lowercase().required(),
  token: joi.string().required(),
  password: joi.string().required(),
});

module.exports = {
  loginValidation,
  registerValidation,
  changePasswordValidation,
  resetPasswordValidation,
  newPasswordValidation,
};
