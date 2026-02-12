const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const videoRoutes = require('./src/routes/videos');
const oauthRoutes = require('./src/routes/oauth');

// Load environment variables from .env.json (if present)
try {
  const envConfig = require('./.env.json');
  Object.keys(envConfig).forEach((key) => {
    if (process.env[key] === undefined) {
      process.env[key] = String(envConfig[key]);
    }
  });
} catch (e) {
  console.warn('Unable to load .env.json config:', e.message);
}

// For Android emulator: use NGROK_URL so Google accepts the redirect (Google rejects raw IPs)
// Run: ngrok http 5000  →  add the HTTPS URL to .env.json as NGROK_URL
const ngrokUrl = process.env.NGROK_URL && process.env.NGROK_URL.trim();
if (ngrokUrl) {
  process.env.GOOGLE_REDIRECT_URI = `${ngrokUrl.replace(/\/$/, '')}/auth/google/callback`;
  process.env.GITHUB_REDIRECT_URI = `${ngrokUrl.replace(/\/$/, '')}/auth/github/callback`;
  console.log('🔗 Using ngrok for OAuth redirects:', process.env.GOOGLE_REDIRECT_URI);
}

const app = express();

app.use(cors({
  origin: '*',
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

app.use('/auth', authRoutes);
app.use('/auth', oauthRoutes);
app.use('/videos', videoRoutes);

db.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected');
    conn.release();

    app.listen(5000, '0.0.0.0', () => {
      console.log('🚀 Server running on http://0.0.0.0:5000');
    });
  })
  .catch(err => {
    console.error('❌ DB connection failed', err);
  });

