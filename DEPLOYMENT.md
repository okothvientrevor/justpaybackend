# 🚀 Render Deployment Guide for JustPay Backend

This guide will help you deploy your JustPay backend to Render for live hosting.

## 📋 Prerequisites

1. **GitHub Account**: Your code needs to be on GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Stripe Account**: With API keys ready

## 🔧 Step-by-Step Deployment

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare JustPay backend for Render deployment"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/justpay-backend.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" button** → Select "Web Service"
3. **Connect GitHub** → Select your `justpay-backend` repository
4. **Configure Service**:
   - **Name**: `justpay-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_if_needed
ALLOWED_ORIGINS=https://justpay-backend.onrender.com,https://your-flutter-app.com
```

### Step 4: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-5 minutes)
3. **Get your live URL**: `https://justpay-backend.onrender.com`

## ✅ Test Your Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://justpay-backend.onrender.com/health

# Create payment link
curl -X POST https://justpay-backend.onrender.com/api/payments/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "usd",
    "description": "Test Payment"
  }'
```

## 📱 Update Flutter App

Update your Flutter app to use the live URL:

```dart
class PaymentService {
  // Replace localhost with your Render URL
  static const String baseUrl = 'https://justpay-backend.onrender.com/api/payments';
  
  // ...rest of your code remains the same
}
```

## 🔄 Auto-Deploy Setup

Render automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update payment logic"
git push origin main
# Render will automatically redeploy!
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**: Check your `package.json` has correct dependencies
2. **Environment Variables**: Make sure all required env vars are set in Render
3. **CORS Errors**: Update `ALLOWED_ORIGINS` to include your Flutter app domain
4. **Health Check Fails**: Ensure `/health` endpoint is working

### Checking Logs:

- Go to your service in Render dashboard
- Click "Logs" tab to see real-time logs
- Look for any error messages

## 📊 Your Live Endpoints

Once deployed, your API will be available at:

- **Base URL**: `https://justpay-backend.onrender.com`
- **Health**: `https://justpay-backend.onrender.com/health`
- **Payments**: `https://justpay-backend.onrender.com/api/payments/`

## 💡 Pro Tips

1. **Free Tier**: Render's free tier spins down after 15 minutes of inactivity
2. **Custom Domain**: You can add a custom domain in Render settings
3. **SSL**: Render provides free SSL certificates automatically
4. **Monitoring**: Set up health checks and alerts in Render dashboard

## 🎉 Success!

Your JustPay backend is now live and ready to handle payments from your Flutter app!
