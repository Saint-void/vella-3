export type WidgetTheme = 'light' | 'light-accent' | 'light-soft' | 'pattern-light' | 'pattern-accent' | 'dark';
export type WidgetFontSize = 'small' | 'medium' | 'large';
export type WidgetLauncherShape = 'round' | 'rounded' | 'square';
export type WidgetSize = 'small' | 'medium' | 'large';

export type WidgetSettings = {
  theme: WidgetTheme;
  accentColor: string;
  chatBodyBackground: string;
  fontFamily: string;
  fontSize: WidgetFontSize;
  windowRadius: number;
  launcherShape: WidgetLauncherShape;
  widgetSize: WidgetSize;
  launcherIcon: string;
};

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  theme: 'dark',
  accentColor: '#111111',
  chatBodyBackground: '',
  fontFamily: 'Inter, sans-serif',
  fontSize: 'medium',
  windowRadius: 18,
  launcherShape: 'round',
  widgetSize: 'medium',
  launcherIcon: '💬',
};

const themes = new Set<WidgetTheme>(['light', 'light-accent', 'light-soft', 'pattern-light', 'pattern-accent', 'dark']);
const fontSizes = new Set<WidgetFontSize>(['small', 'medium', 'large']);
const launcherShapes = new Set<WidgetLauncherShape>(['round', 'rounded', 'square']);
const widgetSizes = new Set<WidgetSize>(['small', 'medium', 'large']);

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value.trim());
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function normalizeWidgetSettings(value: unknown, brandColor = DEFAULT_WIDGET_SETTINGS.accentColor): WidgetSettings {
  const settings = value && typeof value === 'object' ? value as Partial<WidgetSettings> : {};
  const accentColor = isHexColor(settings.accentColor) ? settings.accentColor : isHexColor(brandColor) ? brandColor : DEFAULT_WIDGET_SETTINGS.accentColor;
  const windowRadius = typeof settings.windowRadius === 'number'
    ? Math.max(8, Math.min(32, Math.round(settings.windowRadius)))
    : DEFAULT_WIDGET_SETTINGS.windowRadius;

  return {
    theme: settings.theme && themes.has(settings.theme) ? settings.theme : DEFAULT_WIDGET_SETTINGS.theme,
    accentColor,
    chatBodyBackground: isHexColor(settings.chatBodyBackground) ? settings.chatBodyBackground : '',
    fontFamily: stringValue(settings.fontFamily, DEFAULT_WIDGET_SETTINGS.fontFamily),
    fontSize: settings.fontSize && fontSizes.has(settings.fontSize) ? settings.fontSize : DEFAULT_WIDGET_SETTINGS.fontSize,
    windowRadius,
    launcherShape: settings.launcherShape && launcherShapes.has(settings.launcherShape) ? settings.launcherShape : DEFAULT_WIDGET_SETTINGS.launcherShape,
    widgetSize: settings.widgetSize && widgetSizes.has(settings.widgetSize) ? settings.widgetSize : DEFAULT_WIDGET_SETTINGS.widgetSize,
    launcherIcon: stringValue(settings.launcherIcon, DEFAULT_WIDGET_SETTINGS.launcherIcon),
  };
}

export function themeBackground(theme: WidgetTheme, accentColor: string) {
  if (theme === 'light') return '#ffffff';
  if (theme === 'light-accent') return `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 12%, #ffffff) 0%, #ffffff 48%, #f7f7f7 100%)`;
  if (theme === 'light-soft') return '#f6f5f2';
  if (theme === 'pattern-light') {
    return `radial-gradient(circle at 12px 12px, rgba(0,0,0,0.06) 1.5px, transparent 1.5px), #ffffff`;
  }
  if (theme === 'pattern-accent') {
    return `radial-gradient(circle at 12px 12px, color-mix(in srgb, ${accentColor} 32%, transparent) 1.5px, transparent 1.5px), linear-gradient(180deg, color-mix(in srgb, ${accentColor} 14%, #ffffff) 0%, #ffffff 100%)`;
  }
  return `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 13%, #111111) 0%, #0b0b0b 52%, #090909 100%)`;
}

export function isDarkWidgetTheme(theme: WidgetTheme) {
  return theme === 'dark';
}

export function fontSizeClass(size: WidgetFontSize) {
  if (size === 'small') return 'text-[13px]';
  if (size === 'large') return 'text-[15px]';
  return 'text-sm';
}

export function launcherRadius(shape: WidgetLauncherShape) {
  if (shape === 'square') return '16px';
  if (shape === 'rounded') return '24px';
  return '999px';
}
