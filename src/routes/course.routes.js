const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const topicController = require('../controllers/topic.controller');
const lessonController = require('../controllers/lesson.controller');
const roleAuth = require('../middlewares/auth.middleware');

// Course routes
router.post('/', roleAuth(['admin']), courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);
router.put('/:id', roleAuth(['admin', "superadmin"]), courseController.updateCourse);
router.delete('/:id', roleAuth(['admin', "superadmin"]), courseController.deleteCourse);

// Topic routes
router.post('/:courseId/topics', roleAuth(['admin', "superadmin"]), topicController.createTopic);
router.get('/:courseId/topics', roleAuth(), topicController.getTopicsByCourse);
router.get('/topics/:id', roleAuth(), topicController.getTopic);
router.put('/topics/:id', roleAuth(['admin', "superadmin"]), topicController.updateTopic);
router.delete('/topics/:id', roleAuth(['admin', "superadmin"]), topicController.deleteTopic);

// Lesson routes
router.post('/topics/:topicId/lessons', roleAuth(['admin', "superadmin"]), lessonController.createLesson);
router.get('/lessons/:id', roleAuth(), lessonController.getLesson);
router.put('/lessons/:id', roleAuth(['admin', "superadmin"]), lessonController.updateLesson);
router.delete('/lessons/:id', roleAuth(['admin', "superadmin"]), lessonController.deleteLesson);
router.post('/lessons/:id/quiz', roleAuth(['admin', "superadmin"]), lessonController.submitQuiz);

module.exports = router; 