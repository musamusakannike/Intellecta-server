const Lesson = require("../models/lesson.model");
const UserProgress = require("../models/userProgress.model");

// Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all lessons
exports.getAllLessons = async (req, res) => {
  try {
    const { topicId } = req.params;
    const lessons = await Lesson.find({ topic: topicId }).select(
      "-contentGroups -quiz"
    );
    res.json({
      status: "success",
      message: "Lessons fetched successfully",
      lessons,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a lesson with access control
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check if this is the first lesson in the topic
    const isFirstLesson = await Lesson.findOne({
      topic: lesson.topic,
      order: { $lt: lesson.order },
    });

    if (!isFirstLesson) {
      // If it's the first lesson, return full content
      return res.json(lesson);
    }

    // For other lessons, check user progress
    const userProgress = await UserProgress.findOne({
      user: req.user._id,
      lesson: isFirstLesson._id,
    });

    if (!userProgress || !userProgress.completed) {
      return res.status(403).json({
        message: "Complete the previous lesson first",
        requiredLesson: isFirstLesson._id,
      });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a lesson
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json(lesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a lesson (soft delete)
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const { answers } = req.body;
    let score = 0;
    const totalQuestions = lesson.quiz.length;

    // Check answers
    lesson.quiz.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    // Calculate percentage
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 70; // 70% passing threshold

    // Update user progress
    const userProgress = await UserProgress.findOneAndUpdate(
      {
        user: req.user._id,
        lesson: lesson._id,
      },
      {
        completed: passed,
        quizScore: percentage,
        lastAccessed: Date.now(),
      },
      { upsert: true, new: true }
    );

    res.json({
      score: percentage,
      passed,
      userProgress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
