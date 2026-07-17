import { composite, ensureContrast, isChromatic, luminance, parseColor, readableText, toCssColor, type RgbColor } from './color';
import { DEFAULT_VELLA_THEME, type Theme, type ThemeCssVariables } from './types';

const COLOR_VARIABLES = {
  background: ['--background', '--bg', '--page-background', '--color-background'],
  surface: ['--surface', '--card', '--card-background', '--color-surface'],
  text: ['--foreground', '--text', '--text-color', '--color-text'],
  secondaryText: ['--secondary-text', '--text-secondary', '--muted-foreground', '--muted'],
  accent: ['--primary', '--primary-color', '--accent', '--accent-color', '--brand', '--brand-color'],
} as const;

const TOKEN_VARIABLES = {
  fontFamily: ['--font-family', '--font-sans', '--font-body'],
  radius: ['--radius', '--border-radius', '--button-radius'],
} as const;

const SAMPLE_SELECTOR = 'html, body, header, nav, main, footer, button, a, input, [role="button"], [class*="card" i], [class*="panel" i], [class*="cta" i]';
const MAX_SAMPLES = 56;

type ColorCandidate = { color: RgbColor; weight: number };
type StyleSample = { element: Element; style: CSSStyleDeclaration };

function mode<T>(items: readonly T[], fallback: T): T {
  if (!items.length) return fallback;
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
}

function strongestColor(candidates: readonly ColorCandidate[], fallback: RgbColor): RgbColor {
  const bins = new Map<string, { color: RgbColor; weight: number }>();
  for (const candidate of candidates) {
    if (candidate.color.a < 0.08) continue;
    const visible = candidate.color.a < 1 ? composite(candidate.color, fallback) : candidate.color;
    const key = `${Math.round(visible.r / 12)}:${Math.round(visible.g / 12)}:${Math.round(visible.b / 12)}`;
    const existing = bins.get(key);
    bins.set(key, { color: visible, weight: (existing?.weight ?? 0) + candidate.weight });
  }
  return [...bins.values()].sort((a, b) => b.weight - a.weight)[0]?.color ?? fallback;
}

function validRadius(radius: string): boolean {
  return /^\d+(?:\.\d+)?px$/.test(radius) && Number.parseFloat(radius) >= 0;
}

/**
 * Extracts a small, normalized token set from a host document. It reads CSS variables
 * before sampling computed styles, scans at most 56 meaningful elements, and caches the
 * result until a theme-relevant mutation occurs.
 */
export class ThemeEngine {
  private cachedTheme: Theme | null = null;
  private observer: MutationObserver | null = null;
  private timer: number | null = null;
  private mediaListener: (() => void) | null = null;
  private readonly mediaQuery: MediaQueryList | null;

  constructor(private readonly document: Document = window.document) {
    this.mediaQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  }

  detectTheme(force = false): Theme {
    if (this.cachedTheme && !force) return this.cachedTheme;
    const samples = this.collectSamples();
    const dark = this.detectDarkMode(samples);
    const fallback = dark ? DEFAULT_VELLA_THEME : {
      ...DEFAULT_VELLA_THEME,
      background: '#ffffff', surface: '#ffffff', text: '#171717', secondaryText: '#666666', accentText: '#ffffff', shadow: '0 14px 38px rgba(0, 0, 0, 0.16)', dark: false,
    };
    const background = this.detectColor('background', samples, parseColor(fallback.background));
    const surface = this.detectColor('surface', samples, background);
    const text = this.detectColor('text', samples, parseColor(fallback.text));
    const secondaryText = this.detectColor('secondaryText', samples, parseColor(fallback.secondaryText));
    const accent = this.detectAccent(samples, background);
    const safeText = ensureContrast(text, surface);
    const safeSecondary = ensureContrast(secondaryText, surface, 3);
    const safeAccent = ensureContrast(accent, surface, 3);

    const typography = this.detectTypography(samples);
    this.cachedTheme = {
      background: toCssColor(background),
      surface: toCssColor(surface),
      text: toCssColor(safeText),
      secondaryText: toCssColor(safeSecondary),
      accent: toCssColor(safeAccent),
      accentText: toCssColor(readableText(safeAccent)),
      ...typography,
      radius: this.detectRadius(samples),
      shadow: this.detectShadow(samples),
      spacing: this.detectSpacing(samples),
      dark,
    };
    return this.cachedTheme;
  }

  detectAccent(samples = this.collectSamples(), background = parseColor(DEFAULT_VELLA_THEME.background)!): RgbColor {
    const fromVariable = this.readColorVariable(COLOR_VARIABLES.accent);
    if (fromVariable && isChromatic(fromVariable)) return fromVariable;
    const accents: ColorCandidate[] = [];
    for (const { element, style } of samples) {
      const tag = element.tagName.toLowerCase();
      const className = typeof element.className === 'string' ? element.className.toLowerCase() : '';
      const isAction = tag === 'button' || tag === 'a' || element.getAttribute('role') === 'button' || /cta|primary|active|selected/.test(className);
      if (!isAction) continue;
      const weight = tag === 'button' || /cta|primary/.test(className) ? 3 : 1;
      for (const value of [style.backgroundColor, style.color, style.borderTopColor]) {
        const color = parseColor(value);
        if (color && isChromatic(color)) accents.push({ color, weight });
      }
    }
    return strongestColor(accents, parseColor(DEFAULT_VELLA_THEME.accent) ?? background);
  }

  detectTypography(samples = this.collectSamples()): Pick<Theme, 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight'> {
    const root = this.document.documentElement;
    const style = this.document.defaultView?.getComputedStyle(root);
    const fontFamily = this.readTokenVariable(TOKEN_VARIABLES.fontFamily) || style?.fontFamily || samples[0]?.style.fontFamily || DEFAULT_VELLA_THEME.fontFamily;
    return {
      fontFamily,
      fontSize: style?.fontSize || samples[0]?.style.fontSize || DEFAULT_VELLA_THEME.fontSize,
      fontWeight: style?.fontWeight || samples[0]?.style.fontWeight || DEFAULT_VELLA_THEME.fontWeight,
      lineHeight: style?.lineHeight === 'normal' || !style?.lineHeight ? DEFAULT_VELLA_THEME.lineHeight : style.lineHeight,
    };
  }

  detectRadius(samples = this.collectSamples()): string {
    const fromVariable = this.readTokenVariable(TOKEN_VARIABLES.radius);
    if (fromVariable && validRadius(fromVariable)) return fromVariable;
    const radii = samples
      .filter(({ element }) => /button|input/i.test(element.tagName) || /card|panel/i.test(typeof element.className === 'string' ? element.className : ''))
      .map(({ style }) => style.borderTopLeftRadius)
      .filter(validRadius)
      .filter((radius) => Number.parseFloat(radius) <= 40);
    return mode(radii, DEFAULT_VELLA_THEME.radius);
  }

  detectDarkMode(samples = this.collectSamples()): boolean {
    const root = this.document.documentElement;
    const themeHint = `${root.className} ${this.document.body?.className ?? ''} ${root.getAttribute('data-theme') ?? ''} ${this.document.body?.getAttribute('data-theme') ?? ''}`.toLowerCase();
    if (/\bdark\b|night/.test(themeHint)) return true;
    if (/\blight\b/.test(themeHint)) return false;
    const pageColor = this.readColorVariable(COLOR_VARIABLES.background) ?? parseColor(samples.find(({ element }) => element === this.document.body)?.style.backgroundColor) ?? parseColor(samples[0]?.style.backgroundColor);
    if (pageColor) return luminance(pageColor) < 0.22;
    return this.mediaQuery?.matches ?? DEFAULT_VELLA_THEME.dark;
  }

  applyTheme(target: HTMLElement = this.document.documentElement, theme = this.detectTheme()): ThemeCssVariables {
    const variables = createAdaptiveCssVariables(theme);
    for (const [name, value] of Object.entries(variables)) target.style.setProperty(name, value);
    return variables;
  }

  watchForChanges(onChange: (theme: Theme) => void): () => void {
    this.stopWatching();
    const schedule = () => {
      if (this.timer !== null) window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => { this.cachedTheme = null; onChange(this.detectTheme()); }, 120);
    };
    this.observer = new MutationObserver(schedule);
    const options = { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] };
    this.observer.observe(this.document.documentElement, options);
    if (this.document.body) this.observer.observe(this.document.body, options);
    this.mediaListener = schedule;
    this.mediaQuery?.addEventListener('change', schedule);
    return () => this.stopWatching();
  }

  stopWatching(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    if (this.mediaListener) this.mediaQuery?.removeEventListener('change', this.mediaListener);
    this.mediaListener = null;
  }

  private collectSamples(): StyleSample[] {
    const elements = [...this.document.querySelectorAll(SAMPLE_SELECTOR)].slice(0, MAX_SAMPLES);
    const view = this.document.defaultView;
    return view ? elements.map((element) => ({ element, style: view.getComputedStyle(element) })) : [];
  }

  private detectColor(kind: keyof typeof COLOR_VARIABLES, samples: StyleSample[], fallback: RgbColor): RgbColor {
    const fromVariable = this.readColorVariable(COLOR_VARIABLES[kind]);
    if (fromVariable) return fromVariable;
    const candidates: ColorCandidate[] = [];
    for (const { element, style } of samples) {
      const tag = element.tagName.toLowerCase();
      const className = typeof element.className === 'string' ? element.className.toLowerCase() : '';
      if (kind === 'background') {
        const weight = tag === 'body' || tag === 'html' ? 8 : tag === 'main' ? 4 : 1;
        const color = parseColor(style.backgroundColor);
        if (color) candidates.push({ color, weight });
      } else if (kind === 'surface') {
        const color = parseColor(style.backgroundColor);
        if (color && (tag === 'button' || /card|panel|modal|dialog/.test(className))) candidates.push({ color, weight: 2 });
      } else {
        const color = parseColor(style.color);
        if (color) candidates.push({ color, weight: tag === 'body' || tag === 'html' ? 4 : 1 });
      }
    }
    return strongestColor(candidates, fallback);
  }

  private detectShadow(samples: StyleSample[]): string {
    const shadows = samples.map(({ style }) => style.boxShadow).filter((shadow) => shadow && shadow !== 'none');
    return mode(shadows, DEFAULT_VELLA_THEME.shadow);
  }

  private detectSpacing(samples: StyleSample[]): string {
    const values = samples.flatMap(({ style }) => [style.paddingTop, style.marginTop]).map(Number.parseFloat).filter((value) => value > 0 && value <= 32);
    const common = mode(values.map((value) => `${value}px`), DEFAULT_VELLA_THEME.spacing);
    return common;
  }

  private readColorVariable(names: readonly string[]): RgbColor | null {
    const style = this.document.defaultView?.getComputedStyle(this.document.documentElement);
    if (!style) return null;
    for (const name of names) {
      const parsed = parseColor(style.getPropertyValue(name));
      if (parsed) return parsed;
    }
    return null;
  }

  private readTokenVariable(names: readonly string[]): string | null {
    const style = this.document.defaultView?.getComputedStyle(this.document.documentElement);
    if (!style) return null;
    for (const name of names) {
      const value = style.getPropertyValue(name).trim();
      if (value) return value;
    }
    return null;
  }
}

/** Converts normalized tokens to the only CSS variables the isolated widget consumes. */
export function createAdaptiveCssVariables(theme: Theme): ThemeCssVariables {
  return {
    '--vella-background': theme.background,
    '--vella-surface': theme.surface,
    '--vella-text': theme.text,
    '--vella-secondary-text': theme.secondaryText,
    '--vella-accent': theme.accent,
    '--vella-accent-text': theme.accentText,
    '--vella-font-family': theme.fontFamily,
    '--vella-font-size': theme.fontSize,
    '--vella-font-weight': theme.fontWeight,
    '--vella-line-height': theme.lineHeight,
    '--vella-radius': theme.radius,
    '--vella-shadow': theme.shadow,
    '--vella-spacing': theme.spacing,
    '--vella-dark': theme.dark ? '1' : '0',
  };
}
