import { describe, it, expect } from 'bun:test'
import { 
  CreateProjectSchema,
  UpdateVibeSchema,
  GenerateComponentSchema,
  GenerateStreamSchema,
  NudgeRequestSchema,
  MAX_PROMPT_LENGTH,
} from './validation'

describe('API Validation Schemas', () => {
  describe('CreateProjectSchema', () => {
    it('should accept empty object', () => {
      const result = CreateProjectSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept valid vibeId', () => {
      const result = CreateProjectSchema.safeParse({ vibeId: 'minimalist' })
      expect(result.success).toBe(true)
    })

    it('should reject empty vibeId', () => {
      const result = CreateProjectSchema.safeParse({ vibeId: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateVibeSchema', () => {
    it('should require vibeId', () => {
      const result = UpdateVibeSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should accept valid vibeId', () => {
      const result = UpdateVibeSchema.safeParse({ vibeId: 'high-fashion' })
      expect(result.success).toBe(true)
    })
  })

  describe('GenerateComponentSchema', () => {
    it('should require prompt', () => {
      const result = GenerateComponentSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should accept valid request', () => {
      const result = GenerateComponentSchema.safeParse({ 
        prompt: 'Create a hero section',
        vibeId: 'minimalist',
      })
      expect(result.success).toBe(true)
    })

    it('should reject prompt exceeding max length', () => {
      const longPrompt = 'a'.repeat(MAX_PROMPT_LENGTH + 1)
      const result = GenerateComponentSchema.safeParse({ prompt: longPrompt })
      expect(result.success).toBe(false)
    })

    it('should accept optional fields', () => {
      const result = GenerateComponentSchema.safeParse({ 
        prompt: 'Create a button',
        projectId: 'proj123',
        context: 'This is for a landing page',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('GenerateStreamSchema', () => {
    it('should require prompt', () => {
      const result = GenerateStreamSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should accept valid streaming request', () => {
      const result = GenerateStreamSchema.safeParse({ 
        prompt: 'Create a card component',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('NudgeRequestSchema', () => {
    it('should require all fields', () => {
      const result = NudgeRequestSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should accept valid nudge request', () => {
      const result = NudgeRequestSchema.safeParse({
        prompt: 'more padding',
        targetElement: 'button.primary',
        currentClasses: ['px-4', 'py-2', 'bg-blue-500'],
      })
      expect(result.success).toBe(true)
    })

    it('should reject too many classes', () => {
      const result = NudgeRequestSchema.safeParse({
        prompt: 'more padding',
        targetElement: 'button.primary',
        currentClasses: Array(201).fill('class'),
      })
      expect(result.success).toBe(false)
    })
  })
})
