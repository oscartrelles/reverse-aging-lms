# Google Analytics API Setup Guide

This guide will walk you through setting up Google Analytics API credentials to enable real analytics data in the dashboard.

## Prerequisites

1. **Google Account** - You need a Google account
2. **Google Analytics 4 Property** - You need a GA4 property set up
3. **Google Cloud Project** - You'll create or use an existing project

## Step 1: Set Up Google Analytics 4 Property

### If you don't have a GA4 property yet:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Follow the setup wizard to create a new property
4. Note down your **Property ID** (format: `123456789`)

### If you already have a GA4 property:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin** → **Property Settings**
4. Note down your **Property ID**

## Step 2: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Reverse Aging LMS Analytics")
4. Click "Create"

## Step 3: Enable Google Analytics API

1. In your Google Cloud project, go to **APIs & Services** → **Library**
2. Search for "Google Analytics Data API"
3. Click on it and click "Enable"
4. Also search for and enable "Google Analytics API" (the older version)

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - **User Type**: External (or Internal if using Google Workspace)
   - **App name**: "Reverse Aging LMS Analytics"
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - **Scopes**: Add `https://www.googleapis.com/auth/analytics.readonly`
4. Click "Save and Continue" through the remaining steps

5. Back in Credentials, click "Create Credentials" → "OAuth 2.0 Client IDs"
6. **Application type**: Web application
7. **Name**: "Reverse Aging LMS Web Client"
8. **Authorized JavaScript origins**: 
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
9. **Authorized redirect URIs**:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
10. Click "Create"

## Step 5: Create API Key

1. In **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "API Key"
3. **Name**: "Reverse Aging LMS Analytics API Key"
4. Click "Create"
5. **Important**: Click "Restrict Key" and:
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**: Add your domains
   - **API restrictions**: Restrict to "Google Analytics Data API"

## Step 6: Configure Environment Variables

Create or update your `.env` file in the project root:

```env
# Google Analytics Configuration
REACT_APP_GA_API_KEY=your_api_key_here
REACT_APP_GA_CLIENT_ID=your_client_id_here
REACT_APP_GA_PROPERTY_ID=your_property_id_here
```

## Step 7: Grant Access to Your GA Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin** → **Property Access Management**
4. Click the **+** button → "Add users"
5. Add the email associated with your Google Cloud project
6. Grant "Viewer" permissions

## Step 8: Test the Integration

1. Restart your development server
2. Go to the Analytics Dashboard
3. Click "Sign in to Google Analytics"
4. You should see real data instead of demo data

## Troubleshooting

### Common Issues:

1. **"client_id and scope must both be provided"**
   - Check that `REACT_APP_GA_CLIENT_ID` is set correctly
   - Ensure the OAuth consent screen has the correct scope

2. **"Access denied"**
   - Make sure you've granted access to your GA property
   - Check that the API is enabled in Google Cloud Console

3. **"Invalid API key"**
   - Verify the API key is correct
   - Check that the API key has the correct restrictions

4. **"Property not found"**
   - Verify the Property ID is correct
   - Ensure you have access to the property

### Security Best Practices:

1. **Never commit API keys to version control**
2. **Use environment variables for all secrets**
3. **Restrict API keys to specific domains and APIs**
4. **Use the principle of least privilege for OAuth scopes**

## Alternative: Service Account (Recommended for Production)

For production applications, consider using a Service Account instead of OAuth2:

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "Service Account"
3. Download the JSON key file
4. Store it securely and update the service to use service account authentication

This approach is more secure and doesn't require user interaction.

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all APIs are enabled in Google Cloud Console
4. Check that you have the correct permissions in Google Analytics 