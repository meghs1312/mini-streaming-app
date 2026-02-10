# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for the Mini Streaming App.

## Prerequisites

- Google Cloud Console account
- GitHub account
- Backend server running on `http://localhost:5000`

---

## 🔍 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** for your project

### Step 2: Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure the consent screen if prompted:
   - User Type: External
   - App name: Mini Streaming App
   - User support email: Your email
   - Developer contact: Your email
4. Application type: **Web application**
5. Add authorized redirect URIs:
   ```
   http://localhost:5000/auth/google/callback
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 3: Configure Backend

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Add your Google credentials:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
```

---

## 🐙 GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** > **New OAuth App**
3. Fill in the details:
   - **Application name**: Mini Streaming App
   - **Homepage URL**: `http://localhost:5000`
   - **Authorization callback URL**: `http://localhost:5000/auth/github/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it

### Step 2: Configure Backend

Add your GitHub credentials to the `.env` file:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5000/auth/github/callback
```

---

## 📱 Mobile App Setup

### Step 1: Install Dependencies

```bash
cd mobile-app
npm install expo-web-browser expo-linking
```

### Step 2: Get Android Package Name and SHA-1 (For Google OAuth on Android)

When setting up Google OAuth with **Application Type: Android**, you'll need:

#### **Package Name**
Use: `com.ministreaming.app` (or your custom package name)

#### **SHA-1 Certificate Fingerprint**

**For Development (Debug Keystore):**

1. First, run your app once to generate the debug keystore:
   ```bash
   cd mobile-app
   npm start
   # Press 'a' to run on Android
   ```

2. Then get the SHA-1 fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

3. Copy the **SHA1** value (looks like: `A1:B2:C3:D4:E5:F6:...`)

4. Add it to your Google OAuth credentials in Google Cloud Console

**For Production (Release Keystore):**

When building for production, you'll need to generate a release keystore and get its SHA-1:

```bash
# Generate release keystore (do this once)
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Get SHA-1 from release keystore
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

### Step 3: Configure App Scheme (Optional)

If you want to customize the redirect URL scheme, update `app.json`:

```json
{
  "expo": {
    "scheme": "mini-streaming-app"
  }
}
```

---

## 🧪 Testing OAuth

### Backend Testing

1. Start your backend server:
   ```bash
   cd backend
   node server.js
   ```

2. Test Google OAuth:
   ```bash
   curl http://localhost:5000/auth/google
   ```

3. Test GitHub OAuth:
   ```bash
   curl http://localhost:5000/auth/github
   ```

### Mobile App Testing

1. Start the mobile app:
   ```bash
   cd mobile-app
   npm start
   ```

2. Open the app on your emulator/device
3. On the Login or Register screen, tap:
   - **🔍 Continue with Google**
   - **🐙 Continue with GitHub**

4. Complete the OAuth flow in the browser
5. You should be redirected back to the app

---

## 🔐 Security Considerations

### Environment Variables

**Never commit `.env` files to version control!**

Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

### Production Setup

For production deployment:

1. **Update redirect URIs** to use your production domain:
   ```
   https://yourdomain.com/auth/google/callback
   https://yourdomain.com/auth/github/callback
   ```

2. **Use HTTPS** for all OAuth callbacks

3. **Implement JWT tokens** for session management (currently using mock tokens)

4. **Store OAuth tokens securely** in the database

5. **Add rate limiting** to prevent abuse

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error

**Problem**: The redirect URI doesn't match what's configured in Google/GitHub.

**Solution**: 
- Ensure the redirect URI in your OAuth app settings exactly matches the one in your `.env` file
- Include the protocol (`http://` or `https://`)
- Check for trailing slashes

### "Invalid Client" Error

**Problem**: Client ID or Secret is incorrect.

**Solution**:
- Double-check your `.env` file credentials
- Regenerate the client secret if needed
- Restart your backend server after updating `.env`

### OAuth Window Doesn't Open

**Problem**: `expo-web-browser` not installed or configured.

**Solution**:
```bash
cd mobile-app
npm install expo-web-browser expo-linking
```

### Can't Redirect Back to App

**Problem**: App scheme not configured properly.

**Solution**:
- Check `app.json` for correct scheme configuration
- Rebuild the app after changing `app.json`
- For Android, ensure deep linking is configured

---

## 📝 Implementation Notes

### Current Implementation

The OAuth implementation includes:

✅ Google OAuth flow (authorization code grant)  
✅ GitHub OAuth flow (authorization code grant)  
✅ Browser-based authentication with `expo-web-browser`  
✅ Automatic redirect back to app  
✅ Error handling and user feedback  

### TODO: Production Enhancements

- [ ] Implement JWT-based session management
- [ ] Store OAuth tokens in database
- [ ] Add token refresh logic
- [ ] Implement user profile sync
- [ ] Add OAuth account linking
- [ ] Implement logout with token revocation
- [ ] Add OAuth scope management
- [ ] Implement PKCE for enhanced security

---

## 🔗 Useful Links

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Expo Web Browser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [Expo Linking Documentation](https://docs.expo.dev/versions/latest/sdk/linking/)

---

## 💡 Tips

1. **Test with multiple accounts** to ensure OAuth works for different users
2. **Handle edge cases** like cancelled authentication or network errors
3. **Log OAuth events** for debugging (but never log secrets!)
4. **Use environment-specific configs** for development, staging, and production
5. **Monitor OAuth usage** to detect potential security issues

---

**Need help?** Check the main README.md or create an issue in the repository.
