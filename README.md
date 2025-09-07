# Movie Info API

A RESTful API for managing movie information with CRUD operations, search, filtering, and pagination capabilities.

## Team Alpha Members
- Victory Kalunta
- Ogbonnaya Kingdom
- Nwosu Nmasichukwu

## Features

### Public Features
- ✅ Browse movies with pagination
- ✅ Search movies by title and description
- ✅ Filter movies by genre, director, release year, and rating
- ✅ View detailed movie information
- ✅ Get movie statistics

### Admin Features
- ✅ Create new movie records
- ✅ Update existing movie information
- ✅ Delete movie records
- ✅ Full CRUD operations

### Technical Features
- ✅ RESTful API design
- ✅ MongoDB integration with Mongoose
- ✅ Input validation with Joi
- ✅ Error handling and logging
- ✅ Rate limiting for security
- ✅ CORS support
- ✅ Environment-based configuration
- ✅ **External API Integration** (TMDB, OMDB, RapidAPI/IMDB)
- ✅ **Movie Import/Sync** from external sources
- ✅ **Multi-source Search** across all APIs
- ✅ **Caching** for external API responses

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Environment**: dotenv

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-info-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/moviedb
API_VERSION=v1
API_BASE_URL=/api/v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info

# External Movie APIs
TMDB_API_KEY=your_tmdb_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Movies

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/movies` | Get all movies with pagination, search, and filters | Public |
| GET | `/movies/:id` | Get a specific movie by ID | Public |
| POST | `/movies` | Create a new movie | Admin |
| PUT | `/movies/:id` | Update a movie by ID | Admin |
| DELETE | `/movies/:id` | Delete a movie by ID | Admin |
| GET | `/movies/stats` | Get movie statistics | Public |

### External APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/external/search` | Search movies from external APIs | Public |
| GET | `/external/details/:source/:id` | Get movie details from external API | Public |
| POST | `/external/import` | Import movie from external API | Admin |
| POST | `/external/bulk-import` | Bulk import movies from external API | Admin |
| PUT | `/external/sync/:id` | Sync existing movie with external API | Admin |

### Query Parameters for GET /movies

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number (default: 1) | `?page=2` |
| `limit` | Number | Items per page (default: 10, max: 100) | `?limit=20` |
| `search` | String | Search in title and description | `?search=batman` |
| `genre` | String | Filter by genre | `?genre=action` |
| `director` | String | Filter by director | `?director=nolan` |
| `releaseYear` | Number | Filter by release year | `?releaseYear=2020` |
| `minRating` | Number | Minimum rating (0-10) | `?minRating=7` |
| `maxRating` | Number | Maximum rating (0-10) | `?maxRating=9` |
| `sortBy` | String | Sort field (title, releaseYear, rating, createdAt) | `?sortBy=rating` |
| `sortOrder` | String | Sort order (asc, desc) | `?sortOrder=desc` |

### External API Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `query` | String | Search term (required) | `?query=batman` |
| `source` | String | API source (tmdb, omdb, rapidapi, all) | `?source=tmdb` |
| `page` | Number | Page number for TMDB | `?page=2` |
| `year` | Number | Release year for OMDB | `?year=2008` |
| `excludeTMDB` | Boolean | Exclude TMDB from multi-search | `?excludeTMDB=true` |
| `excludeOMDB` | Boolean | Exclude OMDB from multi-search | `?excludeOMDB=true` |
| `excludeRapidAPI` | Boolean | Exclude RapidAPI from multi-search | `?excludeRapidAPI=true` |

## Request/Response Examples

### External API Examples

**1. Search all external APIs:**
```
GET /api/v1/external/search?query=inception&source=all
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "inception",
    "sources": {
      "tmdb": {
        "source": "TMDB",
        "results": [...],
        "total_results": 42,
        "total_pages": 3,
        "page": 1
      },
      "omdb": {
        "source": "OMDB",
        "results": [...],
        "totalResults": "15"
      },
      "rapidapi": {
        "source": "RapidAPI-IMDB",
        "results": [...]
      }
    },
    "combined": [...]
  }
}
```

**2. Import movie from TMDB:**
```
POST /api/v1/external/import
Content-Type: application/json

{
  "source": "tmdb",
  "externalId": "27205"
}
```

**3. Bulk import movies:**
```
POST /api/v1/external/bulk-import
Content-Type: application/json

{
  "searchQuery": "christopher nolan",
  "source": "tmdb",
  "limit": 5
}
```

### Create a Movie (POST /api/v1/movies)

**Request:**
```json
{
  "title": "The Dark Knight",
  "genre": ["Action", "Crime", "Drama"],
  "director": "Christopher Nolan",
  "releaseYear": 2008,
  "rating": 9.0,
  "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...",
  "duration": 152,
  "cast": ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
  "language": "English",
  "country": "USA",
  "budget": 185000000,
  "boxOffice": 1004558444
}
```

**Response:**
```json
{
  "success": true,
  "message": "Movie created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "The Dark Knight",
    "genre": ["Action", "Crime", "Drama"],
    "director": "Christopher Nolan",
    "releaseYear": 2008,
    "rating": 9.0,
    "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...",
    "duration": 152,
    "cast": ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    "language": "English",
    "country": "USA",
    "budget": 185000000,
    "boxOffice": 1004558444,
    "createdAt": "2023-09-06T12:39:00.000Z",
    "updatedAt": "2023-09-06T12:39:00.000Z",
    "age": 15
  }
}
```

### Get Movies with Filters (GET /api/v1/movies)

**Request:**
```
GET /api/v1/movies?genre=action&minRating=8&sortBy=rating&sortOrder=desc&page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 23,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "The Dark Knight",
      "genre": ["Action", "Crime", "Drama"],
      "director": "Christopher Nolan",
      "releaseYear": 2008,
      "rating": 9.0,
      "age": 15
    }
  ]
}
```

### Error Response Example

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Movie title is required",
    "At least one genre is required"
  ]
}
```

## Movie Schema

```javascript
{
  title: String (required, max 200 chars),
  genre: [String] (required, at least 1),
  director: String (required, max 100 chars),
  releaseYear: Number (required, 1888 - current year + 5),
  rating: Number (optional, 0-10),
  description: String (optional, max 1000 chars),
  duration: Number (optional, min 1 minute),
  poster: String (optional, URL),
  cast: [String] (optional),
  language: String (optional, default: "English"),
  country: String (optional),
  budget: Number (optional, min 0),
  boxOffice: Number (optional, min 0),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing the API
You can test the API using:
- **Postman**: Import the collection (if available)
- **curl**: Command line testing
- **Browser**: For GET requests

### Example curl Commands

```bash
# Get all movies
curl http://localhost:3000/api/v1/movies

# Get a specific movie
curl http://localhost:3000/api/v1/movies/64f8a1b2c3d4e5f6a7b8c9d0

# Create a movie
curl -X POST http://localhost:3000/api/v1/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","genre":["Sci-Fi","Thriller"],"director":"Christopher Nolan","releaseYear":2010,"rating":8.8}'

# Search movies
curl "http://localhost:3000/api/v1/movies?search=batman&genre=action"
```

## Deployment

### Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Deploy automatically on git push

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moviedb
PORT=10000
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Joi schema validation
- **Error Handling**: Secure error responses

## Performance Features

- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data loading
- **Query Optimization**: Mongoose best practices

## Future Enhancements

- [ ] JWT Authentication
- [ ] User roles and permissions
- [ ] Movie reviews and ratings
- [ ] Image upload for posters
- [ ] Advanced search with Elasticsearch
- [ ] Caching with Redis
- [ ] API documentation with Swagger

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team:
- Victory Kalunta
- Ogbonnaya Kingdom
- Nwosu Nmasichukwu
