const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const connectDB = require("./config/db.config");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));


app.use("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});


module.exports = app;
