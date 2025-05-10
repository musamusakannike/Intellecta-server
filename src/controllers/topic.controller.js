const Topic = require('../models/topic.model');
const Lesson = require('../models/lesson.model');

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all topics for a course
exports.getTopicsByCourse = async (req, res) => {
  try {
    const topics = await Topic.find({ 
      course: req.params.courseId,
      isActive: true 
    }).sort({ order: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single topic with its lessons
exports.getTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const lessons = await Lesson.find({ 
      topic: topic._id,
      isActive: true 
    }).sort({ order: 1 });

    res.json({ topic, lessons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a topic
exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a topic (soft delete)
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 