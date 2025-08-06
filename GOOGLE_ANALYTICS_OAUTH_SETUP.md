# Google Analytics OAuth Setup Guide

## Current Issue
The Google Analytics Embed API is failing with OAuth authentication errors. This is because the OAuth client configuration in Google Cloud Console doesn't match the current domain.

## Quick Fix Steps

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Select Your Project
- Make sure you're in the `the-reverse-aging-challenge` project

### 3. Navigate to OAuth Configuration
- Go to **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID: `337168912273-uakjkqm6jk2ef1jpgvjr4aib262821sb.apps.googleusercontent.com`
- Click on it to edit

### 4. Update Authorized JavaScript Origins
Add these domains:
```
https://the-reverse-aging-challenge.web.app
https://localhost:3000
http://localhost:3000
```

### 5. Update Authorized Redirect URIs
Add these redirect URIs:
```
https://the-reverse-aging-challenge.web.app/__/auth/handler
https://the-reverse-aging-challenge.web.app
https://localhost:3000
http://localhost:3000
```

### 6. Save Changes
- Click **Save** at the bottom of the page
- Wait 5-10 minutes for changes to propagate

## Test the Configuration

1. **Click "Diagnose Configuration"** in the analytics dashboard
2. **Try signing in** with the "Sign in to Google Analytics" button
3. **Check the console** for detailed error messages

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
**Solution**: Add the exact domain to Authorized Redirect URIs in Google Cloud Console

### Issue: "access_denied"
**Solution**: Check that the OAuth client has the correct scopes enabled

### Issue: "server_error"
**Solution**: Verify the OAuth client is properly configured and wait for changes to propagate

### Issue: Content Security Policy violations
**Solution**: This is a browser warning and doesn't affect functionality

## Environment Variables Check

Your current `.env` file has:
- ✅ `REACT_APP_GA_API_KEY`: `AIzaSyANm3MPLeU4fgKk3Iu3lM5HhVmOEHoeRok`
- ✅ `REACT_APP_GA_CLIENT_ID`: `337168912273-uakjkqm6jk2ef1jpgvjr4aib262821sb.apps.googleusercontent.com`
- ✅ `REACT_APP_GA_PROPERTY_ID`: `499202078`

## API Enablement Check

Make sure these APIs are enabled in Google Cloud Console:
1. **Google Analytics Data API (GA4)**
2. **Google Analytics Embed API**

## Testing Steps

1. **Local Development**: Test on `http://localhost:3000`
2. **Staging**: Test on `https://the-reverse-aging-challenge.web.app`
3. **Production**: Test on your production domain

## Troubleshooting

If you still have issues:

1. **Clear browser cache** and cookies
2. **Try incognito/private mode**
3. **Check browser console** for detailed error messages
4. **Verify OAuth client configuration** matches exactly
5. **Wait 10-15 minutes** for Google's changes to propagate

## Alternative: Use Service Account (Server-side)

If client-side OAuth continues to fail, we can implement a server-side solution using a service account, but this requires backend changes.

## Current Status

- ✅ Environment variables configured
- ✅ Google Analytics Data API enabled
- ❌ OAuth client domain configuration needs updating
- ❌ Authentication flow needs testing after configuration

**Next Step**: Update the OAuth client configuration in Google Cloud Console as described above. 