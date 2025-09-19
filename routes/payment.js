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

module.exports = router;
