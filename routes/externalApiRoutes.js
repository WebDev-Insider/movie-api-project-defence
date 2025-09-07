const express = require('express');
const {
  searchExternalMovies,
  getExternalMovieDetails,
  importMovieFromExternal,
  bulkImportMovies,
  syncMovieWithExternal
} = require('../controllers/externalApiController');

const router = express.Router();

// External API search routes
router.get('/search', searchExternalMovies);
router.get('/details/:source/:id', getExternalMovieDetails);

// Import routes (Admin functionality)
router.post('/import', importMovieFromExternal);
router.post('/bulk-import', bulkImportMovies);
router.put('/sync/:id', syncMovieWithExternal);

module.exports = router;
