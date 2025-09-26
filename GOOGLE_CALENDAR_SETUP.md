# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for automatic booking events.

## Prerequisites

- Google Cloud Console account
- A Google account with Calendar API access

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Calendar API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Click **Create**
6. Download the JSON file and note the `client_id` and `client_secret`

## Step 4: Get Refresh Token

### Option A: Using OAuth Playground (Recommended)

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your `Client ID` and `Client Secret`
5. In the left panel, find "Google Calendar API v3"
6. Select `https://www.googleapis.com/auth/calendar`
7. Click **Authorize APIs**
8. Sign in with your Google account
9. Click **Exchange authorization code for tokens**
10. Copy the `refresh_token` from the response

### Option B: Using a Simple Script

Create a temporary script to get the refresh token:

```javascript
// get-refresh-token.js
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar']
});

console.log('Authorize this app by visiting this url:', authUrl);

// After authorization, use the code to get tokens
// oauth2Client.getToken(code, (err, tokens) => {
//   if (err) return console.error('Error retrieving access token', err);
//   console.log('Refresh token:', tokens.refresh_token);
// });
```

## Step 5: Configure Environment Variables

Add these to your `.env` file:

```env
# Google Calendar Integration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

**Your credentials are already configured!** You just need to get the refresh token.

## Quick Setup (Recommended)

Run this command to get your refresh token automatically:

```bash
node get-google-refresh-token.js
```

This will:
1. Open a browser window for Google authorization
2. Guide you through the permission process
3. Generate your refresh token
4. Show you exactly what to add to your `.env` file

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Create a test booking
3. Check your Google Calendar for the new event
4. Verify the event includes:
   - Resource name and user information
   - Correct start and end times
   - Location information
   - Email reminders

## Features

### Automatic Event Creation
- ✅ Events created when bookings are made
- ✅ Events include resource name, user info, and booking details
- ✅ Proper timezone handling (Africa/Harare)
- ✅ Email and popup reminders

### Event Management
- ✅ Events updated when bookings are modified
- ✅ Events deleted when bookings are cancelled
- ✅ Google Calendar event ID stored in database

### Error Handling
- ✅ Graceful fallback if Google Calendar is unavailable
- ✅ Booking creation continues even if calendar fails
- ✅ Detailed error logging

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Verify your Client ID and Client Secret
   - Ensure the Calendar API is enabled
   - Check that the refresh token is valid

2. **"Access denied" error**
   - Verify the OAuth scopes include calendar access
   - Ensure the redirect URI matches your configuration
   - Check that the refresh token hasn't expired

3. **Events not appearing**
   - Check the console logs for error messages
   - Verify the calendar ID is correct (defaults to 'primary')
   - Ensure the user has calendar access

### Testing Commands

```bash
# Test Google Calendar connection
curl -X POST http://localhost:3000/api/admin/test-calendar

# Check scheduler status
curl -X GET http://localhost:3000/api/admin/scheduler-status
```

## Security Notes

- Keep your credentials secure and never commit them to version control
- Use environment variables for all sensitive information
- Regularly rotate your refresh tokens
- Consider using service accounts for production environments

## Production Considerations

- Use a dedicated Google account for the application
- Set up proper error monitoring and alerting
- Consider rate limiting for API calls
- Implement proper backup and recovery procedures
