import { describe, it, expect } from 'bun:test'
import { getComponentGenerationPrompt, getNudgePrompt } from './prompts'
import { sanitizeJsx, validateJsx, addTrackingId } from './sanitize'
import { minimalistVibe, highFashionVibe } from '../nudge-engine/vibes'

describe('Story 2.1: Generate Component from Text Prompt', () => {
  describe('AC1: System prompts include vibe context', () => {
    it('should include vibe name in component generation prompt', () => {
      const prompt = getComponentGenerationPrompt(minimalistVibe)
      expect(prompt).toContain('Minimalist')
      expect(prompt).toContain(minimalistVibe.colors.primary)
      expect(prompt).toContain(minimalistVibe.typography.fontSans)
    })

    it('should include color tokens in prompt', () => {
      const prompt = getComponentGenerationPrompt(highFashionVibe)
      expect(prompt).toContain('#000000') // primary
      expect(prompt).toContain('#d4af37') // gold accent
    })

    it('should include spacing scale in nudge prompt', () => {
      const prompt = getNudgePrompt(minimalistVibe)
      expect(prompt).toContain('tight')
    })

    it('should instruct to return JSX only (no imports)', () => {
      const prompt = getComponentGenerationPrompt(minimalistVibe)
      expect(prompt).toContain('Do NOT include imports')
      expect(prompt).toContain('function declarations')
    })
  })

  describe('AC2: JSX sanitization', () => {
    it('should remove script tags', () => {
      const dirty = '<div><script>alert("xss")</script>Hello</div>'
      const clean = sanitizeJsx(dirty)
      expect(clean).not.toContain('<script')
      expect(clean).not.toContain('alert')
    })

    it('should remove event handlers', () => {
      const dirty = '<button onclick="alert(1)">Click</button>'
      const clean = sanitizeJsx(dirty)
      expect(clean).not.toContain('onclick')
    })

    it('should remove javascript: URLs', () => {
      const dirty = '<a href="javascript:alert(1)">Link</a>'
      const clean = sanitizeJsx(dirty)
      expect(clean).not.toContain('javascript:')
    })

    it('should preserve valid HTML', () => {
      const valid = '<div class="p-4"><h1>Title</h1><p>Content</p></div>'
      const clean = sanitizeJsx(valid)
      expect(clean).toBe(valid)
    })
  })

  describe('AC2: JSX validation', () => {
    it('should detect script tags', () => {
      const result = validateJsx('<script>bad</script>')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Script tags are not allowed')
    })

    it('should detect inline event handlers', () => {
      const result = validateJsx('<button onclick="bad()">Click</button>')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Inline event handlers are not allowed')
    })

    it('should detect javascript URLs', () => {
      const result = validateJsx('<a href="javascript:void(0)">Link</a>')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('JavaScript URLs are not allowed')
    })

    it('should pass valid JSX', () => {
      const result = validateJsx('<div class="p-4"><h1>Hello</h1></div>')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })
  })

  describe('AC3: Component tracking', () => {
    it('should add tracking ID to root element', () => {
      const jsx = '<div class="p-4">Content</div>'
      const tracked = addTrackingId(jsx, 'comp_123')
      expect(tracked).toContain('data-02-id="comp_123"')
    })

    it('should preserve existing attributes', () => {
      const jsx = '<div class="p-4" id="test">Content</div>'
      const tracked = addTrackingId(jsx, 'comp_456')
      expect(tracked).toContain('class="p-4"')
      expect(tracked).toContain('id="test"')
      expect(tracked).toContain('data-02-id="comp_456"')
    })
  })
})
