export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthSession = {
  access_token: string | null;
  refresh_token: string | null;
  token_type: string | null;
  expires_in: number | null;
  user: AuthUser | null;
  message: string | null;
};

const ACCESS_TOKEN_KEY = "vella_access_token";
const REFRESH_TOKEN_KEY = "vella_refresh_token";
const USER_EMAIL_KEY = "vella_user_email";
const EXPIRES_AT_KEY = "vella_expires_at"; // epoch ms

// Refresh this many seconds early so a request that starts right
// before the deadline doesn't lose the race against actual expiry.
const EXPIRY_BUFFER_SECONDS = 60;

export function saveAuthSession(session: AuthSession) {
  if (!session.access_token) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);

  if (session.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  }

  if (session.expires_in) {
    localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + session.expires_in * 1000));
  } else {
    localStorage.removeItem(EXPIRES_AT_KEY);
  }

  if (session.user?.email) {
    localStorage.setItem(USER_EMAIL_KEY, session.user.email);
  } else {
    localStorage.removeItem(USER_EMAIL_KEY);
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAuthEmail() {
  return localStorage.getItem(USER_EMAIL_KEY) ?? undefined;
}

// No recorded expiry counts as "expiring" -- treat unknown as unsafe,
// not as trusted.
export function isAccessTokenExpiring(): boolean {
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) return true;
  return Date.now() >= Number(expiresAt) - EXPIRY_BUFFER_SECONDS * 1000;
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}