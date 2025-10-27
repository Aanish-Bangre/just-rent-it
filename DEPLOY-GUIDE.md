# 🚀 Quick Deployment Guide

Deploy **Just Rent It** in 2 steps:
- Frontend (Next.js) → **Vercel**
- Backend (Socket.IO) → **Railway**

---

## Step 1: Deploy Socket.IO Server to Railway

### A. Prepare the Socket Server

The socket server is already configured in `src/server/socket.js`

### B. Deploy to Railway

1. **Go to [Railway.app](https://railway.app)** and sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `just-rent-it` repository

3. **Configure Service**
   - Railway will auto-detect the project
   - Click on "Settings" 
   - Set **Root Directory**: `src/server`
   - Set **Start Command**: `node socket.js`

4. **Add Environment Variable**
   - Go to "Variables" tab
   - Add: `FRONTEND_URL` = `*` (we'll update this after deploying frontend)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

---

## Step 2: Deploy Frontend to Vercel

### A. Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### B. Deploy to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your `just-rent-it` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add these:

   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=687e5171003457e6fcd7
   NEXT_PUBLIC_DATABASE_ID=687f22030028adb76c45
   NEXT_PUBLIC_USERS_COLLECTION_ID=687f220b003868036e40
   NEXT_PUBLIC_ITEMS_COLLECTION_ID=687f7609003e1cd95449
   NEXT_PUBLIC_BOOKINGS_COLLECTION_ID=687f94a40009410fd186
   NEXT_PUBLIC_CHATS_COLLECTION_ID=6884dd55002eedf936c2
   NEXT_PUBLIC_NOTIFICATIONS_COLLECTION_ID=68850ca4000bd43fd3f2
   NEXT_PUBLIC_SOCKET_URL=https://your-railway-url.up.railway.app
   RAZORPAY_ID=rzp_test_cP2oUOIq9HRlU5
   RAZORPAY_SECRET=emEXNnTH6RZTo0LvpelN5rru
   ```

   **⚠️ Important**: Replace `NEXT_PUBLIC_SOCKET_URL` with your Railway URL from Step 1!

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at `https://your-app.vercel.app`

---

## Step 3: Update CORS Settings

### A. Update Railway Socket Server

1. Go back to your Railway project
2. Go to "Variables" tab
3. Update `FRONTEND_URL` from `*` to your Vercel URL
   - Example: `https://your-app.vercel.app`
4. Redeploy the service

### B. Update Appwrite CORS

1. Go to your [Appwrite Console](https://cloud.appwrite.io)
2. Select your project
3. Go to "Settings" → "Platforms"
4. Add a new Web platform:
   - Name: `Production`
   - Hostname: Your Vercel URL (e.g., `your-app.vercel.app`)
   - Click "Add"

---

## ✅ Post-Deployment Checklist

- [ ] Socket.IO server is running on Railway
- [ ] Frontend is deployed on Vercel
- [ ] Railway `FRONTEND_URL` updated with Vercel URL
- [ ] Appwrite CORS includes Vercel domain
- [ ] Test user registration
- [ ] Test login
- [ ] Test creating an item listing
- [ ] Test real-time chat functionality
- [ ] Test payment flow (with test keys)

---

## 🔧 Troubleshooting

### Chat not working?
- Check `NEXT_PUBLIC_SOCKET_URL` in Vercel env vars
- Verify Railway service is running
- Check Railway logs for connection errors

### Appwrite errors?
- Verify all Appwrite env vars are correct
- Check Appwrite CORS settings
- Ensure collection IDs match your Appwrite project

### Payment not working?
- Verify Razorpay keys are correct
- For production, replace test keys with live keys
- Check Razorpay dashboard for webhooks

---

## 📝 Important Notes

1. **Production Razorpay Keys**: Before going live, replace test keys with production keys from Razorpay dashboard

2. **Custom Domain**: You can add custom domains in both Vercel and Railway settings

3. **Environment Variables**: Any changes to env vars require a redeploy

4. **Auto-Deploy**: Both Vercel and Railway auto-deploy on git push to main branch

---

## 🎉 You're Done!

Your app is now live:
- **Frontend**: `https://your-app.vercel.app`
- **Socket Server**: `https://your-railway-url.up.railway.app`

Share the Vercel URL with users to start renting! 🎊
