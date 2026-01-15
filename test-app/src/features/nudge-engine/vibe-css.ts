/**
 * Vibe CSS Generator
 * 
 * Translates Vibe tokens into CSS custom properties for Tailwind v4.
 */

import type { VibeTokens } from './vibes';

/**
 * Generate CSS custom properties from vibe tokens
 */
export function generateVibeCss(vibe: VibeTokens): string {
  const spacingMultiplier = vibe.spacing.scale === 'tight' ? 0.75 : vibe.spacing.scale === 'airy' ? 1.5 : 1;
  
  return `
:root {
  /* Vibe: ${vibe.name} */
  
  /* Colors */
  --color-primary: ${vibe.colors.primary};
  --color-secondary: ${vibe.colors.secondary};
  --color-background: ${vibe.colors.background};
  --color-surface: ${vibe.colors.surface};
  --color-text: ${vibe.colors.text};
  --color-text-muted: ${vibe.colors.textMuted};
  --color-accent: ${vibe.colors.accent};
  --color-border: ${vibe.colors.border};
  
  /* Typography */
  --font-sans: ${vibe.typography.fontSans};
  --font-serif: ${vibe.typography.fontSerif};
  --font-mono: ${vibe.typography.fontMono};
  --font-weight-heading: ${vibe.typography.headingWeight};
  --font-weight-body: ${vibe.typography.bodyWeight};
  
  /* Border Radius */
  --radius-sm: ${vibe.borderRadius.sm};
  --radius-md: ${vibe.borderRadius.md};
  --radius-lg: ${vibe.borderRadius.lg};
  --radius-full: ${vibe.borderRadius.full};
  
  /* Spacing Scale (base: ${vibe.spacing.base}px, scale: ${vibe.spacing.scale}) */
  --spacing-1: ${vibe.spacing.base * spacingMultiplier * 0.25}px;
  --spacing-2: ${vibe.spacing.base * spacingMultiplier * 0.5}px;
  --spacing-3: ${vibe.spacing.base * spacingMultiplier * 0.75}px;
  --spacing-4: ${vibe.spacing.base * spacingMultiplier}px;
  --spacing-5: ${vibe.spacing.base * spacingMultiplier * 1.25}px;
  --spacing-6: ${vibe.spacing.base * spacingMultiplier * 1.5}px;
  --spacing-8: ${vibe.spacing.base * spacingMultiplier * 2}px;
  --spacing-10: ${vibe.spacing.base * spacingMultiplier * 2.5}px;
  --spacing-12: ${vibe.spacing.base * spacingMultiplier * 3}px;
  --spacing-16: ${vibe.spacing.base * spacingMultiplier * 4}px;
}

body {
  font-family: var(--font-sans);
  font-weight: var(--font-weight-body);
  background-color: var(--color-background);
  color: var(--color-text);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-heading);
}
`.trim();
}

/**
 * Generate a style tag with vibe CSS
 */
export function generateVibeStyleTag(vibe: VibeTokens): string {
  return `<style id="vibe-tokens">${generateVibeCss(vibe)}</style>`;
}
