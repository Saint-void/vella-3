import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio, ensureContrast, parseColor, readableText } from './color';
import { createAdaptiveCssVariables } from './ThemeEngine';
import { DEFAULT_VELLA_THEME } from './types';

test('parses compact, alpha, and rgb colors', () => {
  assert.deepEqual(parseColor('#1a2'), { r: 17, g: 170, b: 34, a: 1 });
  assert.deepEqual(parseColor('#11223380'), { r: 17, g: 34, b: 51, a: 128 / 255 });
  assert.deepEqual(parseColor('rgb(20, 30, 40)'), { r: 20, g: 30, b: 40, a: 1 });
  assert.equal(parseColor('transparent'), null);
});

test('chooses an accessible foreground and corrects weak contrast', () => {
  const surface = parseColor('#ffffff')!;
  const text = ensureContrast(parseColor('#bdbdbd')!, surface);
  assert.ok(contrastRatio(text, surface) >= 4.5);
  assert.ok(contrastRatio(readableText(parseColor('#171717')!), parseColor('#171717')!) >= 4.5);
});

test('generates a complete, namespaced CSS variable contract', () => {
  const variables = createAdaptiveCssVariables(DEFAULT_VELLA_THEME);
  assert.equal(variables['--vella-accent'], DEFAULT_VELLA_THEME.accent);
  assert.equal(variables['--vella-radius'], DEFAULT_VELLA_THEME.radius);
  assert.equal(Object.keys(variables).length, 14);
});
