const expressValidator = require("express-validator")
const { validationResult } = expressValidator

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]
    return res.status(400).json({
      status: "error",
      message: firstError.msg,
    })
  }
  next()
}

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
]

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
]

const lessonCreationValidation = [
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
    .body("topic")
    .notEmpty()
    .withMessage("Topic is required")
    .isMongoId()
    .withMessage("Topic must be a valid MongoDB ID"),
  expressValidator
    .body("contentGroups")
    .isArray()
    .withMessage("Content groups must be an array")
    .custom((contentGroups) => {
      if (!contentGroups || contentGroups.length === 0) {
        throw new Error("At least one content group is required")
      }
      return true
    }),
  expressValidator.body("contentGroups.*.title").notEmpty().withMessage("Content group title is required"),
  expressValidator
    .body("contentGroups.*.contents")
    .isArray()
    .withMessage("Contents must be an array")
    .custom((contents) => {
      if (!contents || contents.length === 0) {
        throw new Error("At least one content item is required in each group")
      }
      return true
    }),
  expressValidator
    .body("contentGroups.*.order")
    .isInt({ min: 0 })
    .withMessage("Content group order must be a non-negative integer"),
  expressValidator
    .body("contentGroups.*.contents.*.type")
    .isIn(["text", "image", "code", "latex", "link", "video", "youtubeUrl"])
    .withMessage("Invalid content type"),
  expressValidator.body("contentGroups.*.contents.*.content").notEmpty().withMessage("Content is required"),
  expressValidator
    .body("contentGroups.*.contents.*.order")
    .isInt({ min: 0 })
    .withMessage("Content order must be a non-negative integer"),
  expressValidator.body("quiz").optional().isArray().withMessage("Quiz must be an array"),
  expressValidator
    .body("quiz.*.question")
    .if(expressValidator.body("quiz").exists())
    .notEmpty()
    .withMessage("Question is required"),
  expressValidator
    .body("quiz.*.options")
    .if(expressValidator.body("quiz").exists())
    .isArray({ min: 2 })
    .withMessage("At least 2 options are required"),
  expressValidator
    .body("quiz.*.correctAnswer")
    .if(expressValidator.body("quiz").exists())
    .isInt({ min: 0 })
    .withMessage("Correct answer must be a valid option index"),
  expressValidator
    .body("order")
    .notEmpty()
    .withMessage("Order is required")
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
  expressValidator.body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),

  validateRequest,
]

module.exports = {
  courseCreationValidation,
  topicCreationValidation,
  lessonCreationValidation,
}
