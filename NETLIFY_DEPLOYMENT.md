# 🚀 Netlify Frontend Deployment Guide

Complete guide to deploy the Smart Car Parking frontend to Netlify.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **Backend deployed on Render**: `https://smart-car-parking-wa4f.onrender.com`
2. ✅ **Netlify account**: Sign up at [netlify.com](https://www.netlify.com/)
3. ✅ **GitHub repository**: Your code should be pushed to GitHub
4. ✅ **Google OAuth credentials** (for production)
5. ✅ **Razorpay API keys** (for payment integration)

---

## 🔧 Step 1: Update Environment Variables

### Option A: Using Netlify UI (Recommended)

1. Go to your Netlify dashboard
2. Select your site → **Site settings** → **Environment variables**
3. Add the following variables:

```
VITE_API_URL=https://smart-car-parking-wa4f.onrender.com
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

### Option B: Using .env.production (Local Testing)

Update the `.env.production` file with your actual values:

```bash
VITE_API_URL=https://smart-car-parking-wa4f.onrender.com
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
VITE_RAZORPAY_KEY_ID=your-actual-razorpay-key-id
VITE_GOOGLE_MAPS_API_KEY=your-actual-google-maps-api-key
```

> **⚠️ Important**: Do NOT commit `.env.production` with real credentials to GitHub!

---

## 🚀 Step 2: Deploy to Netlify

### Method 1: Deploy via Netlify UI (Easiest)

1. **Login to Netlify**: Go to [app.netlify.com](https://app.netlify.com/)

2. **Import from Git**:
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect to your **GitHub** account
   - Select your repository: `smart_car_parking`

3. **Configure Build Settings**:
   - **Base directory**: `smart-parking-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `smart-parking-frontend/dist`
   - **Node version**: `18`

4. **Add Environment Variables** (from Step 1)

5. **Deploy**: Click **"Deploy site"**

### Method 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Navigate to frontend directory
cd "d:\G Drive\parking website\smart_car_parking\smart-parking-frontend"

# Login to Netlify
netlify login

# Initialize Netlify site
netlify init

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

---

## 🔐 Step 3: Update Google OAuth Redirect URIs

After deployment, you'll get a Netlify URL like: `https://your-app-name.netlify.app`

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-app-name.netlify.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.netlify.app/login/oauth2/code/google
   ```

---

## 🔄 Step 4: Update Backend CORS Settings

Update your backend `application-prod.properties` to allow your Netlify domain:

```properties
# Add your Netlify URL to allowed origins
cors.allowed-origins=https://your-app-name.netlify.app,http://localhost:5173
```

Then redeploy your backend on Render.

---

## ✅ Step 5: Verify Deployment

1. **Visit your Netlify URL**: `https://your-app-name.netlify.app`
2. **Test Login**: Try Google OAuth login
3. **Test API Calls**: Check if frontend can communicate with backend
4. **Check Browser Console**: Look for any CORS or API errors
5. **Test Payment Flow**: Verify Razorpay integration works

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution**: Ensure backend allows your Netlify domain in CORS settings

```properties
# In application-prod.properties
cors.allowed-origins=https://your-app-name.netlify.app
```

### Issue: Environment Variables Not Working

**Solution**: 
- Ensure variables start with `VITE_` prefix
- Redeploy after adding environment variables
- Check Netlify build logs for errors

### Issue: 404 on Page Refresh

**Solution**: The `netlify.toml` file handles this with SPA redirects. Ensure it's in the root of `smart-parking-frontend`.

### Issue: Build Fails

**Solution**: Check Netlify build logs
- Verify Node version is 18
- Check for missing dependencies
- Ensure build command is `npm run build`

---

## 📝 Files Created

- ✅ `netlify.toml` - Netlify configuration
- ✅ `.env.production` - Production environment template
- ✅ Updated `src/api/axios.js` - Dynamic API URL

---

## 🎯 Next Steps

1. **Custom Domain** (Optional): Add your custom domain in Netlify settings
2. **SSL Certificate**: Netlify provides free SSL automatically
3. **Continuous Deployment**: Push to GitHub to auto-deploy
4. **Performance Monitoring**: Use Netlify Analytics

---

## 📚 Useful Commands

```bash
# Local production build test
npm run build
npm run preview

# Check build output
ls dist/

# Deploy to Netlify (CLI)
netlify deploy --prod

# View deployment logs
netlify logs
```

---

## 🔗 Important URLs

- **Backend (Render)**: https://smart-car-parking-wa4f.onrender.com
- **Frontend (Netlify)**: https://your-app-name.netlify.app
- **Netlify Dashboard**: https://app.netlify.com
- **Google Cloud Console**: https://console.cloud.google.com

---

## 📞 Support

If you encounter issues:
1. Check Netlify build logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure backend is running on Render
