# Using Firebase Credentials for Google Analytics

Since you already have Firebase set up, you can reuse your existing credentials for Google Analytics API access.

## What You Already Have ✅

Based on your Firebase configuration, you already have:
- **Firebase API Key** (`REACT_APP_FIREBASE_API_KEY`)
- **Firebase Project ID** (`REACT_APP_FIREBASE_PROJECT_ID`)
- **Google Analytics Measurement ID** (`REACT_APP_GA_MEASUREMENT_ID`)

## What You Need to Add 🔧

You only need to add **one** environment variable:

### 1. Get Your OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your **Firebase project** (same project ID as `REACT_APP_FIREBASE_PROJECT_ID`)
3. Go to **APIs & Services** → **Credentials**
4. Look for existing OAuth 2.0 Client IDs
5. If you don't see one, create a new one:
   - Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
   - **Application type**: Web application
   - **Name**: "Reverse Aging LMS Web Client"
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)

### 2. Enable Google Analytics API

1. In the same Google Cloud project, go to **APIs & Services** → **Library**
2. Search for "Google Analytics Data API"
3. Click on it and click **"Enable"**

### 3. Add to Your Environment Variables

Add this to your `.env` file:

```env
# Google Analytics API (using existing Firebase credentials)
REACT_APP_GA_CLIENT_ID=your_oauth_client_id_here
REACT_APP_GA_PROPERTY_ID=your_ga4_property_id_here
```

**Note**: The API key will automatically use your existing `REACT_APP_FIREBASE_API_KEY`.

### 4. Get Your GA4 Property ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin** → **Property Settings**
4. Copy the **Property ID** (format: `123456789`)

## Quick Setup Checklist

- [ ] **OAuth Client ID** added to `.env`
- [ ] **GA4 Property ID** added to `.env`
- [ ] **Google Analytics Data API** enabled in Google Cloud Console
- [ ] **Restart development server**

## Testing

1. Restart your development server
2. Go to the Analytics Dashboard
3. Click "Sign in to Google Analytics"
4. You should see real data instead of demo data

## Troubleshooting

### "client_id and scope must both be provided"
- Check that `REACT_APP_GA_CLIENT_ID` is set correctly
- Ensure the OAuth consent screen has the scope: `https://www.googleapis.com/auth/analytics.readonly`

### "Access denied"
- Make sure you've granted access to your GA property
- Check that the API is enabled in Google Cloud Console

### "Property not found"
- Verify the Property ID is correct
- Ensure you have access to the property

## Security Note

Your Firebase API key is already configured for your domain, so it's safe to use for Google Analytics API calls. The OAuth client ID is also restricted to your domain, providing additional security. 