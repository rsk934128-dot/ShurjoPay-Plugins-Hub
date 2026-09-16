// Google Workspace OAuth Token and Client Helper for Gmail & Drive in AI Studio
// Uses Google Identity Services (GSI) initTokenClient on the client side

export interface GoogleAuthStatus {
  isSignedIn: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  userEmail: string | null;
}

const STORAGE_KEY_TOKEN = 'shurjopay_google_workspace_token';
const STORAGE_KEY_EXPIRES = 'shurjopay_google_workspace_expires';
const STORAGE_KEY_EMAIL = 'shurjopay_google_workspace_email';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive.file'
];

let tokenClientInstance: any = null;

/**
 * Loads the Google Identity Services (GSI) script dynamically if not present.
 */
export async function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return;
  if ((window as any).google?.accounts?.oauth2) return;

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('gsi-client-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'gsi-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Gets currently cached token if still valid
 */
export function getSavedWorkspaceToken(): string | null {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expires = localStorage.getItem(STORAGE_KEY_EXPIRES);
    if (!token || !expires) return null;
    const expNum = parseInt(expires, 10);
    if (Date.now() > expNum - 60000) {
      // expired or expiring in 1 min
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function getSavedWorkspaceEmail(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_EMAIL);
  } catch {
    return null;
  }
}

export function saveWorkspaceToken(token: string, expiresInSeconds: number, email?: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_EXPIRES, (Date.now() + expiresInSeconds * 1000).toString());
    if (email) {
      localStorage.setItem(STORAGE_KEY_EMAIL, email);
    }
  } catch (e) {
    console.warn('Failed to cache workspace token:', e);
  }
}

export function clearWorkspaceSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EXPIRES);
    localStorage.removeItem(STORAGE_KEY_EMAIL);
  } catch (e) {
    console.warn('Failed to clear workspace session:', e);
  }
}

/**
 * Requests an OAuth access token using Google Identity Services token client
 */
export async function requestGoogleWorkspaceAccess(clientId?: string): Promise<string> {
  await loadGsiScript();

  return new Promise((resolve, reject) => {
    try {
      const googleObj = (window as any).google;
      if (!googleObj?.accounts?.oauth2) {
        throw new Error('Google Identity Services library failed to load.');
      }

      // Default OAuth Client ID if not passed
      // In Google AI Studio OAuth setup, this applet is registered
      const effectiveClientId = clientId || (window as any).__GOOGLE_CLIENT_ID__ || '32959905689-placeholder.apps.googleusercontent.com';

      tokenClientInstance = googleObj.accounts.oauth2.initTokenClient({
        client_id: effectiveClientId,
        scope: WORKSPACE_SCOPES.join(' '),
        prompt: '',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('Google OAuth error:', tokenResponse);
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          const accessToken = tokenResponse.access_token;
          const expiresIn = parseInt(tokenResponse.expires_in, 10) || 3599;

          // Try to fetch user info for identity display
          let userEmail = 'sheikhfaridvisa164@gmail.com';
          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userInfoRes.ok) {
              const data = await userInfoRes.json();
              if (data.email) userEmail = data.email;
            }
          } catch {
            // fallback to default
          }

          saveWorkspaceToken(accessToken, expiresIn, userEmail);
          resolve(accessToken);
        },
      });

      tokenClientInstance.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
}
