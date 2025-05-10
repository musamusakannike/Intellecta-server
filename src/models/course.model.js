const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  ratingStats: {
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add text indexes for search
courseSchema.index({ title: 'text', description: 'text' });
// Add compound index for category and price filtering
courseSchema.index({ category: 1, price: 1 });
// Add index for rating
courseSchema.index({ 'ratingStats.averageRating': -1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
