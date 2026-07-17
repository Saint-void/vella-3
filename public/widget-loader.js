/* Vella's host-side embed runtime. It intentionally has no dependencies. */
(function () {
  const DEFAULT_CLOSED_SIZE = 64;
  const DEFAULT_OPEN_SIZE = { width: 420, height: 640 };
  const MARGIN = 24;
  const MAX_SAMPLES = 56;
  const DEFAULT_THEME = {
    background: 'rgb(10, 10, 10)', surface: 'rgb(18, 18, 18)', text: 'rgb(255, 255, 255)',
    secondaryText: 'rgb(163, 163, 163)', accent: 'rgb(109, 93, 252)', accentText: 'rgb(255, 255, 255)',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: '14px', fontWeight: '400',
    lineHeight: '1.5', radius: '18px', shadow: '0 18px 50px rgba(0, 0, 0, 0.28)', spacing: '8px', dark: true,
  };
  const COLOR_VARIABLES = {
    background: ['--background', '--bg', '--page-background', '--color-background'],
    surface: ['--surface', '--card', '--card-background', '--color-surface'],
    text: ['--foreground', '--text', '--text-color', '--color-text'],
    secondaryText: ['--secondary-text', '--text-secondary', '--muted-foreground', '--muted'],
    accent: ['--primary', '--primary-color', '--accent', '--accent-color', '--brand', '--brand-color'],
  };
  const SAMPLE_SELECTOR = 'html, body, header, nav, main, footer, button, a, input, [role="button"], [class*="card" i], [class*="panel" i], [class*="cta" i]';

  window.__vellaMountedChatbots = window.__vellaMountedChatbots || new Set();

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function getBaseUrl(script) { try { return new URL(script.src).origin; } catch { return window.location.origin; } }
  function parseColor(value) {
    if (!value) return null;
    const color = String(value).trim().toLowerCase();
    if (!color || color === 'transparent' || color === 'currentcolor' || color === 'inherit') return null;
    const hex = color.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i)?.[1];
    if (hex) {
      const expanded = hex.length <= 4 ? [...hex].map((part) => part + part).join('') : hex;
      return { r: parseInt(expanded.slice(0, 2), 16), g: parseInt(expanded.slice(2, 4), 16), b: parseInt(expanded.slice(4, 6), 16), a: expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1 };
    }
    const match = color.match(/^rgba?\(\s*([\d.]+)[,\s]+\s*([\d.]+)[,\s]+\s*([\d.]+)(?:\s*[,/]\s*([\d.]+)\s*(%)?)?\s*\)$/);
    if (!match) return null;
    const alpha = match[4] === undefined ? 1 : Number(match[4]) / (match[5] ? 100 : 1);
    return { r: clamp(Number(match[1]), 0, 255), g: clamp(Number(match[2]), 0, 255), b: clamp(Number(match[3]), 0, 255), a: clamp(alpha, 0, 1) };
  }
  function cssColor(color) { return color.a < 1 ? `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${Math.round(color.a * 1000) / 1000})` : `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`; }
  function luminance(color) {
    const channel = (value) => { const normalized = value / 255; return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4; };
    return .2126 * channel(color.r) + .7152 * channel(color.g) + .0722 * channel(color.b);
  }
  function contrast(first, second) { const values = [luminance(first), luminance(second)].sort((a, b) => b - a); return (values[0] + .05) / (values[1] + .05); }
  function readableText(background) { const white = { r: 255, g: 255, b: 255, a: 1 }, black = { r: 10, g: 10, b: 10, a: 1 }; return contrast(white, background) >= contrast(black, background) ? white : black; }
  function ensureContrast(foreground, background, minimum) {
    if (contrast(foreground, background) >= (minimum || 4.5)) return foreground;
    const target = readableText(background);
    for (let weight = .08; weight <= 1; weight += .08) {
      const adjusted = { r: foreground.r + (target.r - foreground.r) * weight, g: foreground.g + (target.g - foreground.g) * weight, b: foreground.b + (target.b - foreground.b) * weight, a: 1 };
      if (contrast(adjusted, background) >= (minimum || 4.5)) return adjusted;
    }
    return target;
  }
  function chromatic(color) { return Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b) > 22; }
  function mostCommon(values, fallback) {
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
  }
  function dominant(candidates, fallback) {
    const bins = new Map();
    candidates.forEach(({ color, weight }) => {
      if (!color || color.a < .08) return;
      const key = `${Math.round(color.r / 12)}:${Math.round(color.g / 12)}:${Math.round(color.b / 12)}`;
      const item = bins.get(key) || { color, weight: 0 };
      item.weight += weight;
      bins.set(key, item);
    });
    return [...bins.values()].sort((a, b) => b.weight - a.weight)[0]?.color || fallback;
  }

  /** Reads CSS variables first, then uses a bounded computed-style sample as a fallback. */
  class ThemeEngine {
    constructor(doc) { this.document = doc; this.cachedTheme = null; this.observer = null; this.timer = null; this.media = window.matchMedia?.('(prefers-color-scheme: dark)') || null; }
    samples() { return [...this.document.querySelectorAll(SAMPLE_SELECTOR)].slice(0, MAX_SAMPLES).map((element) => ({ element, style: getComputedStyle(element) })); }
    variable(names) {
      const style = getComputedStyle(this.document.documentElement);
      for (const name of names) {
        const raw = style.getPropertyValue(name).trim();
        const parsed = parseColor(raw);
        if (parsed) return parsed;
        // Custom properties often use hsl()/oklch(). Let the browser normalize those once.
        if (raw) {
          const probe = this.document.createElement('i');
          probe.style.position = 'absolute';
          probe.style.visibility = 'hidden';
          probe.style.color = raw;
          this.document.body.appendChild(probe);
          const resolved = parseColor(getComputedStyle(probe).color);
          probe.remove();
          if (resolved) return resolved;
        }
      }
      return null;
    }
    token(names) { const style = getComputedStyle(this.document.documentElement); for (const name of names) { const value = style.getPropertyValue(name).trim(); if (value) return value; } return null; }
    dark(samples) {
      const root = this.document.documentElement;
      const hint = `${root.className} ${this.document.body?.className || ''} ${root.getAttribute('data-theme') || ''} ${this.document.body?.getAttribute('data-theme') || ''}`.toLowerCase();
      if (/\bdark\b|night/.test(hint)) return true;
      if (/\blight\b/.test(hint)) return false;
      const page = this.variable(COLOR_VARIABLES.background) || parseColor(samples.find(({ element }) => element === this.document.body)?.style.backgroundColor) || parseColor(samples[0]?.style.backgroundColor);
      return page ? luminance(page) < .22 : (this.media?.matches || false);
    }
    color(kind, samples, fallback) {
      const token = this.variable(COLOR_VARIABLES[kind]);
      if (token) return token;
      const candidates = [];
      samples.forEach(({ element, style }) => {
        const tag = element.tagName.toLowerCase(), className = typeof element.className === 'string' ? element.className.toLowerCase() : '';
        if (kind === 'background') { const color = parseColor(style.backgroundColor); if (color) candidates.push({ color, weight: tag === 'body' || tag === 'html' ? 8 : tag === 'main' ? 4 : 1 }); }
        else if (kind === 'surface') { const color = parseColor(style.backgroundColor); if (color && (tag === 'button' || /card|panel|modal|dialog/.test(className))) candidates.push({ color, weight: 2 }); }
        else { const color = parseColor(style.color); if (color) candidates.push({ color, weight: tag === 'body' || tag === 'html' ? 4 : 1 }); }
      });
      return dominant(candidates, fallback);
    }
    accent(samples, background) {
      const token = this.variable(COLOR_VARIABLES.accent);
      if (token && chromatic(token)) return token;
      const candidates = [];
      samples.forEach(({ element, style }) => {
        const tag = element.tagName.toLowerCase(), className = typeof element.className === 'string' ? element.className.toLowerCase() : '';
        const action = tag === 'button' || tag === 'a' || element.getAttribute('role') === 'button' || /cta|primary|active|selected/.test(className);
        if (!action) return;
        const weight = tag === 'button' || /cta|primary/.test(className) ? 3 : 1;
        [style.backgroundColor, style.color, style.borderTopColor].forEach((value) => { const color = parseColor(value); if (color && chromatic(color)) candidates.push({ color, weight }); });
      });
      return dominant(candidates, parseColor(DEFAULT_THEME.accent) || background);
    }
    detectTheme(force) {
      if (this.cachedTheme && !force) return this.cachedTheme;
      const samples = this.samples(), dark = this.dark(samples);
      const fallback = dark ? DEFAULT_THEME : { ...DEFAULT_THEME, background: 'rgb(255, 255, 255)', surface: 'rgb(255, 255, 255)', text: 'rgb(23, 23, 23)', secondaryText: 'rgb(82, 82, 82)', shadow: '0 14px 38px rgba(0, 0, 0, .16)', dark: false };
      const background = this.color('background', samples, parseColor(fallback.background));
      const surface = this.color('surface', samples, background);
      const text = ensureContrast(this.color('text', samples, parseColor(fallback.text)), surface, 4.5);
      const secondaryText = ensureContrast(this.color('secondaryText', samples, parseColor(fallback.secondaryText)), surface, 3);
      const accent = ensureContrast(this.accent(samples, background), surface, 3);
      const root = getComputedStyle(this.document.documentElement);
      const radii = samples.filter(({ element }) => /button|input/i.test(element.tagName) || /card|panel/i.test(typeof element.className === 'string' ? element.className : '')).map(({ style }) => style.borderTopLeftRadius).filter((value) => /^\d+(\.\d+)?px$/.test(value) && parseFloat(value) <= 40);
      const shadows = samples.map(({ style }) => style.boxShadow).filter((value) => value && value !== 'none');
      const spaces = samples.flatMap(({ style }) => [style.paddingTop, style.marginTop]).map(parseFloat).filter((value) => value > 0 && value <= 32).map((value) => `${value}px`);
      this.cachedTheme = { background: cssColor(background), surface: cssColor(surface), text: cssColor(text), secondaryText: cssColor(secondaryText), accent: cssColor(accent), accentText: cssColor(readableText(accent)), fontFamily: this.token(['--font-family', '--font-sans', '--font-body']) || root.fontFamily || DEFAULT_THEME.fontFamily, fontSize: root.fontSize || DEFAULT_THEME.fontSize, fontWeight: root.fontWeight || DEFAULT_THEME.fontWeight, lineHeight: root.lineHeight === 'normal' ? DEFAULT_THEME.lineHeight : root.lineHeight || DEFAULT_THEME.lineHeight, radius: this.token(['--radius', '--border-radius', '--button-radius']) || mostCommon(radii, DEFAULT_THEME.radius), shadow: mostCommon(shadows, DEFAULT_THEME.shadow), spacing: mostCommon(spaces, DEFAULT_THEME.spacing), dark };
      return this.cachedTheme;
    }
    watch(onChange) {
      const schedule = () => { clearTimeout(this.timer); this.timer = setTimeout(() => { this.cachedTheme = null; onChange(this.detectTheme()); }, 120); };
      this.observer = new MutationObserver(schedule);
      const options = { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] };
      this.observer.observe(this.document.documentElement, options);
      if (this.document.body) this.observer.observe(this.document.body, options);
      this.media?.addEventListener('change', schedule);
      return () => { this.observer?.disconnect(); this.media?.removeEventListener('change', schedule); clearTimeout(this.timer); };
    }
  }

  function applySize(host, size, state) {
    const maxWidth = Math.max(DEFAULT_CLOSED_SIZE, window.innerWidth - MARGIN * 2);
    const maxHeight = Math.max(DEFAULT_CLOSED_SIZE, window.innerHeight - MARGIN * 2);
    state.width = clamp(size.width, DEFAULT_CLOSED_SIZE, Math.min(DEFAULT_OPEN_SIZE.width, maxWidth));
    state.height = clamp(size.height, DEFAULT_CLOSED_SIZE, Math.min(DEFAULT_OPEN_SIZE.height, maxHeight));
    host.style.width = `${state.width}px`;
    host.style.height = `${state.height}px`;
    host.style.borderRadius = state.width <= DEFAULT_CLOSED_SIZE && state.height <= DEFAULT_CLOSED_SIZE ? '999px' : '28px';
  }

  function mount(script) {
    const chatbotId = script?.dataset.vellaChatbotId;
    if (!chatbotId || window.__vellaMountedChatbots.has(chatbotId)) return;
    window.__vellaMountedChatbots.add(chatbotId);
    script.dataset.vellaMounted = 'true';

    const siteOrigin = script.dataset.vellaSiteOrigin || window.location.origin;
    const baseUrl = script.dataset.vellaBaseUrl || getBaseUrl(script);
    const widgetOrigin = new URL(baseUrl, window.location.href).origin;
    const engine = new ThemeEngine(document);
    let theme = engine.detectTheme();
    const host = document.createElement('div');
    host.id = `vella-widget-${chatbotId}`;
    host.style.cssText = `position:fixed;right:${MARGIN}px;bottom:${MARGIN}px;width:${DEFAULT_CLOSED_SIZE}px;height:${DEFAULT_CLOSED_SIZE}px;z-index:2147483647;max-width:clamp(${DEFAULT_CLOSED_SIZE}px,calc(100vw - ${MARGIN * 2}px),${DEFAULT_OPEN_SIZE.width}px);max-height:clamp(${DEFAULT_CLOSED_SIZE}px,calc(100vh - ${MARGIN * 2}px),${DEFAULT_OPEN_SIZE.height}px);transition:width 180ms ease,height 180ms ease,border-radius 180ms ease;overflow:hidden;`;
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>:host{all:initial}iframe{display:block;width:100%;height:100%;border:0;background:transparent;overflow:hidden}</style>';
    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/widget/${encodeURIComponent(chatbotId)}?site_origin=${encodeURIComponent(siteOrigin)}`;
    iframe.title = 'Vella chatbot widget';
    iframe.allow = 'clipboard-read; clipboard-write';
    iframe.loading = 'eager';
    iframe.setAttribute('aria-label', 'Vella chatbot widget');
    shadow.appendChild(iframe);
    const state = { width: DEFAULT_CLOSED_SIZE, height: DEFAULT_CLOSED_SIZE };
    const sendTheme = () => iframe.contentWindow?.postMessage({ type: 'vella-widget-theme', chatbotId, theme }, widgetOrigin);

    const onMessage = (event) => {
      const data = event.data;
      if (event.source !== iframe.contentWindow || !data || data.chatbotId !== chatbotId) return;
      if (data.type === 'vella-widget-theme-ready') sendTheme();
      if (data.type === 'vella-widget-resize') applySize(host, { width: typeof data.width === 'number' ? data.width : DEFAULT_CLOSED_SIZE, height: typeof data.height === 'number' ? data.height : DEFAULT_CLOSED_SIZE }, state);
    };
    window.addEventListener('message', onMessage);
    window.addEventListener('resize', () => applySize(host, state, state));
    iframe.addEventListener('load', sendTheme);
    engine.watch((nextTheme) => { theme = nextTheme; sendTheme(); });
    document.body.appendChild(host);
    applySize(host, state, state);
  }

  function init() { document.querySelectorAll('script[data-vella-chatbot-id]').forEach(mount); }
  window.VellaWidget = { init, ThemeEngine };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init, { once: true }) : init();
})();
