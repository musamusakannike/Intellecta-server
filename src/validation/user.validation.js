const expressValidator = require("express-validator");
const { validationResult } = expressValidator;

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      status: "error",
      message: firstError.msg,
    });
  }
  next();
};

const updateUserValidation = [
  expressValidator
    .body("username")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  expressValidator
    .body("fullname")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Fullname must be at least 3 characters long"),
  expressValidator
    .body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email"),
  expressValidator
    .body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  validateRequest,
];

module.exports = { updateUserValidation };
