#!/bin/bash

# Test script for your live Render deployment
# Replace YOUR_RENDER_URL with your actual Render URL

RENDER_URL="https://justpay-backend.onrender.com"

echo "🧪 Testing JustPay Backend on Render..."
echo "URL: $RENDER_URL"
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "$RENDER_URL/health" | jq '.' 2>/dev/null || curl -s "$RENDER_URL/health"
echo ""

# Test 2: Create payment link
echo "2. Testing payment link creation..."
curl -X POST "$RENDER_URL/api/payments/create-payment-link" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "usd",
    "description": "Test Payment from Live Server"
  }' | jq '.' 2>/dev/null || curl -X POST "$RENDER_URL/api/payments/create-payment-link" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "usd",
    "description": "Test Payment from Live Server"
  }'
echo ""

# Test 3: Create landlord account
echo "3. Testing landlord account creation..."
curl -X POST "$RENDER_URL/api/payments/create-landlord-account" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "businessName": "Smith Properties LLC"
  }' | jq '.' 2>/dev/null || curl -X POST "$RENDER_URL/api/payments/create-landlord-account" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "businessName": "Smith Properties LLC"
  }'

echo ""
echo "🎉 Testing completed!"
echo "If all tests passed, your backend is live and ready!"
