const express = require('express');
const {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieStats
} = require('../controllers/movieController');
const {
  validateMovie,
  validateUpdateMovie,
  validateQuery
} = require('../middleware/validation');

const router = express.Router();

// Movie statistics route (must be before /:id route)
router.get('/stats', getMovieStats);

// Main CRUD routes
router.route('/')
  .get(validateQuery, getMovies)
  .post(validateMovie, createMovie);

router.route('/:id')
  .get(getMovie)
  .put(validateUpdateMovie, updateMovie)
  .delete(deleteMovie);

module.exports = router;
