// Landlord-Tenant Payment System Examples
// This demonstrates the complete flow for rent payments

const BASE_URL = 'http://localhost:3000/api/payments';

// LANDLORD SETUP FLOW

// Step 1: Create landlord account
async function createLandlordAccount() {
  try {
    const response = await fetch(`${BASE_URL}/create-landlord-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'landlord@example.com',
        firstName: 'John',
        lastName: 'Smith',
        businessName: 'Smith Properties LLC',
        country: 'US'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Landlord account created:');
      console.log('Account ID:', result.landlord.accountId);
      console.log('Status:', result.landlord.status);
      return result.landlord.accountId;
    }
  } catch (error) {
    console.error('Error creating landlord account:', error);
  }
}

// Step 2: Get onboarding link for landlord
async function getLandlordOnboardingLink(accountId) {
  try {
    const response = await fetch(`${BASE_URL}/landlord-onboarding-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Onboarding URL:', result.onboardingUrl);
      console.log('Expires at:', new Date(result.expiresAt * 1000));
      return result.onboardingUrl;
    }
  } catch (error) {
    console.error('Error getting onboarding link:', error);
  }
}

// TENANT PAYMENT FLOW

// Step 3: Create rent payment for tenant
async function createRentPayment(landlordAccountId) {
  try {
    const response = await fetch(`${BASE_URL}/create-rent-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1200.00, // $1,200 rent
        currency: 'usd',
        description: 'Monthly Rent - December 2024',
        landlordAccountId: landlordAccountId,
        tenantEmail: 'tenant@example.com',
        propertyAddress: '123 Main St, Apt 4B, New York, NY',
        rentPeriod: 'December 2024',
        applicationFeePercentage: 2.9 // 2.9% platform fee
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Rent payment link created:');
      console.log('Payment URL:', result.rentPayment.url);
      console.log('Tenant pays:', `$${result.rentPayment.tenantAmount}`);
      console.log('Landlord receives:', `$${result.rentPayment.landlordReceives}`);
      console.log('Platform fee:', `$${result.rentPayment.applicationFee}`);
      return result.rentPayment;
    }
  } catch (error) {
    console.error('Error creating rent payment:', error);
  }
}

// LANDLORD MANAGEMENT

// Check landlord account status and balance
async function getLandlordAccountInfo(accountId) {
  try {
    const response = await fetch(`${BASE_URL}/landlord-account/${accountId}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Landlord Account Info:');
      console.log('Status:', result.landlord.status);
      console.log('Charges Enabled:', result.landlord.chargesEnabled);
      console.log('Payouts Enabled:', result.landlord.payoutsEnabled);
      console.log('Available Balance:', result.landlord.balance.available);
      console.log('Pending Balance:', result.landlord.balance.pending);
      return result.landlord;
    }
  } catch (error) {
    console.error('Error getting landlord info:', error);
  }
}

// Get landlord dashboard link
async function getLandlordDashboardLink(accountId) {
  try {
    const response = await fetch(`${BASE_URL}/landlord-dashboard-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Dashboard URL:', result.dashboardUrl);
      return result.dashboardUrl;
    }
  } catch (error) {
    console.error('Error getting dashboard link:', error);
  }
}

// COMPLETE WORKFLOW EXAMPLE
async function completeRentPaymentWorkflow() {
  console.log('🏠 Starting Landlord-Tenant Payment Workflow...\n');

  // 1. Create landlord account
  console.log('1. Creating landlord account...');
  const landlordAccountId = await createLandlordAccount();
  if (!landlordAccountId) return;

  // 2. Get onboarding link (landlord completes this)
  console.log('\n2. Getting onboarding link...');
  const onboardingUrl = await getLandlordOnboardingLink(landlordAccountId);
  console.log('👤 Landlord should complete onboarding at:', onboardingUrl);

  // 3. Create rent payment link
  console.log('\n3. Creating rent payment for tenant...');
  const rentPayment = await createRentPayment(landlordAccountId);

  // 4. Check landlord account
  console.log('\n4. Checking landlord account status...');
  await getLandlordAccountInfo(landlordAccountId);

  // 5. Get dashboard link
  console.log('\n5. Getting landlord dashboard link...');
  const dashboardUrl = await getLandlordDashboardLink(landlordAccountId);

  console.log('\n🎉 Workflow completed!');
  console.log('📋 Summary:');
  console.log(`- Landlord Account: ${landlordAccountId}`);
  console.log(`- Rent Payment URL: ${rentPayment?.url}`);
  console.log(`- Dashboard: ${dashboardUrl}`);
}

// Flutter Dart Integration Example
/*
class RentPaymentService {
  static const String baseUrl = 'http://localhost:3000/api/payments';
  
  // Create landlord account
  static Future<String?> createLandlordAccount({
    required String email,
    required String firstName,
    required String lastName,
    String? businessName,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/create-landlord-account'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'firstName': firstName,
          'lastName': lastName,
          'businessName': businessName,
        }),
      );
      
      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['landlord']['accountId'];
      }
    } catch (e) {
      print('Error creating landlord account: $e');
    }
    return null;
  }
  
  // Create rent payment
  static Future<Map<String, dynamic>?> createRentPayment({
    required double amount,
    required String landlordAccountId,
    required String description,
    String? tenantEmail,
    String? propertyAddress,
    String? rentPeriod,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/create-rent-payment'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'amount': amount,
          'currency': 'usd',
          'description': description,
          'landlordAccountId': landlordAccountId,
          'tenantEmail': tenantEmail,
          'propertyAddress': propertyAddress,
          'rentPeriod': rentPeriod,
        }),
      );
      
      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['rentPayment'];
      }
    } catch (e) {
      print('Error creating rent payment: $e');
    }
    return null;
  }
  
  // Get landlord dashboard
  static Future<String?> getLandlordDashboard(String accountId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/landlord-dashboard-link'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'accountId': accountId}),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['dashboardUrl'];
      }
    } catch (e) {
      print('Error getting dashboard: $e');
    }
    return null;
  }
}

// Usage in Flutter app:
/*
// For landlords - create account and get onboarding
final accountId = await RentPaymentService.createLandlordAccount(
  email: 'landlord@example.com',
  firstName: 'John',
  lastName: 'Smith',
);

// For tenants - create payment link
final rentPayment = await RentPaymentService.createRentPayment(
  amount: 1200.00,
  landlordAccountId: accountId!,
  description: 'Monthly Rent - December 2024',
  propertyAddress: '123 Main St, Apt 4B',
  rentPeriod: 'December 2024',
);

// Open payment URL for tenant
if (rentPayment != null) {
  await launchUrl(Uri.parse(rentPayment['url']));
}

// For landlords - access dashboard
final dashboardUrl = await RentPaymentService.getLandlordDashboard(accountId!);
if (dashboardUrl != null) {
  await launchUrl(Uri.parse(dashboardUrl));
}
*/

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createLandlordAccount,
    getLandlordOnboardingLink,
    createRentPayment,
    getLandlordAccountInfo,
    getLandlordDashboardLink,
    completeRentPaymentWorkflow
  };
}
