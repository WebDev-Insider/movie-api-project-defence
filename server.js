const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const movieRoutes = require('./routes/movieRoutes');
const externalApiRoutes = require('./routes/externalApiRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://movie-info-api-gsqo.onrender.com/'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Movie Info API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// API routes
app.use(`${process.env.API_BASE_URL || '/api/v1'}/movies`, movieRoutes);
app.use(`${process.env.API_BASE_URL || '/api/v1'}/external`, externalApiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Movie Info API',
    version: process.env.API_VERSION || 'v1',
    documentation: `${req.protocol}://${req.get('host')}/api/v1/movies`,
    endpoints: {
      movies: {
        'GET /api/v1/movies': 'Get all movies with pagination, search, and filters',
        'GET /api/v1/movies/:id': 'Get a specific movie by ID',
        'POST /api/v1/movies': 'Create a new movie',
        'PUT /api/v1/movies/:id': 'Update a movie by ID',
        'DELETE /api/v1/movies/:id': 'Delete a movie by ID',
        'GET /api/v1/movies/stats': 'Get movie statistics'
      },
      external: {
        'GET /api/v1/external/search': 'Search movies from external APIs (TMDB, OMDB, RapidAPI)',
        'GET /api/v1/external/details/:source/:id': 'Get movie details from external API',
        'POST /api/v1/external/import': 'Import movie from external API to database',
        'POST /api/v1/external/bulk-import': 'Bulk import movies from external API',
        'PUT /api/v1/external/sync/:id': 'Sync existing movie with external API data'
      }
    },
    authors: [
      'Victory Kalunta',
      'Ogbonnaya Kingdom',
      'Nwosu Nmasichukwu'
    ]
  });
});

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Movie Info API Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server: http://localhost:${PORT}
📚 API Base: http://localhost:${PORT}${process.env.API_BASE_URL || '/api/v1'}
🎬 Movies Endpoint: http://localhost:${PORT}${process.env.API_BASE_URL || '/api/v1'}/movies
📊 Health Check: http://localhost:${PORT}/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
