const express = require("express");
const router = express.Router();
const {registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation} = require("../validation/auth.validation");
const {register, login, verifyEmail, requestVerifyEmail, forgotPassword, resetPassword} = require("../controllers/auth.controller");
const { authLimiter } = require('../middlewares/rateLimit.middleware');
const passport = require("passport");

router.post("/register", authLimiter, registerValidation, register);

router.post("/login", authLimiter, loginValidation, login);

router.get("/verify-email", verifyEmail);
router.post("/request-verify-email", requestVerifyEmail);

router.post("/forgot-password", authLimiter, forgotPasswordValidation, forgotPassword);

// Handle both GET and POST requests for reset-password
router.get("/reset-password", resetPassword);
router.post("/reset-password", authLimiter, resetPasswordValidation, resetPassword);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/api/v1/auth/google/failed" }), (req, res) => {
  // Generate JWT and send to frontend (as query param or JSON)
  const jwt = require("jsonwebtoken");
  const user = req.user;
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  // For mobile, you may want to redirect to a custom URL scheme or send JSON
  res.redirect(`${process.env.GOOGLE_REDIRECT_URL}?token=${token}`);
});

router.get("/google/failed", (req, res) => {
  res.status(401).json({ status: "error", message: "Google authentication failed" });
});

// Google OAuth endpoint for mobile POST
router.post("/google", async (req, res) => {
  const { id_token } = req.body;
  const { OAuth2Client } = require('google-auth-library');
  const jwt = require('jsonwebtoken');
  const User = require('../models/user.model');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        username: payload.email.split('@')[0] + Math.floor(Math.random()*10000),
        fullname: payload.name,
        email: payload.email,
        password: Math.random().toString(36).slice(-8),
        isVerified: true,
        profileImage: payload.picture || '',
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      isVerified: user.isVerified,
      profileImage: user.profileImage || '',
      isPremium: user.isPremium,
      joinedDate: user.createdAt,
      role: user.role,
    }});
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Google authentication failed' });
  }
});

module.exports = router;