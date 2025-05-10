const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to ensure one review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

// Add text indexes for search
reviewSchema.index({ title: 'text', content: 'text' });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review; 