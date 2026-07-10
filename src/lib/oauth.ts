import { API_BASE_URL } from "./api";

export type OAuthProvider = "google" | "github";

export function startOAuth(provider: OAuthProvider) {
  const redirectTo = `${window.location.origin}/auth/callback`;
  const params = new URLSearchParams({ redirect_to: redirectTo });

  window.location.href = `${API_BASE_URL}/api/v1/auth/oauth/${provider}?${params.toString()}`;
}
