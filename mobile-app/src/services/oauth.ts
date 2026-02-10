import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import API from './api';

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = 'http://10.0.2.2:5000';

export const loginWithGoogle = async () => {
  try {
    const redirectUrl = Linking.createURL('auth/callback');
    const authUrl = `${BACKEND_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
    
    if (result.type === 'success' && result.url) {
      const url = Linking.parse(result.url);
      const token = url.queryParams?.token;
      
      if (token) {
        return { success: true, token };
      }
    }
    
    return { success: false, error: 'Authentication cancelled or failed' };
  } catch (error) {
    console.error('Google OAuth error:', error);
    return { success: false, error: 'Failed to authenticate with Google' };
  }
};

export const loginWithGitHub = async () => {
  try {
    const redirectUrl = Linking.createURL('auth/callback');
    const authUrl = `${BACKEND_URL}/auth/github?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
    
    if (result.type === 'success' && result.url) {
      const url = Linking.parse(result.url);
      const token = url.queryParams?.token;
      
      if (token) {
        return { success: true, token };
      }
    }
    
    return { success: false, error: 'Authentication cancelled or failed' };
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return { success: false, error: 'Failed to authenticate with GitHub' };
  }
};
