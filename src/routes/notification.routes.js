const express = require('express');
const router = express.Router();
const roleAuth = require('../middlewares/auth.middleware');
const {
    createNotification,
    getAllNotifications,
    getNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    getUnreadNotifications,
    markAllAsRead
} = require('../controllers/notification.controller');

// Base route for notifications
router.route('/')
    .post(roleAuth(), createNotification)
    .get(roleAuth(), getAllNotifications);

// Route for unread notifications
router.get('/unread', roleAuth(), getUnreadNotifications);

// Route for specific notification by ID
router.route('/:id')
    .get(roleAuth(['admin', 'superadmin']), getNotification)
    .put(roleAuth(['admin', 'superadmin']), updateNotification)
    .delete(roleAuth(['admin', 'superadmin']), deleteNotification);

// Route to mark notification as read
router.post('/:id/read', roleAuth(), markAsRead);

router.post("/mark-all-read", roleAuth(), markAllAsRead);

module.exports = router;