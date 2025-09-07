const http = require('http');

// Simple test function to check API endpoints
const testAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Movie Info API...\n');

  // Test health endpoint
  try {
    const healthResponse = await makeRequest(`${baseURL}/health`);
    console.log('✅ Health Check:', healthResponse.message);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test root endpoint
  try {
    const rootResponse = await makeRequest(`${baseURL}/`);
    console.log('✅ Root Endpoint:', rootResponse.message);
  } catch (error) {
    console.log('❌ Root Endpoint Failed:', error.message);
  }

  // Test movies endpoint (will fail without DB but should return proper error)
  try {
    const moviesResponse = await makeRequest(`${baseURL}/api/v1/movies`);
    console.log('✅ Movies Endpoint:', moviesResponse.message || 'Working');
  } catch (error) {
    console.log('⚠️  Movies Endpoint (Expected without DB):', error.message);
  }

  console.log('\n🎬 API Test Complete!');
};

// Helper function to make HTTP requests
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

// Run test if this file is executed directly
if (require.main === module) {
  setTimeout(testAPI, 2000); // Wait 2 seconds for server to start
}

module.exports = { testAPI };
