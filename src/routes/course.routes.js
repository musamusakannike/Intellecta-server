const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");
const topicController = require("../controllers/topic.controller");
const lessonController = require("../controllers/lesson.controller");
const reviewController = require("../controllers/review.controller");
const roleAuth = require("../middlewares/auth.middleware");
const {
  courseCreationLimiter,
  reviewLimiter,
} = require("../middlewares/rateLimit.middleware");
const {
  courseCreationValidation,
  topicCreationValidation,
  lessonCreationValidation,
} = require("../validation/course.validation");

// Course routes
router.post(
  "/",
  courseCreationValidation,
  courseCreationLimiter,
  roleAuth(["admin", "superadmin"]),
  courseController.createCourse
);
router.get("/", courseController.getAllCourses);
router.post("/search", courseController.advancedSearch);
router.get("/:id", courseController.getCourse);
router.put(
  "/:id",
  roleAuth(["admin", "superadmin"]),
  courseController.updateCourse
);
router.delete(
  "/:id",
  roleAuth(["admin", "superadmin"]),
  courseController.deleteCourse
);

// Review routes
router.post(
  "/:courseId/reviews",
  reviewLimiter,
  roleAuth(),
  reviewController.createReview
);
router.get("/:courseId/reviews", reviewController.getCourseReviews);
router.put(
  "/reviews/:reviewId",
  reviewLimiter,
  roleAuth(),
  reviewController.updateReview
);
router.delete(
  "/reviews/:reviewId",
  reviewLimiter,
  roleAuth(),
  reviewController.deleteReview
);

// Topic routes
router.post(
  "/:courseId/topics",
  topicCreationValidation,
  courseCreationLimiter,
  roleAuth(["admin", "superadmin"]),
  topicController.createTopic
);
router.get("/:courseId/topics", roleAuth(), topicController.getTopicsByCourse);
router.get("/topics/:id", roleAuth(), topicController.getTopic);
router.put(
  "/topics/:id",
  roleAuth(["admin", "superadmin"]),
  topicController.updateTopic
);
router.delete(
  "/topics/:id",
  roleAuth(["admin", "superadmin"]),
  topicController.deleteTopic
);

// Lesson routes
router.post(
  "/topics/:topicId/lessons",
  lessonCreationValidation,
  courseCreationLimiter,
  roleAuth(["admin", "superadmin"]),
  lessonController.createLesson
);
router.get("/lessons/:topicId", roleAuth(), lessonController.getAllLessons);
router.get("/lessons/:id", roleAuth(), lessonController.getLesson);
router.put(
  "/lessons/:id",
  roleAuth(["admin", "superadmin"]),
  lessonController.updateLesson
);
router.delete(
  "/lessons/:id",
  roleAuth(["admin", "superadmin"]),
  lessonController.deleteLesson
);
router.post(
  "/lessons/:id/quiz",
  roleAuth(["admin", "superadmin"]),
  lessonController.submitQuiz
);

module.exports = router;
