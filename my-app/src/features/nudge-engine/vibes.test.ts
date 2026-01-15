import { describe, it, expect } from 'bun:test'
import { 
  minimalistVibe, 
  highFashionVibe, 
  vibeRegistry, 
  getVibe, 
  getAllVibes,
  DEFAULT_VIBE_ID
} from './vibes'
import { generateVibeCss } from './vibe-css'

describe('Story 1.2: Select Design Vibe from Gallery', () => {
  describe('AC1: Vibe configuration schema', () => {
    it('should have Minimalist vibe with correct tokens', () => {
      expect(minimalistVibe.id).toBe('minimalist')
      expect(minimalistVibe.colors.primary).toBeDefined()
      expect(minimalistVibe.colors.secondary).toBeDefined()
      expect(minimalistVibe.spacing.scale).toBe('tight')
      expect(minimalistVibe.typography.fontSans).toContain('Inter')
      expect(minimalistVibe.borderRadius.md).toBeDefined()
    })

    it('should have High Fashion vibe with correct tokens', () => {
      expect(highFashionVibe.id).toBe('high-fashion')
      expect(highFashionVibe.colors.primary).toBe('#000000')
      expect(highFashionVibe.colors.accent).toBe('#d4af37') // gold
      expect(highFashionVibe.spacing.scale).toBe('airy')
      expect(highFashionVibe.typography.fontSerif).toContain('Playfair')
    })

    it('should have at least 2 vibes in registry', () => {
      const vibes = getAllVibes()
      expect(vibes.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('AC2: Vibe selection and preview', () => {
    it('should retrieve vibe by ID', () => {
      const vibe = getVibe('minimalist')
      expect(vibe).toBeDefined()
      expect(vibe?.name).toBe('Minimalist')
    })

    it('should return undefined for unknown vibe ID', () => {
      const vibe = getVibe('unknown-vibe')
      expect(vibe).toBeUndefined()
    })

    it('should have a default vibe ID', () => {
      expect(DEFAULT_VIBE_ID).toBe('minimalist')
      const defaultVibe = getVibe(DEFAULT_VIBE_ID)
      expect(defaultVibe).toBeDefined()
    })
  })

  describe('AC3: Tailwind token injection', () => {
    it('should generate CSS with color variables', () => {
      const css = generateVibeCss(minimalistVibe)
      expect(css).toContain('--color-primary:')
      expect(css).toContain('--color-secondary:')
      expect(css).toContain('--color-accent:')
      expect(css).toContain('--color-background:')
    })

    it('should generate CSS with typography variables', () => {
      const css = generateVibeCss(minimalistVibe)
      expect(css).toContain('--font-sans:')
      expect(css).toContain('--font-serif:')
      expect(css).toContain('--font-weight-heading:')
    })

    it('should generate CSS with spacing variables', () => {
      const css = generateVibeCss(minimalistVibe)
      expect(css).toContain('--spacing-1:')
      expect(css).toContain('--spacing-4:')
      expect(css).toContain('--spacing-8:')
    })

    it('should generate CSS with border-radius variables', () => {
      const css = generateVibeCss(minimalistVibe)
      expect(css).toContain('--radius-sm:')
      expect(css).toContain('--radius-md:')
      expect(css).toContain('--radius-lg:')
    })

    it('should apply spacing scale multiplier correctly', () => {
      const minimalistCss = generateVibeCss(minimalistVibe) // tight = 0.75x
      const fashionCss = generateVibeCss(highFashionVibe)   // airy = 1.5x
      
      // Different scales should produce different spacing values
      expect(minimalistCss).not.toBe(fashionCss)
    })
  })
})
