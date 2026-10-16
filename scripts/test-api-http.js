const http = require('http');

const req = http.get('http://[::1]:3001/api/motor/lookups?vehicleClass=Commercial%20Vehicle', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.setTimeout(10000, () => {
  console.error('Timeout');
  req.destroy();
});