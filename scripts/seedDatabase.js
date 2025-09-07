const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('../models/Movie');
const sampleMovies = require('../data/sampleData');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Movie.deleteMany({});
    console.log('Cleared existing movies');

    // Insert sample data
    const movies = await Movie.insertMany(sampleMovies);
    console.log(`Inserted ${movies.length} sample movies`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
