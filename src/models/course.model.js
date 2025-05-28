const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: false },
  categories: [{ type: String, required: true }],
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
courseSchema.index({ categories: 1, price: 1 });
// Add index for rating
courseSchema.index({ 'ratingStats.averageRating': -1 });

// Ensure all categories are stored in lowercase
courseSchema.pre('save', function (next) {
  if (this.categories && Array.isArray(this.categories)) {
    this.categories = this.categories.map(cat => typeof cat === 'string' ? cat.toLowerCase() : cat);
  }
  next();
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
