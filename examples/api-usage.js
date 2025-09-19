// Example usage of the JustPay Backend API
// This file demonstrates how to integrate with the payment API

const BASE_URL = 'http://localhost:3000/api/payments';

// Example 1: Create a payment link
async function createPaymentLink() {
  try {
    const response = await fetch(`${BASE_URL}/create-payment-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 29.99,
        currency: 'usd',
        description: 'Premium Subscription - Monthly',
        customerEmail: 'customer@example.com',
        metadata: {
          userId: '12345',
          plan: 'premium',
          duration: 'monthly'
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Payment link created successfully:');
      console.log('URL:', result.paymentLink.url);
      console.log('Link ID:', result.paymentLink.id);
      return result.paymentLink;
    } else {
      console.error('Failed to create payment link:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Example 2: Get payment link details
async function getPaymentLinkDetails(linkId) {
  try {
    const response = await fetch(`${BASE_URL}/payment-link/${linkId}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Payment link details:', result.paymentLink);
      return result.paymentLink;
    } else {
      console.error('Failed to get payment link:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Example 3: List all payment links
async function listPaymentLinks(limit = 10) {
  try {
    const response = await fetch(`${BASE_URL}/payment-links?limit=${limit}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Payment links:', result.paymentLinks);
      console.log('Has more:', result.has_more);
      return result.paymentLinks;
    } else {
      console.error('Failed to list payment links:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Example 4: Deactivate a payment link
async function deactivatePaymentLink(linkId) {
  try {
    const response = await fetch(`${BASE_URL}/payment-link/${linkId}/deactivate`, {
      method: 'PATCH'
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Payment link deactivated successfully');
      return true;
    } else {
      console.error('Failed to deactivate payment link:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Flutter Dart equivalent example
/*
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
        if (customerEmail != null) 'customerEmail': customerEmail,
        if (metadata != null) 'metadata': metadata,
      }),
    );
    
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create payment link: ${response.body}');
    }
  }
  
  static Future<void> openPaymentLink(String paymentUrl) async {
    if (await canLaunchUrl(Uri.parse(paymentUrl))) {
      await launchUrl(
        Uri.parse(paymentUrl),
        mode: LaunchMode.externalApplication,
      );
    } else {
      throw Exception('Could not launch payment URL');
    }
  }
}

// Usage in Flutter:
/*
try {
  final result = await PaymentService.createPaymentLink(
    amount: 29.99,
    description: 'Premium Subscription',
    customerEmail: 'user@example.com',
    metadata: {'userId': '12345', 'plan': 'premium'},
  );
  
  if (result['success']) {
    final paymentUrl = result['paymentLink']['url'];
    await PaymentService.openPaymentLink(paymentUrl);
  }
} catch (e) {
  print('Error creating payment link: $e');
}
*/

// Export functions for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createPaymentLink,
    getPaymentLinkDetails,
    listPaymentLinks,
    deactivatePaymentLink
  };
}
