const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Validation middleware
const validatePaymentData = (req, res, next) => {
  const { amount, currency, description } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      error: 'Invalid amount',
      message: 'Amount must be a positive number'
    });
  }
  
  if (!currency) {
    return res.status(400).json({
      error: 'Missing currency',
      message: 'Currency is required'
    });
  }
  
  if (!description || description.trim().length === 0) {
    return res.status(400).json({
      error: 'Missing description',
      message: 'Description is required'
    });
  }
  
  next();
};

// Create a payment link
router.post('/create-payment-link', validatePaymentData, async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'usd', 
      description,
      metadata = {},
      customerEmail,
      successUrl,
      cancelUrl
    } = req.body;

    // Create a product for this payment
    const product = await stripe.products.create({
      name: description,
      type: 'service',
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString()
      }
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      product: product.id,
    });

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: successUrl || `${req.protocol}://${req.get('host')}/api/payments/success`
        }
      },
      metadata: {
        ...metadata,
        customerEmail: customerEmail || '',
        originalAmount: amount.toString(),
        originalCurrency: currency
      }
    });

    res.status(201).json({
      success: true,
      paymentLink: {
        id: paymentLink.id,
        url: paymentLink.url,
        amount: amount,
        currency: currency,
        description: description
      },
      product: {
        id: product.id,
        name: product.name
      },
      price: {
        id: price.id,
        amount: amount,
        currency: currency
      }
    });

  } catch (error) {
    console.error('Stripe Error:', error);
    
    res.status(500).json({
      error: 'Payment link creation failed',
      message: error.message,
      type: error.type || 'stripe_error'
    });
  }
});

// Get payment link details
router.get('/payment-link/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const paymentLink = await stripe.paymentLinks.retrieve(linkId);
    
    res.json({
      success: true,
      paymentLink: {
        id: paymentLink.id,
        url: paymentLink.url,
        active: paymentLink.active,
        metadata: paymentLink.metadata
      }
    });
    
  } catch (error) {
    console.error('Stripe Error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({
        error: 'Payment link not found',
        message: 'The specified payment link does not exist'
      });
    }
    
    res.status(500).json({
      error: 'Failed to retrieve payment link',
      message: error.message
    });
  }
});

// List all payment links (with pagination)
router.get('/payment-links', async (req, res) => {
  try {
    const { limit = 10, starting_after } = req.query;
    
    const paymentLinks = await stripe.paymentLinks.list({
      limit: parseInt(limit),
      ...(starting_after && { starting_after })
    });
    
    res.json({
      success: true,
      paymentLinks: paymentLinks.data.map(link => ({
        id: link.id,
        url: link.url,
        active: link.active,
        metadata: link.metadata
      })),
      has_more: paymentLinks.has_more
    });
    
  } catch (error) {
    console.error('Stripe Error:', error);
    
    res.status(500).json({
      error: 'Failed to retrieve payment links',
      message: error.message
    });
  }
});

// Deactivate a payment link
router.patch('/payment-link/:linkId/deactivate', async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const paymentLink = await stripe.paymentLinks.update(linkId, {
      active: false
    });
    
    res.json({
      success: true,
      message: 'Payment link deactivated successfully',
      paymentLink: {
        id: paymentLink.id,
        active: paymentLink.active
      }
    });
    
  } catch (error) {
    console.error('Stripe Error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({
        error: 'Payment link not found',
        message: 'The specified payment link does not exist'
      });
    }
    
    res.status(500).json({
      error: 'Failed to deactivate payment link',
      message: error.message
    });
  }
});

// Success page endpoint (can be customized)
router.get('/success', (req, res) => {
  res.json({
    success: true,
    message: 'Payment completed successfully!',
    timestamp: new Date().toISOString()
  });
});

// Cancel page endpoint (can be customized)
router.get('/cancel', (req, res) => {
  res.json({
    success: false,
    message: 'Payment was cancelled',
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint for Stripe events (optional)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.warn('Webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// STRIPE CONNECT ROUTES FOR LANDLORD-TENANT PAYMENTS

// 1. Create a Connect account for landlords
router.post('/create-landlord-account', async (req, res) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      businessName,
      country = 'US' 
    } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, first name, and last name are required'
      });
    }

    // Create Express account for landlord
    const account = await stripe.accounts.create({
      type: 'express',
      country: country,
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: businessName || `${firstName} ${lastName}`,
        product_description: 'Rental property management'
      },
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email
      }
    });

    res.status(201).json({
      success: true,
      landlord: {
        accountId: account.id,
        email: account.email,
        status: account.details_submitted ? 'active' : 'pending',
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled
      }
    });

  } catch (error) {
    console.error('Stripe Connect Error:', error);
    res.status(500).json({
      error: 'Failed to create landlord account',
      message: error.message
    });
  }
});

// 2. Create onboarding link for landlords to complete setup
router.post('/landlord-onboarding-link', async (req, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        error: 'Missing account ID',
        message: 'Landlord account ID is required'
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${req.protocol}://${req.get('host')}/api/payments/reauth`,
      return_url: `${req.protocol}://${req.get('host')}/api/payments/onboarding-complete`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expires_at
    });

  } catch (error) {
    console.error('Stripe Connect Error:', error);
    res.status(500).json({
      error: 'Failed to create onboarding link',
      message: error.message
    });
  }
});

// 3. Create rent payment (money goes directly to landlord)
router.post('/create-rent-payment', validatePaymentData, async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'usd', 
      description,
      landlordAccountId,
      tenantEmail,
      propertyAddress,
      rentPeriod,
      applicationFeePercentage = 2.9 // Your platform fee
    } = req.body;

    if (!landlordAccountId) {
      return res.status(400).json({
        error: 'Missing landlord account',
        message: 'Landlord account ID is required'
      });
    }

    // Calculate application fee (your platform fee)
    const applicationFeeAmount = Math.round(amount * 100 * (applicationFeePercentage / 100));

    // Create a product for this rent payment
    const product = await stripe.products.create({
      name: `Rent Payment - ${propertyAddress || 'Property'}`,
      type: 'service',
      metadata: {
        type: 'rent_payment',
        propertyAddress: propertyAddress || '',
        rentPeriod: rentPeriod || '',
        tenantEmail: tenantEmail || '',
        landlordAccountId: landlordAccountId
      }
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      product: product.id,
    });

    // Create payment link with Connect account (money goes to landlord)
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      application_fee_amount: applicationFeeAmount,
      on_behalf_of: landlordAccountId,
      transfer_data: {
        destination: landlordAccountId,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${req.protocol}://${req.get('host')}/api/payments/rent-payment-success`
        }
      },
      metadata: {
        type: 'rent_payment',
        landlordAccountId: landlordAccountId,
        tenantEmail: tenantEmail || '',
        propertyAddress: propertyAddress || '',
        rentPeriod: rentPeriod || '',
        originalAmount: amount.toString(),
        applicationFee: (applicationFeeAmount / 100).toString()
      }
    });

    res.status(201).json({
      success: true,
      rentPayment: {
        id: paymentLink.id,
        url: paymentLink.url,
        amount: amount,
        currency: currency,
        description: description,
        landlordAccountId: landlordAccountId,
        applicationFee: applicationFeeAmount / 100,
        tenantAmount: amount,
        landlordReceives: amount - (applicationFeeAmount / 100)
      }
    });

  } catch (error) {
    console.error('Stripe Connect Error:', error);
    res.status(500).json({
      error: 'Rent payment creation failed',
      message: error.message,
      type: error.type || 'stripe_error'
    });
  }
});

// 4. Get landlord account status and balance
router.get('/landlord-account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    // Get account details
    const account = await stripe.accounts.retrieve(accountId);
    
    // Get account balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });

    res.json({
      success: true,
      landlord: {
        accountId: account.id,
        email: account.email,
        status: account.details_submitted ? 'active' : 'pending',
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        balance: {
          available: balance.available,
          pending: balance.pending
        }
      }
    });

  } catch (error) {
    console.error('Stripe Connect Error:', error);
    res.status(500).json({
      error: 'Failed to retrieve landlord account',
      message: error.message
    });
  }
});

// 5. Create dashboard link for landlords to manage their account
router.post('/landlord-dashboard-link', async (req, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        error: 'Missing account ID',
        message: 'Landlord account ID is required'
      });
    }

    const loginLink = await stripe.accounts.createLoginLink(accountId);

    res.json({
      success: true,
      dashboardUrl: loginLink.url
    });

  } catch (error) {
    console.error('Stripe Connect Error:', error);
    res.status(500).json({
      error: 'Failed to create dashboard link',
      message: error.message
    });
  }
});

// 6. Setup payouts for landlords
router.post('/landlord-setup-payouts', async (req, res) => {
  try {
    const { accountId, payoutSchedule = 'daily' } = req.body;

    if (!accountId) {
      return res.status(400).json({
        error: 'Missing account ID',
        message: 'Landlord account ID is required'
      });
    }

    // Update payout schedule
    const account = await stripe.accounts.update(accountId, {
      settings: {
        payouts: {
          schedule: {
            interval: payoutSchedule, // 'daily', 'weekly', 'monthly', or 'manual'
            ...(payoutSchedule === 'weekly' && { weekly_anchor: 'monday' }),
            ...(payoutSchedule === 'monthly' && { monthly_anchor: 1 })
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Payout schedule updated successfully',
      payoutSchedule: payoutSchedule,
      account: {
        id: account.id,
        payoutsEnabled: account.payouts_enabled
      }
    });

  } catch (error) {
    console.error('Stripe Connect Error:', error);
    res.status(500).json({
      error: 'Failed to setup payouts',
      message: error.message
    });
  }
});

// Add this endpoint to get payout history
router.get('/landlord-payout-history/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { limit = 10 } = req.query;

    const payouts = await stripe.payouts.list({
      limit: parseInt(limit)
    }, {
      stripeAccount: accountId
    });

    res.json({
      success: true,
      payouts: payouts.data.map(payout => ({
        id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        method: payout.method,
        arrivalDate: payout.arrival_date,
        createdAt: new Date(payout.created * 1000).toISOString()
      })),
      hasMore: payouts.has_more
    });

  } catch (error) {
    console.error('Stripe Payout History Error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payout history',
      message: error.message
    });
  }
});

// Success/completion endpoints
router.get('/onboarding-complete', (req, res) => {
  res.json({
    success: true,
    message: 'Landlord account setup completed successfully!',
    nextSteps: [
      'Account is now ready to receive rent payments',
      'You can access your dashboard to view payments and payouts',
      'Set up your properties and share payment links with tenants'
    ]
  });
});

router.get('/rent-payment-success', (req, res) => {
  res.json({
    success: true,
    message: 'Rent payment completed successfully!',
    note: 'Payment has been sent directly to your landlord'
  });
});

router.get('/reauth', (req, res) => {
  res.json({
    success: false,
    message: 'Please complete your account setup',
    action: 'Contact support if you continue to have issues'
  });
});

module.exports = router;
