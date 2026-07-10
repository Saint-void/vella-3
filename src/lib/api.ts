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

  return response.json() as Promise<T>;
}

export async function publicApiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...API_HEADERS,
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  options: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...API_HEADERS,
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}
