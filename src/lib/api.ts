import { getAccessToken, isAccessTokenExpiring } from "./authSession";
import { refreshAccessToken } from "./authRefresh";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

const shouldSkipNgrokBrowserWarning = (() => {
  try {
    return new URL(API_BASE_URL).hostname.includes("ngrok");
  } catch {
    return false;
  }
})();

export const API_HEADERS: Record<string, string> = shouldSkipNgrokBrowserWarning
  ? { "ngrok-skip-browser-warning": "true" }
  : {};

type ApiOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

function hasFormDataBody(body: BodyInit | null | undefined): boolean {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildHeaders(options: ApiOptions, accessToken?: string): Record<string, string> {
  return {
    ...(hasFormDataBody(options.body) ? {} : { "Content-Type": "application/json" }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...API_HEADERS,
    ...options.headers,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    let message = fallback;

    try {
      const body = await response.json();
      message = body.message ?? body.error ?? fallback;
    } catch {
      message = fallback;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function publicApiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  return parseResponse<T>(response);
}

// Callers hitting a protected endpoint should call this right before
// apiRequest instead of reading the stored token directly -- it
// refreshes first if the token is expired or about to be, so requests
// don't go out with a token that's already dead.
export async function getValidAccessToken(): Promise<string | null> {
  if (!isAccessTokenExpiring()) {
    return getAccessToken();
  }
  return refreshAccessToken();
}

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  options: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options, accessToken),
  });

  // Backstop for cases proactive refresh won't catch -- clock skew
  // between client and server, a session revoked server-side, or
  // another tab burning the refresh_token via rotation right before
  // this call landed. Retries once with a freshly refreshed token
  // before giving up.
  if (response.status === 401) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(options, refreshedToken),
      });
      return parseResponse<T>(retryResponse);
    }
  }

  return parseResponse<T>(response);
}
