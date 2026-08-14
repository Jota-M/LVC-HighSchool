// Persistencia de tokens para el SPA (complementa cookies httpOnly del API).

const ACCESS_KEY = 'lvc_access_token';
const REFRESH_KEY = 'lvc_refresh_token';

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  sessionStorage.setItem(REFRESH_KEY, refreshToken);
}

export function setAccessToken(accessToken: string) {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(ACCESS_KEY, accessToken);
}

export function getAccessToken(): string | null {
  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function clearAuthTokens() {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
