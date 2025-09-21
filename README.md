# JustPay Backend

A Node.js backend service that integrates with Stripe for payment processing, designed specifically for **landlord-tenant rent payments** using Stripe Connect. Perfect for Flutter mobile applications.

## Features

- 🚀 **Express.js Server** - Fast and lightweight web framework
- 💳 **Stripe Connect Integration** - Multi-party payments (rent goes directly to landlords)
- 🏠 **Landlord-Tenant System** - Complete rent payment workflow
- 📱 **Flutter Ready** - CORS-enabled API endpoints for mobile apps
- 🔒 **Security First** - Helmet middleware and environment-based configuration
- 📊 **Request Logging** - Morgan middleware for request tracking
- ✅ **Input Validation** - Comprehensive request validation
- 🔄 **Error Handling** - Proper HTTP status codes and error messages
- 💰 **Platform Fees** - Configurable application fees for your platform

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

### Landlord-Tenant Payment System

#### Landlord Setup
- **POST** `/api/payments/create-landlord-account` - Create landlord Connect account
- **POST** `/api/payments/landlord-onboarding-link` - Get onboarding URL for landlord
- **GET** `/api/payments/landlord-account/:accountId` - Get landlord account status & balance
- **POST** `/api/payments/landlord-dashboard-link` - Get landlord dashboard access

#### Rent Payments
- **POST** `/api/payments/create-rent-payment` - Create rent payment (money goes to landlord)

#### Traditional Payment Links
- **POST** `/api/payments/create-payment-link` - Create simple payment link
- **GET** `/api/payments/payment-link/:linkId` - Get payment link details
- **GET** `/api/payments/payment-links` - List payment links
- **PATCH** `/api/payments/payment-link/:linkId/deactivate` - Deactivate payment link

### Complete Rent Payment Workflow

#### 1. Create Landlord Account
- **POST** `/api/payments/create-landlord-account`
- **Body:**
  ```json
  {
    "email": "landlord@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "businessName": "Smith Properties LLC",
    "country": "US"
  }
  ```

#### 2. Landlord Completes Onboarding
- Get onboarding link and have landlord complete Stripe verification
- **POST** `/api/payments/landlord-onboarding-link`
- **Body:**
  ```json
  {
    "accountId": "acct_1234567890"
  }
  ```

#### 3. Create Rent Payment
- **POST** `/api/payments/create-rent-payment`
- **Body:**
  ```json
  {
    "amount": 1200.00,
    "currency": "usd",
    "description": "Monthly Rent - December 2024",
    "landlordAccountId": "acct_1234567890",
    "tenantEmail": "tenant@example.com",
    "propertyAddress": "123 Main St, Apt 4B",
    "rentPeriod": "December 2024",
    "applicationFeePercentage": 2.9
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "rentPayment": {
      "url": "https://buy.stripe.com/rent_payment_link",
      "tenantAmount": 1200.00,
      "landlordReceives": 1165.20,
      "applicationFee": 34.80
    }
  }
  }

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
