const Joi = require('joi');

// Movie validation schema
const movieSchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Movie title is required',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Movie title is required'
  }),
  genre: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    'array.min': 'At least one genre is required',
    'any.required': 'Genre is required'
  }),
  director: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Director is required',
    'string.max': 'Director name cannot exceed 100 characters',
    'any.required': 'Director is required'
  }),
  releaseYear: Joi.number().integer().min(1888).max(new Date().getFullYear() + 5).required().messages({
    'number.min': 'Release year must be after 1888',
    'number.max': 'Release year cannot be more than 5 years in the future',
    'any.required': 'Release year is required'
  }),
  rating: Joi.number().min(0).max(10).optional().messages({
    'number.min': 'Rating cannot be less than 0',
    'number.max': 'Rating cannot be more than 10'
  }),
  description: Joi.string().trim().max(1000).optional().messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  duration: Joi.number().integer().min(1).optional().messages({
    'number.min': 'Duration must be at least 1 minute'
  }),
  poster: Joi.string().uri().optional(),
  cast: Joi.array().items(Joi.string().trim()).optional(),
  language: Joi.string().trim().optional(),
  country: Joi.string().trim().optional(),
  budget: Joi.number().min(0).optional().messages({
    'number.min': 'Budget cannot be negative'
  }),
  boxOffice: Joi.number().min(0).optional().messages({
    'number.min': 'Box office cannot be negative'
  })
});

// Update movie validation schema (all fields optional except id)
const updateMovieSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  genre: Joi.array().items(Joi.string().trim()).min(1).optional(),
  director: Joi.string().trim().max(100).optional(),
  releaseYear: Joi.number().integer().min(1888).max(new Date().getFullYear() + 5).optional(),
  rating: Joi.number().min(0).max(10).optional(),
  description: Joi.string().trim().max(1000).optional(),
  duration: Joi.number().integer().min(1).optional(),
  poster: Joi.string().uri().optional(),
  cast: Joi.array().items(Joi.string().trim()).optional(),
  language: Joi.string().trim().optional(),
  country: Joi.string().trim().optional(),
  budget: Joi.number().min(0).optional(),
  boxOffice: Joi.number().min(0).optional()
});

// Query parameters validation
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().optional(),
  genre: Joi.string().trim().optional(),
  director: Joi.string().trim().optional(),
  releaseYear: Joi.number().integer().min(1888).max(new Date().getFullYear() + 5).optional(),
  minRating: Joi.number().min(0).max(10).optional(),
  maxRating: Joi.number().min(0).max(10).optional(),
  sortBy: Joi.string().valid('title', 'releaseYear', 'rating', 'createdAt').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  // External API parameters
  query: Joi.string().trim().optional(),
  source: Joi.string().valid('tmdb', 'omdb', 'rapidapi', 'imdb', 'all').optional(),
  year: Joi.number().integer().min(1888).max(new Date().getFullYear() + 5).optional(),
  excludeTMDB: Joi.boolean().optional(),
  excludeOMDB: Joi.boolean().optional(),
  excludeRapidAPI: Joi.boolean().optional()
});

// Validation middleware
const validateMovie = (req, res, next) => {
  const { error } = movieSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateUpdateMovie = (req, res, next) => {
  const { error } = updateMovieSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateQuery = (req, res, next) => {
  const { error } = querySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

module.exports = {
  validateMovie,
  validateUpdateMovie,
  validateQuery
};
