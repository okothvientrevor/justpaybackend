# JustPay Backend

A Node.js backend service that integrates with Stripe for payment link generation, designed to work seamlessly with Flutter mobile applications.

## Features

- 🚀 **Express.js Server** - Fast and lightweight web framework
- 💳 **Stripe Integration** - Generate and manage payment links
- 📱 **Flutter Ready** - CORS-enabled API endpoints for mobile apps
- 🔒 **Security First** - Helmet middleware and environment-based configuration
- 📊 **Request Logging** - Morgan middleware for request tracking
- ✅ **Input Validation** - Comprehensive request validation
- 🔄 **Error Handling** - Proper HTTP status codes and error messages

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stripe account with API keys

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd "justpay backend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your Stripe credentials:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   PORT=3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Test the server:**
   ```bash
   curl http://localhost:3000/health
   ```

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Payment Management

#### Create Payment Link
- **POST** `/api/payments/create-payment-link`
- **Body:**
  ```json
  {
    "amount": 29.99,
    "currency": "usd",
    "description": "Premium subscription",
    "customerEmail": "customer@example.com",
    "metadata": {
      "userId": "12345",
      "plan": "premium"
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "paymentLink": {
      "id": "plink_1234567890",
      "url": "https://buy.stripe.com/test_1234567890",
      "amount": 29.99,
      "currency": "usd",
      "description": "Premium subscription"
    }
  }
  ```

#### Get Payment Link Details
- **GET** `/api/payments/payment-link/:linkId`

#### List Payment Links
- **GET** `/api/payments/payment-links?limit=10&starting_after=plink_123`

#### Deactivate Payment Link
- **PATCH** `/api/payments/payment-link/:linkId/deactivate`

## Flutter Integration

### HTTP Client Setup

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class PaymentService {
  static const String baseUrl = 'http://localhost:3000/api/payments';
  
  static Future<Map<String, dynamic>> createPaymentLink({
    required double amount,
    required String description,
    String currency = 'usd',
    String? customerEmail,
    Map<String, String>? metadata,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/create-payment-link'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'amount': amount,
        'currency': currency,
        'description': description,
        'customerEmail': customerEmail,
        'metadata': metadata,
      }),
    );
    
    return jsonDecode(response.body);
  }
}
```

### Usage Example

```dart
// Create a payment link
final result = await PaymentService.createPaymentLink(
  amount: 29.99,
  description: 'Premium Subscription',
  customerEmail: 'user@example.com',
  metadata: {'userId': '12345'},
);

if (result['success']) {
  final paymentUrl = result['paymentLink']['url'];
  // Open payment URL in browser or webview
  await launchUrl(Uri.parse(paymentUrl));
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes | - |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | http://localhost:3000 |

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm test` - Run tests (to be implemented)

### Project Structure

```
justpay backend/
├── .github/
│   └── copilot-instructions.md
├── routes/
│   └── payment.js          # Payment-related API routes
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore file
├── package.json           # Project dependencies and scripts
├── server.js              # Main server file
└── README.md              # This file
```

## Security Considerations

- Never commit `.env` files to version control
- Use environment variables for all sensitive configuration
- Implement rate limiting in production
- Validate all input data
- Use HTTPS in production
- Regularly update dependencies

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper logging
4. Configure SSL/TLS certificates
5. Set up monitoring and health checks

## Support

For issues related to:
- **Stripe Integration**: Check [Stripe Documentation](https://stripe.com/docs)
- **Node.js/Express**: Check [Express.js Guide](https://expressjs.com/)
- **Flutter HTTP**: Check [Flutter HTTP Package](https://pub.dev/packages/http)

## License

ISC License
