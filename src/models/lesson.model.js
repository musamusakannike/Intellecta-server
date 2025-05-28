const mongoose = require("mongoose")

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "image", "code", "latex", "link", "video", "youtubeUrl"],
    required: true,
  },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  order: { type: Number, required: true },
})

// New schema for content groups
const contentGroupSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  contents: [contentSchema],
  order: { type: Number, required: true },
})

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
})

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  contentGroups: [contentGroupSchema], // Replace contents with contentGroups
  quiz: [quizSchema],
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Lesson = mongoose.model("Lesson", lessonSchema)

module.exports = Lesson
