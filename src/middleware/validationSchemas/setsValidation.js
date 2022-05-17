const joi = require('joi');

const setsSchema = joi.object({
  weight: joi.required(),
  sets: joi.required(),
  reps: joi.required(),
  exercise_id: joi.required(),
});

module.exports = setsSchema;
