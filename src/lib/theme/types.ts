/** A normalized, safe-to-apply set of visual tokens from the embedding site. */
export interface Theme {
  background: string;
  surface: string;
  text: string;
  secondaryText: string;
  accent: string;
  accentText: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  radius: string;
  shadow: string;
  spacing: string;
  dark: boolean;
}

export type ThemeCssVariables = Record<`--vella-${string}`, string>;

export const DEFAULT_VELLA_THEME: Theme = {
  background: '#0a0a0a',
  surface: '#121212',
  text: '#ffffff',
  secondaryText: '#a3a3a3',
  accent: '#6d5dfc',
  accentText: '#ffffff',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '1.5',
  radius: '18px',
  shadow: '0 18px 50px rgba(0, 0, 0, 0.28)',
  spacing: '8px',
  dark: true,
};
