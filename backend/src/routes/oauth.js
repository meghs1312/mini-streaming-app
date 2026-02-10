const express = require('express');
const router = express.Router();

// Google OAuth
router.get('/google', (req, res) => {
  const { redirect_uri } = req.query;
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=email profile` +
    `&state=${encodeURIComponent(redirect_uri)}`;
  
  res.redirect(googleAuthUrl);
});

router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    const userData = await userResponse.json();
    
    // Here you would:
    // 1. Check if user exists in database
    // 2. Create user if not exists
    // 3. Generate JWT token
    // 4. Redirect back to app with token
    
    const redirectUrl = `${state}?token=mock_token_${userData.email}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${state}?error=authentication_failed`);
  }
});

// GitHub OAuth
router.get('/github', (req, res) => {
  const { redirect_uri } = req.query;
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${process.env.GITHUB_REDIRECT_URI}` +
    `&scope=user:email` +
    `&state=${encodeURIComponent(redirect_uri)}`;
  
  res.redirect(githubAuthUrl);
});

router.get('/github/callback', async (req, res) => {
  const { code, state } = req.query;
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Mini-Streaming-App',
      },
    });
    
    const userData = await userResponse.json();
    
    // Get user email if not public
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Mini-Streaming-App',
      },
    });
    
    const emails = await emailResponse.json();
    const primaryEmail = emails.find(e => e.primary)?.email || userData.email;
    
    // Here you would:
    // 1. Check if user exists in database
    // 2. Create user if not exists
    // 3. Generate JWT token
    // 4. Redirect back to app with token
    
    const redirectUrl = `${state}?token=mock_token_${primaryEmail}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${state}?error=authentication_failed`);
  }
});

module.exports = router;
