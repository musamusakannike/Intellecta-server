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

const courseCreationValidation = [
  expressValidator
    .body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),
  expressValidator
    .body("description")
    .optional()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
  expressValidator
    .body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  expressValidator
    .body("categories")
    .notEmpty()
    .withMessage("Categories are required")
    .isArray()
    .withMessage("Categories must be an array"),

  validateRequest,
];

const topicCreationValidation = [
  expressValidator
    .body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),
  expressValidator
    .body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
  expressValidator
    .body("order")
    .notEmpty()
    .withMessage("Order is required")
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),
  expressValidator
    .body("course")
    .notEmpty()
    .withMessage("Course is required")
    .isMongoId()
    .withMessage("Course must be a valid MongoDB ID"),

  validateRequest,
];

module.exports = {
  courseCreationValidation,
  topicCreationValidation,
};
