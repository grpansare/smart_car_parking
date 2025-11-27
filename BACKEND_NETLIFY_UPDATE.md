# 🔄 Backend Update for Netlify Frontend

## Changes Made

Updated backend configuration to work with Netlify frontend: **https://parkeasein.netlify.app**

### Files Modified

1. **SecurityConfig.java**
   - ✅ Added Netlify URL to CORS allowed origins
   - ✅ Updated OAuth redirect URL to Netlify frontend

2. **WebConfig.java**
   - ✅ Added Netlify URL for file uploads CORS

---

## 🚀 Next Steps to Deploy

### 1. **Update Google OAuth Console**

Add your Netlify URL to Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://parkeasein.netlify.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://smart-car-parking-wa4f.onrender.com/login/oauth2/code/google
   ```

### 2. **Commit and Push Changes**

```bash
cd "d:\G Drive\parking website\smart_car_parking"
git add .
git commit -m "Update backend CORS for Netlify frontend"
git push
```

### 3. **Redeploy Backend on Render**

Your backend on Render should automatically redeploy when you push to GitHub. If not:
- Go to Render dashboard
- Select your backend service
- Click **"Manual Deploy"** → **"Deploy latest commit"**

### 4. **Verify Environment Variables on Render**

Ensure these are set in Render:
```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://ep-aged-sound-ad66j0lr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
DB_USER=neondb_owner
DB_PASSWORD=npg_rM2Ep6TyxqAI
GOOGLE_CLIENT_ID=<your-value>
GOOGLE_CLIENT_SECRET=<your-value>
RAZORPAY_KEY_ID=<your-value>
RAZORPAY_KEY_SECRET=<your-value>
SPRING_MAIL_USERNAME=<your-value>
SPRING_MAIL_PASSWORD=<your-value>
ADMIN_USERNAME=<your-value>
ADMIN_PASSWORD=<your-value>
```

### 5. **Update Frontend Environment Variables on Netlify**

Make sure these are set in Netlify:
```
VITE_API_URL=https://smart-car-parking-wa4f.onrender.com
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>
```

---

## ✅ Testing Checklist

After deployment:

- [ ] Visit https://parkeasein.netlify.app
- [ ] Test Google OAuth login
- [ ] Check browser console for CORS errors
- [ ] Test API calls (booking, payment, etc.)
- [ ] Verify file uploads work
- [ ] Test WebSocket connections (if applicable)

---

## 🔗 URLs

- **Frontend**: https://parkeasein.netlify.app
- **Backend**: https://smart-car-parking-wa4f.onrender.com
- **Database**: Neon PostgreSQL (configured)

---

## 📝 Summary of Changes

### CORS Configuration
- Added `https://parkeasein.netlify.app` to allowed origins
- Maintains localhost URLs for local development

### OAuth Redirect
- Production redirects to: `https://parkeasein.netlify.app/dashboard`
- Local development redirects to: `http://localhost:5173/dashboard`

### File Uploads
- Netlify frontend can now access `/uploads/**` endpoints
