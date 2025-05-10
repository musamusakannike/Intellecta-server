const Course = require('../models/course.model');
const Topic = require('../models/topic.model');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all courses with search and filtering
exports.getAllCourses = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Add search condition if search term is provided
    if (search) {
      query.$text = { $search: search };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Add featured filter
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with sorting and pagination
    const courses = await Course.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    res.json({
      courses,
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

// Advanced search with multiple criteria
exports.advancedSearch = async (req, res) => {
  try {
    const {
      searchTerm,
      categories,
      priceRange,
      isFeatured,
      hasTopics,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.body;

    // Build query
    const query = { isActive: true };

    // Add text search
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    // Add category filter (multiple categories)
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    // Add price range
    if (priceRange) {
      query.price = {
        $gte: priceRange.min || 0,
        $lte: priceRange.max || Number.MAX_VALUE
      };
    }

    // Add featured filter
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with sorting and pagination
    const courses = await Course.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    // If hasTopics is true, populate topics
    if (hasTopics) {
      await Course.populate(courses, {
        path: 'topics',
        match: { isActive: true },
        select: 'title description order'
      });
    }

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    res.json({
      courses,
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

// Get a single course with its topics
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const topics = await Topic.find({ course: course._id, isActive: true })
      .sort({ order: 1 });
    
    res.json({ course, topics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a course (soft delete)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 