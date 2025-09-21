# 🚂 Railway Deployment Guide for JustPay Backend

## Why Railway?
- **Faster deployment** than Render (1-2 minutes vs 5-10 minutes)
- **Better free tier** with more generous limits
- **Automatic HTTPS** and custom domains
- **Built-in database** support if needed later
- **Simple GitHub integration**

## 🚀 Step-by-Step Railway Deployment

### Method 1: Web Dashboard (Recommended)

1. **Go to Railway**: [https://railway.app](https://railway.app)
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose Repository**: `okothvientrevor/justpaybackend`
6. **Click "Deploy Now"**

### Method 2: Railway CLI (Advanced)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## ⚙️ Configuration

### Environment Variables
After deployment, add these in Railway dashboard:

```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
ALLOWED_ORIGINS=https://justpay-backend-production.up.railway.app
```

### Custom Domain (Optional)
1. **Go to Settings** in Railway dashboard
2. **Click "Domains"**
3. **Add custom domain**: `api.justpay.com`

## 🔧 Railway Configuration Files

The following files are already created for Railway:

- `railway.json` - Railway-specific configuration
- `Procfile` - Process specification
- `.env.railway` - Environment variables template

## 📱 Update Flutter App

Once deployed, update your Flutter app to use the Railway URL:

```dart
class PaymentService {
  // Your Railway URL (automatically generated)
  static const String baseUrl = 'https://justpay-backend-production.up.railway.app/api/payments';
  
  // Rest of your code remains the same...
}
```

## 🧪 Testing Your Deployment

After deployment, run:

```bash
./test-railway.sh
```

Or test manually:

```bash
# Health check
curl https://justpay-backend-production.up.railway.app/health

# Create payment link
curl -X POST https://justpay-backend-production.up.railway.app/api/payments/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "currency": "usd", "description": "Test Payment"}'
```

## 💡 Railway Benefits

- **Automatic deployments** on git push
- **Zero-downtime deployments**
- **Built-in monitoring** and logs
- **Horizontal scaling** available
- **Database integration** (PostgreSQL, MySQL, Redis)

## 🔒 Security Features

- **Automatic SSL certificates**
- **Environment variable encryption**
- **Network isolation**
- **DDoS protection**

## 📊 Monitoring

Railway provides:
- **Real-time logs**
- **Performance metrics**
- **Uptime monitoring**
- **Error tracking**

## 🎯 Next Steps After Deployment

1. **Test all endpoints** using the test script
2. **Update Flutter app** with the new URL
3. **Set up custom domain** (optional)
4. **Configure webhooks** for payment events
5. **Add database** if needed for user management

## 🆘 Troubleshooting

### Common Issues:

1. **Port Issues**: Railway automatically sets PORT variable
2. **Environment Variables**: Double-check all variables are set
3. **CORS Errors**: Ensure your Flutter app domain is in ALLOWED_ORIGINS
4. **Build Failures**: Check logs in Railway dashboard

### Getting Help:

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: Active community support
- **GitHub Issues**: For code-related problems

## 💰 Pricing

- **Free Tier**: $5 credit per month (generous for small apps)
- **Pro Plan**: Pay-as-you-use pricing
- **No sleeping**: Unlike Heroku free tier, Railway doesn't sleep

Your JustPay backend is now ready for Railway deployment! 🚂✨
