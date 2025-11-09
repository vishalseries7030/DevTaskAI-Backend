const { celebrate, Joi, Segments } = require('celebrate');

// Register validation
const validateRegister = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

// Login validation
const validateLogin = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

module.exports = {
  validateRegister,
  validateLogin,
};
