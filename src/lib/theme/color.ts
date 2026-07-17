export type RgbColor = Readonly<{ r: number; g: number; b: number; a: number }>;

const clamp = (value: number, min = 0, max = 255) => Math.min(max, Math.max(min, value));

/** Parses browser-normalized hex/rgb colors. Computed styles are intentionally used as input. */
export function parseColor(value: string | null | undefined): RgbColor | null {
  if (!value) return null;
  const color = value.trim().toLowerCase();
  if (!color || color === 'transparent' || color === 'currentcolor' || color === 'inherit') return null;

  const hex = color.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i)?.[1];
  if (hex) {
    const expanded = hex.length <= 4 ? [...hex].map((part) => part + part).join('') : hex;
    return {
      r: Number.parseInt(expanded.slice(0, 2), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      b: Number.parseInt(expanded.slice(4, 6), 16),
      a: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    };
  }

  const match = color.match(/^rgba?\(\s*([\d.]+)[,\s]+\s*([\d.]+)[,\s]+\s*([\d.]+)(?:\s*[,/]\s*([\d.]+)\s*(%)?)?\s*\)$/);
  if (!match) return null;
  const alpha = match[4] === undefined ? 1 : Number(match[4]) / (match[5] ? 100 : 1);
  return { r: clamp(Number(match[1])), g: clamp(Number(match[2])), b: clamp(Number(match[3])), a: clamp(alpha, 0, 1) };
}

export function toCssColor(color: RgbColor): string {
  return color.a < 1
    ? `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${Math.round(color.a * 1000) / 1000})`
    : `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
}

export function composite(foreground: RgbColor, background: RgbColor): RgbColor {
  const alpha = foreground.a + background.a * (1 - foreground.a);
  if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
    g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
    b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
    a: alpha,
  };
}

export function luminance(color: RgbColor): number {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

export function contrastRatio(first: RgbColor, second: RgbColor): number {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

export function mix(first: RgbColor, second: RgbColor, amount: number): RgbColor {
  const weight = Math.min(1, Math.max(0, amount));
  return {
    r: first.r + (second.r - first.r) * weight,
    g: first.g + (second.g - first.g) * weight,
    b: first.b + (second.b - first.b) * weight,
    a: first.a + (second.a - first.a) * weight,
  };
}

/** Selects a black/white foreground that meets AA where either option can. */
export function readableText(background: RgbColor): RgbColor {
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const black = { r: 10, g: 10, b: 10, a: 1 };
  return contrastRatio(white, background) >= contrastRatio(black, background) ? white : black;
}

export function ensureContrast(foreground: RgbColor, background: RgbColor, minimum = 4.5): RgbColor {
  const visible = foreground.a < 1 ? composite(foreground, background) : foreground;
  if (contrastRatio(visible, background) >= minimum) return visible;
  const target = readableText(background);
  // Move toward the closest high-contrast endpoint in small deterministic increments.
  for (let amount = 0.08; amount <= 1; amount += 0.08) {
    const adjusted = mix(visible, target, amount);
    if (contrastRatio(adjusted, background) >= minimum) return adjusted;
  }
  return target;
}

export function isChromatic(color: RgbColor): boolean {
  return Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b) > 22;
}
