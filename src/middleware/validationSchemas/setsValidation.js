const joi = require('joi');

const setsSchema = joi.object({
  weight: joi.number().max(250).required(),
  sets: joi.number().max(50).required(),
  reps: joi.number().max(50).required(),
  exercise_id: joi.required(),
});

module.exports = setsSchema;
