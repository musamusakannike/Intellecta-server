const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { generalLimiter } = require("./middlewares/rateLimit.middleware");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user.model");

const connectDB = require("./config/db.config");
const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const userRoutes = require("./routes/user.routes");
const notificationRoutes = require("./routes/notification.routes");

dotenv.config();

connectDB();

const app = express();

// Passport Google OAuth setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/v1/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random()*10000),
        fullname: profile.displayName,
        email: profile.emails[0].value,
        password: Math.random().toString(36).slice(-8), // random password
        isVerified: true,
        profileImage: profile.photos?.[0]?.value || '',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Apply rate limiting to all routes
app.use(generalLimiter);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/notifications", notificationRoutes);

module.exports = app;
