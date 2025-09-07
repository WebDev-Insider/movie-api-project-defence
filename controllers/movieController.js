const Movie = require('../models/Movie');

// @desc    Get all movies with search, filter, and pagination
// @route   GET /api/v1/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      genre,
      director,
      releaseYear,
      minRating,
      maxRating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    let query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by genre
    if (genre) {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    // Filter by director
    if (director) {
      query.director = new RegExp(director, 'i');
    }

    // Filter by release year
    if (releaseYear) {
      query.releaseYear = releaseYear;
    }

    // Filter by rating range
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const movies = await Movie.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Movie.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      count: movies.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      data: movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie
// @route   GET /api/v1/movies/:id
// @access  Public
const getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/v1/movies
// @access  Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/v1/movies/:id
// @access  Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/v1/movies/:id
// @access  Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie statistics
// @route   GET /api/v1/movies/stats
// @access  Public
const getMovieStats = async (req, res, next) => {
  try {
    const stats = await Movie.aggregate([
      {
        $group: {
          _id: null,
          totalMovies: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          highestRating: { $max: '$rating' },
          lowestRating: { $min: '$rating' },
          newestYear: { $max: '$releaseYear' },
          oldestYear: { $min: '$releaseYear' }
        }
      }
    ]);

    const genreStats = await Movie.aggregate([
      { $unwind: '$genre' },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        topGenres: genreStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieStats
};
