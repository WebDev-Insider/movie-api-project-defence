const externalApiService = require('../services/externalApiService');
const Movie = require('../models/Movie');

// @desc    Search movies from external APIs
// @route   GET /api/v1/external/search
// @access  Public
const searchExternalMovies = async (req, res, next) => {
  try {
    const { query, source, page = 1, year } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let results;

    switch (source?.toLowerCase()) {
      case 'tmdb':
        results = await externalApiService.searchTMDB(query, page);
        break;
      case 'omdb':
        results = await externalApiService.searchOMDB(query, year);
        break;
      case 'rapidapi':
      case 'imdb':
        results = await externalApiService.searchRapidAPI(query);
        break;
      case 'all':
      default:
        results = await externalApiService.searchAllSources(query, {
          excludeTMDB: req.query.excludeTMDB === 'true',
          excludeOMDB: req.query.excludeOMDB === 'true',
          excludeRapidAPI: req.query.excludeRapidAPI === 'true'
        });
        break;
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie details from external API
// @route   GET /api/v1/external/details/:source/:id
// @access  Public
const getExternalMovieDetails = async (req, res, next) => {
  try {
    const { source, id } = req.params;

    let movieDetails;

    switch (source.toLowerCase()) {
      case 'tmdb':
        movieDetails = await externalApiService.getTMDBMovieDetails(id);
        break;
      case 'omdb':
        movieDetails = await externalApiService.getOMDBMovieDetails(id);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported source. Use: tmdb, omdb'
        });
    }

    res.status(200).json({
      success: true,
      data: movieDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import movie from external API to local database
// @route   POST /api/v1/external/import
// @access  Admin
const importMovieFromExternal = async (req, res, next) => {
  try {
    const { source, externalId, overwrite = false } = req.body;

    if (!source || !externalId) {
      return res.status(400).json({
        success: false,
        message: 'Source and external ID are required'
      });
    }

    // Get movie data from external API
    const movieData = await externalApiService.importMovieFromExternal(source, externalId);

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ 
      $or: [
        { title: movieData.title, releaseYear: movieData.releaseYear },
        { [`externalIds.${source}`]: externalId }
      ]
    });

    if (existingMovie && !overwrite) {
      return res.status(409).json({
        success: false,
        message: 'Movie already exists in database',
        data: existingMovie
      });
    }

    let movie;

    if (existingMovie && overwrite) {
      // Update existing movie
      Object.assign(existingMovie, movieData);
      if (!existingMovie.externalIds) existingMovie.externalIds = {};
      existingMovie.externalIds[source] = externalId;
      movie = await existingMovie.save();
    } else {
      // Create new movie
      movieData.externalIds = { [source]: externalId };
      movie = await Movie.create(movieData);
    }

    res.status(201).json({
      success: true,
      message: `Movie imported successfully from ${source.toUpperCase()}`,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import movies from external API
// @route   POST /api/v1/external/bulk-import
// @access  Admin
const bulkImportMovies = async (req, res, next) => {
  try {
    const { searchQuery, source = 'tmdb', limit = 10 } = req.body;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required for bulk import'
      });
    }

    // Search for movies
    let searchResults;
    switch (source.toLowerCase()) {
      case 'tmdb':
        searchResults = await externalApiService.searchTMDB(searchQuery);
        break;
      case 'omdb':
        searchResults = await externalApiService.searchOMDB(searchQuery);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported source for bulk import. Use: tmdb, omdb'
        });
    }

    const moviesToImport = searchResults.results.slice(0, limit);
    const importResults = {
      successful: [],
      failed: [],
      skipped: []
    };

    for (const movieSummary of moviesToImport) {
      try {
        // Get detailed movie data
        const movieData = await externalApiService.importMovieFromExternal(
          source, 
          movieSummary.externalId
        );

        // Check if movie already exists
        const existingMovie = await Movie.findOne({ 
          title: movieData.title, 
          releaseYear: movieData.releaseYear 
        });

        if (existingMovie) {
          importResults.skipped.push({
            title: movieData.title,
            reason: 'Already exists'
          });
          continue;
        }

        // Create new movie
        movieData.externalIds = { [source]: movieSummary.externalId };
        const movie = await Movie.create(movieData);
        
        importResults.successful.push({
          title: movie.title,
          id: movie._id
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        importResults.failed.push({
          title: movieSummary.title,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk import completed. ${importResults.successful.length} imported, ${importResults.skipped.length} skipped, ${importResults.failed.length} failed`,
      data: importResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync existing movie with external API data
// @route   PUT /api/v1/external/sync/:id
// @access  Admin
const syncMovieWithExternal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { source = 'tmdb' } = req.body;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Try to find the movie in external API by title and year
    let searchResults;
    switch (source.toLowerCase()) {
      case 'tmdb':
        searchResults = await externalApiService.searchTMDB(movie.title);
        break;
      case 'omdb':
        searchResults = await externalApiService.searchOMDB(movie.title, movie.releaseYear);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported source. Use: tmdb, omdb'
        });
    }

    // Find matching movie
    const matchingMovie = searchResults.results.find(result => 
      result.title.toLowerCase() === movie.title.toLowerCase() && 
      result.releaseYear === movie.releaseYear
    );

    if (!matchingMovie) {
      return res.status(404).json({
        success: false,
        message: `Movie not found in ${source.toUpperCase()} API`
      });
    }

    // Get detailed data and update movie
    const updatedData = await externalApiService.importMovieFromExternal(
      source, 
      matchingMovie.externalId
    );

    // Preserve original creation date and ID
    const originalCreatedAt = movie.createdAt;
    const originalId = movie._id;

    Object.assign(movie, updatedData);
    movie.createdAt = originalCreatedAt;
    movie._id = originalId;

    if (!movie.externalIds) movie.externalIds = {};
    movie.externalIds[source] = matchingMovie.externalId;

    await movie.save();

    res.status(200).json({
      success: true,
      message: `Movie synced successfully with ${source.toUpperCase()}`,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchExternalMovies,
  getExternalMovieDetails,
  importMovieFromExternal,
  bulkImportMovies,
  syncMovieWithExternal
};
