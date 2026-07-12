(function () {
  const DEFAULT_CLOSED_SIZE = 64;
  const DEFAULT_OPEN_SIZE = { width: 420, height: 640 };
  const MARGIN = 24;

  // Page-level guard, not script-node-level. Protects against
  // duplicate embed snippets AND against a script tag being removed
  // and re-inserted (e.g. a SPA layout component re-running its
  // effect on route change) -- either of those creates a fresh DOM
  // node with no memory of having mounted before, which the old
  // per-node dataset guard couldn't catch.
  window.__vellaMountedChatbots = window.__vellaMountedChatbots || new Set();

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getBaseUrl(script) {
    try {
      return new URL(script.src).origin;
    } catch {
      return window.location.origin;
    }
  }

  function applySize(iframe, size, state) {
    const maxWidth = Math.max(DEFAULT_CLOSED_SIZE, window.innerWidth - MARGIN * 2);
    const maxHeight = Math.max(DEFAULT_CLOSED_SIZE, window.innerHeight - MARGIN * 2);
    const width = clamp(size.width, DEFAULT_CLOSED_SIZE, Math.min(DEFAULT_OPEN_SIZE.width, maxWidth));
    const height = clamp(size.height, DEFAULT_CLOSED_SIZE, Math.min(DEFAULT_OPEN_SIZE.height, maxHeight));

    state.width = width;
    state.height = height;

    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.style.borderRadius = width <= DEFAULT_CLOSED_SIZE && height <= DEFAULT_CLOSED_SIZE ? '50px' : '50px';
  }

  function mount(script) {
    if (!script) {
      return;
    }

    const chatbotId = script.dataset.vellaChatbotId;
    if (!chatbotId) {
      return;
    }

    // Global check first -- this is what actually stops duplicates,
    // regardless of which script node is asking.
    if (window.__vellaMountedChatbots.has(chatbotId)) {
      return;
    }
    window.__vellaMountedChatbots.add(chatbotId);
    script.dataset.vellaMounted = 'true';

    const siteOrigin = script.dataset.vellaSiteOrigin || window.location.origin;
    const baseUrl = script.dataset.vellaBaseUrl || getBaseUrl(script);
    const iframe = document.createElement('iframe');
    const state = { width: DEFAULT_CLOSED_SIZE, height: DEFAULT_CLOSED_SIZE };

    iframe.src = `${baseUrl}/widget/${encodeURIComponent(chatbotId)}?site_origin=${encodeURIComponent(siteOrigin)}`;
    iframe.title = 'Vella chatbot widget';
    iframe.allow = 'clipboard-read; clipboard-write';
    iframe.loading = 'eager';
    iframe.setAttribute('aria-label', 'Vella chatbot widget');
    iframe.style.position = 'fixed';
    iframe.style.right = `${MARGIN}px`;
    iframe.style.bottom = `${MARGIN}px`;
    iframe.style.width = `${DEFAULT_CLOSED_SIZE}px`;
    iframe.style.height = `${DEFAULT_CLOSED_SIZE}px`;
    iframe.style.border = '0';
    iframe.style.background = 'transparent';
    iframe.style.overflow = 'hidden';
    iframe.style.zIndex = '2147483647';
    iframe.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
    iframe.style.transition = 'width 180ms ease, height 180ms ease, border-radius 180ms ease';

    function onMessage(event) {
      const data = event.data;
      if (!data || data.type !== 'vella-widget-resize' || data.chatbotId !== chatbotId) {
        return;
      }

      applySize(
        iframe,
        {
          width: typeof data.width === 'number' ? data.width : DEFAULT_CLOSED_SIZE,
          height: typeof data.height === 'number' ? data.height : DEFAULT_CLOSED_SIZE,
        },
        state,
      );
    }

    function onResize() {
      applySize(iframe, state, state);
    }

    window.addEventListener('message', onMessage);
    window.addEventListener('resize', onResize);
    document.body.appendChild(iframe);

    applySize(iframe, state, state);
  }

  function init() {
    const scripts = document.querySelectorAll('script[data-vella-chatbot-id]');
    scripts.forEach(mount);
  }

  window.VellaWidget = {
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(); 