// Quick test to check if server routes are working
const http = require('http');

const testEndpoints = [
  { method: 'POST', path: '/api/auth/register', body: {name: 'Test', email: 'test@gmail.com', phone: '1234', password: 'test123'} },
  { method: 'POST', path: '/api/auth/login', body: {email: 'test@gmail.com', password: 'test123'} },
  { method: 'GET', path: '/api/members', body: null }
];

console.log('Testing server endpoints...\n');

testEndpoints.forEach(endpoint => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: endpoint.path,
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✓ ${endpoint.method} ${endpoint.path} - Status: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.log(`✗ ${endpoint.method} ${endpoint.path} - ERROR: ${error.message}`);
  });

  if (endpoint.body) {
    req.write(JSON.stringify(endpoint.body));
  }
  
  req.end();
});

console.log('\nIf you see 404 errors, restart the server with: npm start');
