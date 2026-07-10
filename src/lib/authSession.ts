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

export function saveAuthSession(session: AuthSession) {
  if (!session.access_token) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);

  if (session.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
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

export function getAuthEmail() {
  return localStorage.getItem(USER_EMAIL_KEY) ?? undefined;
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}
