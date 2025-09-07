const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  genre: {
    type: [String],
    required: [true, 'At least one genre is required'],
    validate: {
      validator: function(genres) {
        return genres && genres.length > 0;
      },
      message: 'Movie must have at least one genre'
    }
  },
  director: {
    type: String,
    required: [true, 'Director is required'],
    trim: true,
    maxlength: [100, 'Director name cannot exceed 100 characters']
  },
  releaseYear: {
    type: Number,
    required: [true, 'Release year is required'],
    min: [1888, 'Release year must be after 1888'],
    max: [new Date().getFullYear() + 5, 'Release year cannot be more than 5 years in the future']
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [10, 'Rating cannot be more than 10'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute']
  },
  poster: {
    type: String,
    trim: true
  },
  cast: [{
    type: String,
    trim: true
  }],
  language: {
    type: String,
    trim: true,
    default: 'English'
  },
  country: {
    type: String,
    trim: true
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  boxOffice: {
    type: Number,
    min: [0, 'Box office cannot be negative']
  },
  externalIds: {
    tmdb: String,
    omdb: String,
    imdb: String,
    rapidapi: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better query performance
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseYear: 1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ director: 1 });

// Virtual for movie age
movieSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.releaseYear;
});

// Pre-save middleware to capitalize first letter of title
movieSchema.pre('save', function(next) {
  if (this.title) {
    this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
  }
  next();
});

module.exports = mongoose.model('Movie', movieSchema);
