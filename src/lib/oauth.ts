import { publicApiRequest } from "./api";

export type OAuthProvider = "google" | "github";

type OAuthAuthorizeUrl = {
  url: string;
};

export async function startOAuth(provider: OAuthProvider) {
  const redirectTo = `${window.location.origin}/auth/callback`;
  const params = new URLSearchParams({ redirect_to: redirectTo });
  const { url } = await publicApiRequest<OAuthAuthorizeUrl>(
    `/api/v1/auth/oauth/${provider}/authorize-url?${params.toString()}`,
  );

  window.location.href = url;
}
