# Adaptive Vella theming

The Vella embed takes visual cues from its host without inheriting the host's CSS. The loader detects a small, normalized theme object before mounting the widget, then sends that object to the iframe. The iframe consumes only `--vella-*` variables, preserving Vella's layout, interaction patterns, and configured assistant identity.

## Embed integration

```html
<script
  async
  src="https://your-vella-origin/widget-loader.js"
  data-vella-chatbot-id="YOUR_CHATBOT_ID"
  data-vella-site-origin="https://example.com">
</script>
```

`data-vella-base-url` is optional when the loader and widget are served from different origins. The existing `window.VellaWidget.init()` API still mounts snippets added after page load.

## Detection algorithm

1. The loader reads common `:root` custom properties first: background, foreground/text, surface, primary/accent/brand, font, and radius aliases.
2. Missing values are inferred from a bounded sample (at most 56) of `html`, `body`, landmarks, actions, links, inputs, and card-like elements. Computed styles provide background/text colors, type, radii, shadows, and common spacing values.
3. Accent candidates from primary buttons, CTAs, active controls, and links are frequency-weighted. Achromatic candidates are ignored.
4. Dark mode uses explicit `.dark`, `data-theme`, or `prefers-color-scheme` signals, with page-background luminance as a reliable fallback.
5. Text and secondary text are corrected to WCAG AA contrast (4.5:1 and 3:1 respectively). Accent foregrounds are selected as black or white for maximum contrast.

Vella’s defaults are used for every missing or invalid token. The configured assistant/logo color remains its identity cue; host accent is used for adaptive widget controls and visitor messages.

## Isolation and performance

The loader mounts its iframe in a Shadow DOM wrapper; the iframe provides an additional document boundary. Host styles cannot alter widget layout, while the extracted tokens can. Widget dimensions are viewport-capped in JavaScript and with CSS `clamp()` to prevent overflow on mobile. The initial scan is cached. A debounced `MutationObserver` watches only `class`, `style`, and `data-theme` on `html` and `body`, plus `prefers-color-scheme`; no DOM-wide rescan occurs during ordinary page updates.

## Programmatic API

`ThemeEngine` is available in `src/lib/theme/ThemeEngine.ts` for hosts that package the widget themselves:

```ts
const engine = new ThemeEngine(document);
const theme = engine.detectTheme();
engine.applyTheme();
const stop = engine.watchForChanges((nextTheme) => {
  // Forward nextTheme to the isolated widget runtime.
});

// Call on unmount.
stop();
```

`createAdaptiveCssVariables(theme)` returns the complete `--vella-*` variable map for alternate renderers.
