const https = require('https');

// This script checks the current Author custom type structure
// It helps verify if website_link field exists in Prismic

const options = {
  hostname: 'hundred-days-challenge.cdn.prismic.io',
  port: 443,
  path: '/api/v2',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

console.log('Checking Prismic API access...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ API is accessible!');
      console.log('\nAvailable custom types:', Object.values(response.types).join(', '));
      console.log('\n📋 Next Steps:');
      console.log('1. Open prismic-direct-access.html in your browser');
      console.log('2. Try the direct repository links');
      console.log('3. If you can access the dashboard, manually add the website_link field');
      console.log('\nCloudFront 403 Workarounds:');
      console.log('- Use a different browser (Firefox, Edge, Safari)');
      console.log('- Clear ALL browser data for prismic.io');
      console.log('- Try incognito/private mode');
      console.log('- Use mobile hotspot instead of WiFi');
      console.log('- Disable VPN/proxy if using one');
      console.log('- Wait 1-2 hours (rate limit may expire)');
    } catch (error) {
      console.error('Error parsing response:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Error accessing API:', error);
});

req.end();