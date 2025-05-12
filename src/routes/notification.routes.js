const express = require('express');
const router = express.Router();
const roleAuth = require('../middlewares/auth.middleware');
const {
    createNotification,
    getAllNotifications,
    getNotification,
    updateNotification,
    deleteNotification
} = require('../controllers/notification.controller');

// Base route for notifications
router.route('/')
    .post(roleAuth(), createNotification)
    .get(roleAuth(), getAllNotifications);

// Route for specific notification by ID
router.route('/:id')
    .get(roleAuth(['admin', 'superadmin']), getNotification)
    .put(roleAuth(['admin', 'superadmin']), updateNotification)
    .delete(roleAuth(['admin', 'superadmin']), deleteNotification);

module.exports = router; 