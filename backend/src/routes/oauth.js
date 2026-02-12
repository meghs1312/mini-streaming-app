const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../config/db');

// ---------------------------------------------------------------------------
// Helper: Generate session token (no JWT)
// ---------------------------------------------------------------------------
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ---------------------------------------------------------------------------
// GOOGLE OAUTH
// ---------------------------------------------------------------------------

// Step 1: Redirect user to Google login
router.get('/google', (req, res) => {
  const redirectUri = req.query.redirect_uri;
  if (!redirectUri) {
    return res.status(400).json({ error: 'redirect_uri is required' });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'email profile',
    state: redirectUri,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// Step 2: Google redirects back with code
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const appRedirect = state || '';

  if (!code) {
    return res.redirect(`${appRedirect}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error('Google token error:', tokenData);
      return res.redirect(`${appRedirect}?error=token_exchange_failed`);
    }

    // Get user profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userRes.json();
    const email = profile?.email;

    if (!email) {
      return res.redirect(`${appRedirect}?error=no_email`);
    }

    // Create or update user, store session token
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    const sessionToken = generateSessionToken();

    if (rows.length === 0) {
      await db.query(
        'INSERT INTO users (email, password, session_token) VALUES (?, ?, ?)',
        [email, null, sessionToken]
      );
    } else {
      await db.query('UPDATE users SET session_token = ? WHERE email = ?', [
        sessionToken,
        email,
      ]);
    }

    res.redirect(`${appRedirect}?token=${sessionToken}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${appRedirect}?error=authentication_failed`);
  }
});

// ---------------------------------------------------------------------------
// GITHUB OAUTH
// ---------------------------------------------------------------------------

// Step 1: Redirect user to GitHub login
router.get('/github', (req, res) => {
  const redirectUri = req.query.redirect_uri;
  if (!redirectUri) {
    return res.status(400).json({ error: 'redirect_uri is required' });
  }

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: 'user:email',
    state: redirectUri,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// Step 2: GitHub redirects back with code
router.get('/github/callback', async (req, res) => {
  const { code, state } = req.query;
  const appRedirect = state || '';

  if (!code) {
    return res.redirect(`${appRedirect}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('GitHub token error:', tokenData);
      return res.redirect(`${appRedirect}?error=token_exchange_failed`);
    }

    // Get user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'mini-streaming-app',
      },
    });

    const profile = await userRes.json();
    let email = profile?.email;

    // GitHub may not return email publicly
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'mini-streaming-app',
        },
      });
      const emails = await emailsRes.json();
      const primary = Array.isArray(emails)
        ? emails.find((e) => e.primary && e.verified) || emails[0]
        : null;
      email = primary?.email;
    }

    if (!email) {
      return res.redirect(`${appRedirect}?error=no_email`);
    }

    // Create or update user, store session token
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    const sessionToken = generateSessionToken();

    if (rows.length === 0) {
      await db.query(
        'INSERT INTO users (email, password, session_token) VALUES (?, ?, ?)',
        [email, null, sessionToken]
      );
    } else {
      await db.query('UPDATE users SET session_token = ? WHERE email = ?', [
        sessionToken,
        email,
      ]);
    }

    res.redirect(`${appRedirect}?token=${sessionToken}`);
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.redirect(`${appRedirect}?error=authentication_failed`);
  }
});

module.exports = router;
