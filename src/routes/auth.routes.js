const express = require("express");
const router = express.Router();
const {registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation} = require("../validation/auth.validation");
const {register, login, verifyEmail, forgotPassword, resetPassword} = require("../controllers/auth.controller");
const { authLimiter } = require('../middlewares/rateLimit.middleware');

router.post("/register", authLimiter, registerValidation, register);

router.post("/login", authLimiter, loginValidation, login);

router.get("/verify-email", verifyEmail);

router.post("/forgot-password", authLimiter, forgotPasswordValidation, forgotPassword);

// Handle both GET and POST requests for reset-password
router.get("/reset-password", resetPassword);
router.post("/reset-password", authLimiter, resetPasswordValidation, resetPassword);

module.exports = router;