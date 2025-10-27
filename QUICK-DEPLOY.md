# ⚡ Quick Deploy Reference

## 🎯 Your Deployment Setup

```
Frontend (Next.js)  →  Vercel
Backend (Socket.IO) →  Railway
```

---

## 📋 Deployment Steps (15 minutes)

### 1️⃣ Deploy Socket Server to Railway (5 min)
- Go to https://railway.app
- New Project → Deploy from GitHub
- Set Root Directory: `src/server`
- Set Start Command: `node socket.js`
- Add Variable: `FRONTEND_URL` = `*`
- **Copy your Railway URL!**

### 2️⃣ Deploy Frontend to Vercel (8 min)
- Go to https://vercel.com
- Import your GitHub repo
- Add ALL environment variables (see below)
- **Set `NEXT_PUBLIC_SOCKET_URL` = Your Railway URL**
- Deploy
- **Copy your Vercel URL!**

### 3️⃣ Update CORS (2 min)
- Railway: Update `FRONTEND_URL` = Your Vercel URL
- Appwrite: Add Vercel domain to CORS

---

## 🔑 Environment Variables for Vercel

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=687e5171003457e6fcd7
NEXT_PUBLIC_DATABASE_ID=687f22030028adb76c45
NEXT_PUBLIC_USERS_COLLECTION_ID=687f220b003868036e40
NEXT_PUBLIC_ITEMS_COLLECTION_ID=687f7609003e1cd95449
NEXT_PUBLIC_BOOKINGS_COLLECTION_ID=687f94a40009410fd186
NEXT_PUBLIC_CHATS_COLLECTION_ID=6884dd55002eedf936c2
NEXT_PUBLIC_NOTIFICATIONS_COLLECTION_ID=68850ca4000bd43fd3f2
NEXT_PUBLIC_SOCKET_URL=https://YOUR-RAILWAY-URL.up.railway.app
RAZORPAY_ID=rzp_test_cP2oUOIq9HRlU5
RAZORPAY_SECRET=emEXNnTH6RZTo0LvpelN5rru
```

⚠️ **IMPORTANT**: Replace `YOUR-RAILWAY-URL` with actual Railway URL!

---

## ✅ Quick Test Checklist

After deployment, test these:
- [ ] Open your Vercel URL
- [ ] Register a new user
- [ ] Login works
- [ ] Create an item listing
- [ ] Open chat (verify Socket connection in browser console)
- [ ] Test payment flow

---

## 🆘 Common Issues

**Chat not working?**
→ Check `NEXT_PUBLIC_SOCKET_URL` in Vercel

**"Environment variable not found"?**
→ Redeploy after adding env vars

**Appwrite errors?**
→ Add Vercel domain to Appwrite CORS

---

## 📚 Detailed Guide

See **DEPLOY-GUIDE.md** for step-by-step instructions with screenshots and troubleshooting.

---

## 🎉 You're Ready!

Your project builds successfully. Just follow the 3 steps above!
