import { useEffect, useState } from 'react';
import { API_HEADERS } from './api';

function isNgrokUrl(source: string): boolean {
  try {
    return new URL(source, window.location.href).hostname.includes('ngrok');
  } catch {
    return false;
  }
}

/**
 * ngrok's interstitial is returned to normal image requests as HTML. Fetching
 * its image URLs with the same bypass header as the API client and rendering a
 * short-lived blob URL keeps uploaded logos working in an iframe as well.
 */
export function useLogoAsset(source: string | null | undefined): string | null {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setAssetUrl(null);
      return;
    }
    if (!isNgrokUrl(source)) {
      setAssetUrl(source);
      return;
    }

    let isCurrent = true;
    let objectUrl: string | null = null;
    setAssetUrl(null);

    void (async () => {
      try {
        const response = await fetch(source, {
          headers: { ...API_HEADERS, 'ngrok-skip-browser-warning': 'true' },
        });
        const contentType = response.headers.get('content-type') ?? '';
        if (!response.ok || !contentType.startsWith('image/')) {
          throw new Error('Logo endpoint did not return an image.');
        }
        objectUrl = URL.createObjectURL(await response.blob());
        if (isCurrent) setAssetUrl(objectUrl);
      } catch {
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
