# OAuth Google Login Fix Guide

## The Problem
Getting error: `User (role: guests) missing scopes (["account"])` when trying to login with Google OAuth.

## Root Causes & Solutions

### 1. **Appwrite OAuth Platform Configuration** ⚠️ MOST COMMON ISSUE

You need to configure the OAuth success/failure URLs in your Appwrite Dashboard:

#### Steps to Fix:
1. Go to your Appwrite Console: https://cloud.appwrite.io
2. Navigate to **Auth** → **Settings**
3. Find the **OAuth2 Providers** section
4. Click on **Google** provider
5. **CRITICAL**: Add these exact URLs (replace with your actual Vercel domain):

   **Success URLs:**
   ```
   https://your-app.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

   **Failure URLs:**
   ```
   https://your-app.vercel.app/login
   http://localhost:3000/login
   ```

6. **Save** the changes

### 2. **Google Cloud Console Configuration**

Make sure your Google OAuth credentials include your production domain:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   ```
   https://your-app.vercel.app
   https://cloud.appwrite.io
   ```
4. Under **Authorized redirect URIs**, add:
   ```
   https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/65...
   ```
   (Get the exact callback URL from Appwrite Console → Auth → Google OAuth settings)

### 3. **Environment Variables on Vercel**

Make sure these are set correctly in Vercel:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_DATABASE_ID=your_database_id
NEXT_PUBLIC_USERS_COLLECTION_ID=your_collection_id
```

### 4. **Code Changes Made**

I've updated the following files to:
- Add retry logic for session verification
- Wrap `useSearchParams` in Suspense boundaries
- Add better error handling and messages

Files updated:
- `/src/app/auth/callback/page.tsx` - Now retries getting user session 3 times
- `/src/app/login/page.tsx` - Wrapped in Suspense
- `/src/app/items/[listingId]/checkout/page.tsx` - Wrapped in Suspense

## Testing Steps

1. **Clear all browser data** for your site (cookies, cache, local storage)
2. Try logging in with Google
3. If it still fails, check:
   - Browser console for errors
   - Network tab for failed requests
   - Vercel deployment logs

## Alternative: Email/Password Login

If OAuth continues to have issues, you can use the email/password login which is working fine. The OAuth can be debugged separately while users can still access the app.

## Common Issues

### Issue: "Authentication incomplete. Please try again."
**Solution**: The session cookie isn't being set. This is usually due to:
- Incorrect redirect URLs in Appwrite dashboard
- Browser blocking third-party cookies (especially Safari)
- CORS issues

### Issue: Page keeps redirecting in a loop
**Solution**: Clear cookies and ensure success URL is exactly: `https://your-domain/auth/callback`

## Debug Mode

To see detailed logs, open browser console (F12) and look for:
```
Retry attempt 1/3 failed: ...
OAuth callback error: ...
```

This will show you exactly what's failing during the authentication process.
