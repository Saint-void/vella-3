(function () {
  const DEFAULT_CLOSED_SIZE = 64;
  const DEFAULT_OPEN_SIZE = { width: 420, height: 640 };
  const MARGIN = 24;

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

  // Font adaptation is deliberately the only host visual token we inherit.
  function detectFontFamily() {
    const rootStyle = window.getComputedStyle(document.documentElement);
    const cssVariable = rootStyle.getPropertyValue('--font-family').trim()
      || rootStyle.getPropertyValue('--font-sans').trim()
      || rootStyle.getPropertyValue('--font-body').trim();
    return cssVariable || rootStyle.fontFamily || window.getComputedStyle(document.body).fontFamily || '';
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
    iframe.style.borderRadius = width <= DEFAULT_CLOSED_SIZE && height <= DEFAULT_CLOSED_SIZE ? '999px' : '28px';
  }

  function mount(script) {
    if (!script) return;

    const chatbotId = script.dataset.vellaChatbotId;
    if (!chatbotId || window.__vellaMountedChatbots.has(chatbotId)) return;

    window.__vellaMountedChatbots.add(chatbotId);
    script.dataset.vellaMounted = 'true';

    const siteOrigin = script.dataset.vellaSiteOrigin || window.location.origin;
    const baseUrl = script.dataset.vellaBaseUrl || getBaseUrl(script);
    const widgetOrigin = new URL(baseUrl, window.location.href).origin;
    const iframe = document.createElement('iframe');
    const state = { width: DEFAULT_CLOSED_SIZE, height: DEFAULT_CLOSED_SIZE };
    const sendFont = () => {
      iframe.contentWindow?.postMessage(
        { type: 'vella-widget-font', chatbotId, fontFamily: detectFontFamily() },
        widgetOrigin,
      );
    };

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
    iframe.addEventListener('load', sendFont);

    function onMessage(event) {
      const data = event.data;
      if (event.source !== iframe.contentWindow || !data || data.chatbotId !== chatbotId) return;
      if (data.type === 'vella-widget-font-ready') sendFont();
      if (data.type !== 'vella-widget-resize') return;

      applySize(iframe, {
        width: typeof data.width === 'number' ? data.width : DEFAULT_CLOSED_SIZE,
        height: typeof data.height === 'number' ? data.height : DEFAULT_CLOSED_SIZE,
      }, state);
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
    document.querySelectorAll('script[data-vella-chatbot-id]').forEach(mount);
  }

  window.VellaWidget = { init };
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init();
})();
