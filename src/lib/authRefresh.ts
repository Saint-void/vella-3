import { AuthSession, clearAuthSession, getRefreshToken, saveAuthSession } from "./authSession";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type SupabaseRefreshResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: { id: string; email: string | null } | null;
};

// Supabase rotates the refresh_token on every use. If two components
// both notice an expiring token at once and both fire a refresh, the
// second call races against a refresh_token the first call already
// burned. Cache the in-flight promise so concurrent callers share one
// network call instead of stepping on each other.
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    clearAuthSession();
    return null;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearAuthSession();
      return null;
    }

    const data: SupabaseRefreshResponse = await response.json();

    saveAuthSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      message: null,
    });

    return data.access_token;
  } catch {
    // Transient network blip mid-refresh -- fail this attempt, don't
    // nuke a session that might still be fine.
    return null;
  }
}

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}