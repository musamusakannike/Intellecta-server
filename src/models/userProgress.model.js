const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, default: false },
  quizScore: { type: Number },
  lastAccessed: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index to ensure a user can only have one progress record per lesson
userProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

module.exports = UserProgress; 