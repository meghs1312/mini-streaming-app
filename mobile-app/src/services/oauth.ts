import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { saveToken } from './storage';
import { API_URL } from '../config';

WebBrowser.maybeCompleteAuthSession();

// Deep link scheme - must match app.json scheme (e.g. "ministream")
const APP_SCHEME = 'ministream';

function getAppCallbackUrl(): string {
  return Linking.createURL('auth/callback', { scheme: APP_SCHEME });
}

function parseTokenFromUrl(url: string): string | null {
  const parsed = Linking.parse(url);
  const params = parsed.queryParams as Record<string, string> | undefined;
  return params?.token ?? null;
}

export async function loginWithGoogle(): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const redirectUrl = getAppCallbackUrl();
    const authUrl = `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUrl)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type === 'success' && result.url) {
      const token = parseTokenFromUrl(result.url);
      if (token) {
        await saveToken(token);
        return { success: true, token };
      }
      return { success: false, error: 'No token in response' };
    }

    return { success: false, error: 'Authentication cancelled or failed' };
  } catch (err) {
    console.error('Google OAuth error:', err);
    return { success: false, error: 'Failed to authenticate with Google' };
  }
}

export async function loginWithGitHub(): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const redirectUrl = getAppCallbackUrl();
    const authUrl = `${API_URL}/auth/github?redirect_uri=${encodeURIComponent(redirectUrl)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type === 'success' && result.url) {
      const token = parseTokenFromUrl(result.url);
      if (token) {
        await saveToken(token);
        return { success: true, token };
      }
      return { success: false, error: 'No token in response' };
    }

    return { success: false, error: 'Authentication cancelled or failed' };
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    return { success: false, error: 'Failed to authenticate with GitHub' };
  }
}
