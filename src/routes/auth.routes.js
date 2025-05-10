const express = require("express");
const router = express.Router();
const {registerValidation, loginValidation} = require("../validation/auth.validation");
const {register, login} = require("../controllers/auth.controller");

router.post("/register", registerValidation, register);

router.post("/login", loginValidation, login);

router.get("/verify-email", (req, res) => {
    res.send("Verify Email");
});

router.post("/forgot-password", (req, res) => {
    res.send("Forgot Password");
});

router.post("/reset-password", (req, res) => {
    res.send("Reset Password");
});

router.post("/logout", (req, res) => {
    res.send("Logout");
});

module.exports = router;