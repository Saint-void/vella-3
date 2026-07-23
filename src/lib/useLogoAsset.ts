import { useEffect, useState } from 'react';
import { API_BASE_URL, API_HEADERS } from './api';

function isApiUrl(source: string): boolean {
  try {
    // Check if it's an absolute URL pointing to an API endpoint
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return source.includes('/api/');
    }
    // Check if it's a relative API path
    return source.startsWith('/api/');
  } catch {
    return false;
  }
}

/**
 * Load logo images from API endpoints as blob URLs. Handles both relative and
 * absolute API URLs by fetching them with proper headers and creating blob URLs.
 * Non-API URLs (external, data) are used directly without fetching.
 */
export function useLogoAsset(source: string | null | undefined): string | null {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setAssetUrl(null);
      return;
    }

    // For non-API URLs (external URLs, data URLs), use directly
    if (!isApiUrl(source)) {
      setAssetUrl(source);
      return;
    }

    let isCurrent = true;
    let objectUrl: string | null = null;
    setAssetUrl(null);

    void (async () => {
      try {
        // For API URLs, always fetch with proper headers to create blob URL
        const fetchUrl = source.startsWith('http') ? source : `${API_BASE_URL}${source}`;
        console.log(`📥 Fetching logo from ${fetchUrl} with headers:`, API_HEADERS);
        
        const response = await fetch(fetchUrl, { headers: API_HEADERS });
        const contentType = response.headers.get('content-type') ?? '';
        
        console.log(`📊 Logo response: ${response.status} ${contentType}`);
        
        if (!response.ok || !contentType.startsWith('image/')) {
          console.warn(`Logo fetch failed: ${response.status} ${contentType}`);
          throw new Error(`Logo endpoint did not return an image. Got ${contentType} instead.`);
        }
        objectUrl = URL.createObjectURL(await response.blob());
        if (isCurrent) setAssetUrl(objectUrl);
      } catch (err) {
        console.warn('Logo loading error:', err);
        if (isCurrent) setAssetUrl(null);
      }
    })();

    return () => {
      isCurrent = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  return assetUrl;
}
