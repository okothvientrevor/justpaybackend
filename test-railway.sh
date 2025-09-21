#!/bin/bash

# Test script for your live Railway deployment
# Replace YOUR_RAILWAY_URL with your actual Railway URL

RAILWAY_URL="https://justpay-backend-production.up.railway.app"

echo "🚂 Testing JustPay Backend on Railway..."
echo "URL: $RAILWAY_URL"
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "$RAILWAY_URL/health" | jq '.' 2>/dev/null || curl -s "$RAILWAY_URL/health"
echo ""

# Test 2: Create payment link
echo "2. Testing payment link creation..."
curl -X POST "$RAILWAY_URL/api/payments/create-payment-link" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "usd",
    "description": "Test Payment from Railway Server"
  }' | jq '.' 2>/dev/null || curl -X POST "$RAILWAY_URL/api/payments/create-payment-link" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "usd",
    "description": "Test Payment from Railway Server"
  }'
echo ""

# Test 3: Create landlord account
echo "3. Testing landlord account creation..."
curl -X POST "$RAILWAY_URL/api/payments/create-landlord-account" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "businessName": "Smith Properties LLC"
  }' | jq '.' 2>/dev/null || curl -X POST "$RAILWAY_URL/api/payments/create-landlord-account" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "businessName": "Smith Properties LLC"
  }'

echo ""
echo "🎉 Railway testing completed!"
echo "If all tests passed, your backend is live on Railway!"
