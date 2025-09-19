// Simple test to verify the server is working
// Run with: node test-server.js

const http = require('http');

async function testServer() {
  console.log('🧪 Testing JustPay Backend Server...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest('http://localhost:3000/health');
    
    if (healthResponse.status === 'OK') {
      console.log('   ✅ Health check passed');
    } else {
      console.log('   ❌ Health check failed');
    }
    
    // Test 2: Test payment endpoint structure (without valid Stripe keys)
    console.log('\n2. Testing payment endpoint structure...');
    const paymentResponse = await makeRequest('http://localhost:3000/api/payments/create-payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 10,
        currency: 'usd',
        description: 'Test payment'
      })
    });
    
    // We expect this to fail with Stripe error (which means our endpoint structure is correct)
    if (paymentResponse.error && paymentResponse.error.includes('key')) {
      console.log('   ✅ Payment endpoint structure is correct (needs Stripe keys)');
    } else {
      console.log('   ❌ Unexpected response from payment endpoint');
    }
    
    console.log('\n🎉 Basic server tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add your Stripe API keys to .env file');
    console.log('   2. Restart the server with: npm run dev');
    console.log('   3. Test payment link creation with real Stripe keys');
    
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Run the test
testServer();
