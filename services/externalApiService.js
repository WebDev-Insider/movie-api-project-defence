const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

// Cache for 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600 });

class ExternalApiService {
  constructor() {
    this.tmdbApiKey = process.env.TMDB_API_KEY;
    this.omdbApiKey = process.env.OMDB_API_KEY;
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    
    this.tmdbBaseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
    this.omdbBaseUrl = process.env.OMDB_BASE_URL || 'http://www.omdbapi.com';
    this.rapidApiBaseUrl = process.env.RAPIDAPI_BASE_URL || 'https://imdb-api1.p.rapidapi.com';
  }

  // TMDB API Integration
  async searchTMDB(query, page = 1) {
    try {
      const cacheKey = `tmdb_search_${query}_${page}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      if (!this.tmdbApiKey || this.tmdbApiKey === 'your_tmdb_api_key_here') {
        throw new Error('TMDB API key not configured');
      }

      const response = await axios.get(`${this.tmdbBaseUrl}/search/movie`, {
        params: {
          api_key: this.tmdbApiKey,
          query: query,
          page: page,
          language: 'en-US'
        }
      });

      const result = {
        source: 'TMDB',
        results: response.data.results.map(movie => this.formatTMDBMovie(movie)),
        total_results: response.data.total_results,
        total_pages: response.data.total_pages,
        page: response.data.page
      };

      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('TMDB API Error:', error.message);
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  async getTMDBMovieDetails(tmdbId) {
    try {
      const cacheKey = `tmdb_details_${tmdbId}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      if (!this.tmdbApiKey || this.tmdbApiKey === 'your_tmdb_api_key_here') {
        throw new Error('TMDB API key not configured');
      }

      const response = await axios.get(`${this.tmdbBaseUrl}/movie/${tmdbId}`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'en-US',
          append_to_response: 'credits,videos'
        }
      });

      const result = this.formatTMDBMovieDetails(response.data);
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('TMDB Details API Error:', error.message);
      throw new Error(`TMDB Details API Error: ${error.message}`);
    }
  }

  // OMDB API Integration
  async searchOMDB(query, year = null, type = 'movie') {
    try {
      const cacheKey = `omdb_search_${query}_${year}_${type}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      if (!this.omdbApiKey || this.omdbApiKey === 'your_omdb_api_key_here') {
        throw new Error('OMDB API key not configured');
      }

      const params = {
        apikey: this.omdbApiKey,
        s: query,
        type: type
      };

      if (year) params.y = year;

      const response = await axios.get(this.omdbBaseUrl, { params });

      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie not found');
      }

      const result = {
        source: 'OMDB',
        results: response.data.Search.map(movie => this.formatOMDBMovie(movie)),
        totalResults: response.data.totalResults
      };

      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('OMDB API Error:', error.message);
      throw new Error(`OMDB API Error: ${error.message}`);
    }
  }

  async getOMDBMovieDetails(imdbId) {
    try {
      const cacheKey = `omdb_details_${imdbId}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      if (!this.omdbApiKey || this.omdbApiKey === 'your_omdb_api_key_here') {
        throw new Error('OMDB API key not configured');
      }

      const response = await axios.get(this.omdbBaseUrl, {
        params: {
          apikey: this.omdbApiKey,
          i: imdbId,
          plot: 'full'
        }
      });

      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie not found');
      }

      const result = this.formatOMDBMovieDetails(response.data);
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('OMDB Details API Error:', error.message);
      throw new Error(`OMDB Details API Error: ${error.message}`);
    }
  }

  // RapidAPI (IMDB) Integration
  async searchRapidAPI(query) {
    try {
      const cacheKey = `rapidapi_search_${query}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      if (!this.rapidApiKey || this.rapidApiKey === 'your_rapidapi_key_here') {
        throw new Error('RapidAPI key not configured');
      }

      const response = await axios.get(`${this.rapidApiBaseUrl}/searchMovies`, {
        params: { query },
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'imdb-api1.p.rapidapi.com'
        }
      });

      const result = {
        source: 'RapidAPI-IMDB',
        results: response.data.results ? response.data.results.map(movie => this.formatRapidAPIMovie(movie)) : []
      };

      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('RapidAPI Error:', error.message);
      throw new Error(`RapidAPI Error: ${error.message}`);
    }
  }

  // Format functions for different APIs
  formatTMDBMovie(movie) {
    return {
      externalId: movie.id,
      title: movie.title,
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      description: movie.overview,
      rating: movie.vote_average,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      genre: movie.genre_ids || [],
      source: 'TMDB'
    };
  }

  formatTMDBMovieDetails(movie) {
    return {
      externalId: movie.id,
      title: movie.title,
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      description: movie.overview,
      rating: movie.vote_average,
      duration: movie.runtime,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      genre: movie.genres ? movie.genres.map(g => g.name) : [],
      director: movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown',
      cast: movie.credits?.cast?.slice(0, 10).map(actor => actor.name) || [],
      budget: movie.budget,
      boxOffice: movie.revenue,
      language: movie.original_language,
      country: movie.production_countries?.[0]?.name || 'Unknown',
      source: 'TMDB'
    };
  }

  formatOMDBMovie(movie) {
    return {
      externalId: movie.imdbID,
      title: movie.Title,
      releaseYear: parseInt(movie.Year),
      poster: movie.Poster !== 'N/A' ? movie.Poster : null,
      source: 'OMDB'
    };
  }

  formatOMDBMovieDetails(movie) {
    return {
      externalId: movie.imdbID,
      title: movie.Title,
      releaseYear: parseInt(movie.Year),
      description: movie.Plot !== 'N/A' ? movie.Plot : null,
      rating: movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) : null,
      duration: movie.Runtime !== 'N/A' ? parseInt(movie.Runtime.replace(' min', '')) : null,
      poster: movie.Poster !== 'N/A' ? movie.Poster : null,
      genre: movie.Genre !== 'N/A' ? movie.Genre.split(', ') : [],
      director: movie.Director !== 'N/A' ? movie.Director : 'Unknown',
      cast: movie.Actors !== 'N/A' ? movie.Actors.split(', ') : [],
      language: movie.Language !== 'N/A' ? movie.Language : 'Unknown',
      country: movie.Country !== 'N/A' ? movie.Country : 'Unknown',
      boxOffice: movie.BoxOffice !== 'N/A' ? parseInt(movie.BoxOffice.replace(/[$,]/g, '')) : null,
      source: 'OMDB'
    };
  }

  formatRapidAPIMovie(movie) {
    return {
      externalId: movie.id,
      title: movie.title,
      releaseYear: movie.year,
      description: movie.plot,
      rating: movie.rating,
      poster: movie.image,
      source: 'RapidAPI-IMDB'
    };
  }

  // Multi-source search
  async searchAllSources(query, options = {}) {
    const results = {
      query,
      sources: {},
      combined: []
    };

    const promises = [];

    // Search TMDB
    if (!options.excludeTMDB) {
      promises.push(
        this.searchTMDB(query).then(data => {
          results.sources.tmdb = data;
          results.combined.push(...data.results);
        }).catch(error => {
          results.sources.tmdb = { error: error.message };
        })
      );
    }

    // Search OMDB
    if (!options.excludeOMDB) {
      promises.push(
        this.searchOMDB(query).then(data => {
          results.sources.omdb = data;
          results.combined.push(...data.results);
        }).catch(error => {
          results.sources.omdb = { error: error.message };
        })
      );
    }

    // Search RapidAPI
    if (!options.excludeRapidAPI) {
      promises.push(
        this.searchRapidAPI(query).then(data => {
          results.sources.rapidapi = data;
          results.combined.push(...data.results);
        }).catch(error => {
          results.sources.rapidapi = { error: error.message };
        })
      );
    }

    await Promise.allSettled(promises);

    // Remove duplicates based on title similarity
    results.combined = this.removeDuplicates(results.combined);

    return results;
  }

  // Helper function to remove duplicate movies
  removeDuplicates(movies) {
    const unique = [];
    const seen = new Set();

    for (const movie of movies) {
      const key = `${movie.title?.toLowerCase()}_${movie.releaseYear}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(movie);
      }
    }

    return unique;
  }

  // Import movie from external API to local database
  async importMovieFromExternal(source, externalId) {
    try {
      let movieData;

      switch (source.toLowerCase()) {
        case 'tmdb':
          movieData = await this.getTMDBMovieDetails(externalId);
          break;
        case 'omdb':
          movieData = await this.getOMDBMovieDetails(externalId);
          break;
        default:
          throw new Error('Unsupported source for import');
      }

      // Remove source-specific fields
      delete movieData.externalId;
      delete movieData.source;

      return movieData;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }
}

module.exports = new ExternalApiService();
