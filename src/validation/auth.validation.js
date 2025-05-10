const expressValidator = require("express-validator");
const { validationResult } = expressValidator;

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      status: "error",
      message: firstError.msg
    });
  }
  next();
};

const registerValidation = [
    expressValidator.body("username")
      .notEmpty().withMessage("Username is required")
      .isLength({min: 3}).withMessage("Username must be at least 3 characters long"),
    expressValidator.body("fullname")
      .notEmpty().withMessage("Fullname is required")
      .isLength({min: 3}).withMessage("Fullname must be at least 3 characters long"),
    expressValidator.body("email")
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please provide a valid email address"),
    expressValidator.body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
    validateRequest
];

const loginValidation = [
    expressValidator.body("email")
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please provide a valid email address"),
    expressValidator.body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
    validateRequest
];

module.exports = {
    registerValidation,
    loginValidation,
}
