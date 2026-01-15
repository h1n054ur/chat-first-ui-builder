/**
 * Vibe Configuration Schema
 * 
 * Design tokens for theme-level configuration.
 * Each vibe defines colors, spacing, typography, and border-radius.
 */

export interface VibeTokens {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    border: string;
  };
  spacing: {
    scale: 'tight' | 'normal' | 'airy';
    base: number; // in px
  };
  typography: {
    fontSans: string;
    fontSerif: string;
    fontMono: string;
    headingWeight: string;
    bodyWeight: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

/**
 * Minimalist Vibe
 * Slate-based, tight spacing, Inter sans.
 */
export const minimalistVibe: VibeTokens = {
  id: 'minimalist',
  name: 'Minimalist',
  description: 'Clean, focused design with tight spacing and neutral colors',
  colors: {
    primary: '#0f172a',      // slate-900
    secondary: '#64748b',    // slate-500
    background: '#ffffff',   // white
    surface: '#f8fafc',      // slate-50
    text: '#0f172a',         // slate-900
    textMuted: '#64748b',    // slate-500
    accent: '#6366f1',       // indigo-500
    border: '#e2e8f0',       // slate-200
  },
  spacing: {
    scale: 'tight',
    base: 4,
  },
  typography: {
    fontSans: 'Inter, system-ui, sans-serif',
    fontSerif: 'Georgia, serif',
    fontMono: 'Fira Code, monospace',
    headingWeight: '600',
    bodyWeight: '400',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
};

/**
 * High Fashion Vibe
 * Black/Gold, high contrast, serif/sans mix, airy spacing.
 */
export const highFashionVibe: VibeTokens = {
  id: 'high-fashion',
  name: 'High Fashion',
  description: 'Luxurious, bold design with high contrast and elegant typography',
  colors: {
    primary: '#000000',      // black
    secondary: '#d4af37',    // gold
    background: '#0a0a0a',   // near-black
    surface: '#1a1a1a',      // dark gray
    text: '#ffffff',         // white
    textMuted: '#a3a3a3',    // gray
    accent: '#d4af37',       // gold
    border: '#262626',       // dark border
  },
  spacing: {
    scale: 'airy',
    base: 8,
  },
  typography: {
    fontSans: 'Helvetica Neue, Arial, sans-serif',
    fontSerif: 'Playfair Display, Georgia, serif',
    fontMono: 'SF Mono, monospace',
    headingWeight: '300',
    bodyWeight: '300',
  },
  borderRadius: {
    sm: '0',
    md: '0',
    lg: '0',
    full: '9999px',
  },
};

/**
 * Registry of all available vibes
 */
export const vibeRegistry: Record<string, VibeTokens> = {
  minimalist: minimalistVibe,
  'high-fashion': highFashionVibe,
};

/**
 * Get vibe by ID
 */
export function getVibe(id: string): VibeTokens | undefined {
  return vibeRegistry[id];
}

/**
 * Get all available vibes
 */
export function getAllVibes(): VibeTokens[] {
  return Object.values(vibeRegistry);
}

/**
 * Default vibe ID
 */
export const DEFAULT_VIBE_ID = 'minimalist';
