const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { generalLimiter } = require("./middlewares/rateLimit.middleware");

const connectDB = require("./config/db.config");
const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const userRoutes = require("./routes/user.routes");
const notificationRoutes = require("./routes/notification.routes");

dotenv.config();

connectDB();

const app = express();

// Apply rate limiting to all routes
app.use(generalLimiter);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));

app.use("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/notifications", notificationRoutes);

module.exports = app;
