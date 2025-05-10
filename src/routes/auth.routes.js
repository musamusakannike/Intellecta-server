const express = require("express");
const router = express.Router();
const {registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation} = require("../validation/auth.validation");
const {register, login, verifyEmail, forgotPassword, resetPassword} = require("../controllers/auth.controller");

router.post("/register", registerValidation, register);

router.post("/login", loginValidation, login);

router.get("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

// Handle both GET and POST requests for reset-password
router.get("/reset-password", resetPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);

router.post("/logout", (req, res) => {
    res.send("Logout");
});

module.exports = router;