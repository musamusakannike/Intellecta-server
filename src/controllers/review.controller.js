const Review = require('../models/review.model');
const Course = require('../models/course.model');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, title, content } = req.body;

    // Check if user has already reviewed this course
    const existingReview = await Review.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this course' 
      });
    }

    // Create new review
    const review = new Review({
      user: req.user._id,
      course: courseId,
      rating,
      title,
      content
    });

    await review.save();

    // Update course rating statistics
    await updateCourseRatingStats(courseId);

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get reviews for a course
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ 
      course: courseId,
      isActive: true 
    })
      .populate('user', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ 
      course: courseId,
      isActive: true 
    });

    res.json({
      reviews,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, content } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = rating;
    review.title = title;
    review.content = content;
    review.updatedAt = Date.now();

    await review.save();

    // Update course rating statistics
    await updateCourseRatingStats(review.course);

    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a review (soft delete)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isActive = false;
    review.updatedAt = Date.now();
    await review.save();

    // Update course rating statistics
    await updateCourseRatingStats(review.course);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update course rating statistics
async function updateCourseRatingStats(courseId) {
  const reviews = await Review.find({ 
    course: courseId,
    isActive: true 
  });

  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };

  let totalRating = 0;

  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
    totalRating += review.rating;
  });

  const averageRating = reviews.length > 0 
    ? totalRating / reviews.length 
    : 0;

  await Course.findByIdAndUpdate(courseId, {
    ratingStats: {
      averageRating,
      totalRatings: reviews.length,
      ratingDistribution
    }
  });
} 