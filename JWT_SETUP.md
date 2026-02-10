# JWT Authentication Setup Guide

This guide explains the JWT (JSON Web Token) authentication implementation and how to set it up.

## 🔐 Overview

The application now uses JWT tokens for authentication. All protected routes require a valid JWT token in the Authorization header.

## 📦 Required Dependencies

### Backend Dependencies

```bash
cd backend
npm install jsonwebtoken
```

### Mobile App Dependencies

```bash
cd mobile-app
npm install @react-native-async-storage/async-storage
```

## 🏗️ Architecture

### Backend Components

1. **JWT Utility** (`backend/src/utils/jwt.js`)
   - `generateToken(userId, email)` - Creates JWT tokens
   - `verifyToken(token)` - Validates JWT tokens
   - Tokens expire after 7 days

2. **Authentication Middleware** (`backend/src/middleware/auth.js`)
   - Validates JWT tokens on protected routes
   - Returns 401 if token is missing
   - Returns 403 if token is invalid/expired

3. **Protected Routes**
   - `GET /videos` - Requires authentication
   - `GET /videos/:id` - Requires authentication
   - `GET /videos/search` - Requires authentication

### Mobile App Components

1. **Storage Service** (`mobile-app/src/services/storage.ts`)
   - `saveToken(token)` - Stores JWT token securely
   - `getToken()` - Retrieves stored token
   - `saveUser(user)` - Stores user data
   - `clearAll()` - Clears all stored data on logout

2. **API Service** (`mobile-app/src/services/api.ts`)
   - Axios interceptor automatically adds JWT token to requests
   - Format: `Authorization: Bearer <token>`
   - Handles 401/403 responses for expired tokens

## 🔄 Authentication Flow

### Registration Flow

```
1. User submits email/password
2. Backend hashes password with bcrypt
3. Backend creates user in database
4. Backend generates JWT token
5. Backend returns { token, user }
6. Mobile app stores token & user
7. Mobile app navigates to Home
```

### Login Flow

```
1. User submits email/password
2. Backend validates credentials
3. Backend generates JWT token
4. Backend returns { token, user }
5. Mobile app stores token & user
6. Mobile app navigates to Home
```

### API Request Flow

```
1. Mobile app makes API request
2. Axios interceptor retrieves stored token
3. Axios adds "Authorization: Bearer <token>" header
4. Backend middleware validates token
5. If valid: Request proceeds
6. If invalid: Returns 401/403 error
```

### Logout Flow

```
1. User taps Logout button
2. Mobile app clears stored token & user data
3. Mobile app navigates to Login screen
```

## 🔧 Configuration

### Backend Environment Variables

Add to `backend/.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Use a strong, random secret in production!

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Token Expiration

Default: 7 days

To change, edit `backend/src/utils/jwt.js`:

```javascript
const JWT_EXPIRES_IN = '7d'; // Change to '1d', '12h', '30m', etc.
```

## 🧪 Testing JWT Authentication

### Test with cURL

**1. Register a new user:**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Response:
```json
{
  "message": "User created",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

**2. Access protected route with token:**
```bash
curl http://localhost:5000/videos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**3. Access without token (should fail):**
```bash
curl http://localhost:5000/videos
```

Response:
```json
{
  "msg": "Access token required"
}
```

## 🔒 Security Best Practices

### Backend

1. **Use strong JWT secrets**
   - Minimum 256 bits (32 characters)
   - Use environment variables
   - Never commit secrets to version control

2. **Set appropriate expiration times**
   - Short-lived tokens (1-7 days) for mobile apps
   - Implement refresh tokens for long sessions

3. **Validate all inputs**
   - Email format validation
   - Password strength requirements
   - SQL injection prevention (using parameterized queries)

4. **Use HTTPS in production**
   - Tokens should never be sent over HTTP
   - Enable HTTPS on your server

### Mobile App

1. **Secure token storage**
   - Uses AsyncStorage (encrypted on iOS)
   - Consider using Keychain/Keystore for sensitive data

2. **Handle token expiration**
   - Implement automatic logout on 401/403
   - Show user-friendly error messages

3. **Clear tokens on logout**
   - Remove all stored authentication data
   - Reset navigation stack

## 🐛 Troubleshooting

### "Access token required" Error

**Problem:** Request doesn't include Authorization header

**Solutions:**
- Ensure user is logged in
- Check that token is stored: `await getToken()`
- Verify API interceptor is configured correctly

### "Invalid or expired token" Error

**Problem:** Token is malformed or expired

**Solutions:**
- Log out and log back in
- Check JWT_SECRET matches between environments
- Verify token hasn't expired (check expiration time)

### Videos not loading after login

**Problem:** Token not being sent with requests

**Solutions:**
- Check `mobile-app/src/services/api.ts` interceptor
- Verify token is stored: `console.log(await getToken())`
- Check network tab for Authorization header

### Backend "jwt must be provided" Error

**Problem:** jsonwebtoken package not installed

**Solution:**
```bash
cd backend
npm install jsonwebtoken
```

## 📝 Token Structure

JWT tokens contain three parts (separated by dots):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxNjE2ODQzODIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "userId": 1,
  "email": "test@example.com",
  "iat": 1616239022,
  "exp": 1616843822
}
```

**Signature:** Encrypted with JWT_SECRET

## 🚀 Production Deployment

### Backend Checklist

- [ ] Set strong JWT_SECRET in environment variables
- [ ] Enable HTTPS
- [ ] Set appropriate CORS origins
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up token refresh mechanism
- [ ] Implement token blacklisting for logout

### Mobile App Checklist

- [ ] Update API baseURL to production server
- [ ] Enable code obfuscation
- [ ] Implement biometric authentication (optional)
- [ ] Add token refresh logic
- [ ] Handle network errors gracefully
- [ ] Implement offline mode (optional)

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT debugger and documentation
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)

---

**Need help?** Check the main README.md or OAUTH_SETUP.md for related authentication topics.
