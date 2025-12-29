import { google } from 'googleapis';

console.log('=== Google OAuth Credentials Verification ===\n');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = 'https://somnoai-lab-bvvlgs8k.manus.space/api/google-fit/callback';

console.log('Client ID:', clientId ? `${clientId.substring(0, 20)}...` : 'NOT SET');
console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 20)}...` : 'NOT SET');
console.log('Redirect URI:', redirectUri);

if (!clientId || !clientSecret) {
  console.error('\n❌ ERROR: Client ID or Client Secret is not set!');
  process.exit(1);
}

try {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  console.log('\n✅ OAuth2Client created successfully');
  console.log('Client ID matches:', oauth2Client.clientId_ === clientId);
  
  // Generate auth URL for testing
  const scopes = [
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.activity.read'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  console.log('\n✅ Auth URL generated successfully');
  console.log('Auth URL starts with:', authUrl.substring(0, 50) + '...');
  console.log('\n✅ All credentials appear to be configured correctly!');
  
} catch (error) {
  console.error('\n❌ ERROR creating OAuth2Client:', error.message);
  process.exit(1);
}
