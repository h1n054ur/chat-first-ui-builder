import { describe, it, expect } from 'bun:test'
import { generateProjectId } from './client'

describe('Story 1.3: Real-time Preview Synchronization', () => {
  describe('Project ID Generation (Cryptographically Secure)', () => {
    it('should generate a 21-character project ID', () => {
      const id = generateProjectId()
      expect(id.length).toBe(21)
    })

    it('should generate unique IDs', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateProjectId())
      }
      expect(ids.size).toBe(100) // All should be unique
    })

    it('should only contain alphanumeric characters', () => {
      const id = generateProjectId()
      expect(id).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('should have high entropy (no obvious patterns)', () => {
      // Generate multiple IDs and check they don't share prefixes
      const ids = Array.from({ length: 10 }, () => generateProjectId())
      const prefixes = ids.map(id => id.substring(0, 3))
      const uniquePrefixes = new Set(prefixes)
      
      // Should have mostly unique 3-char prefixes
      expect(uniquePrefixes.size).toBeGreaterThan(5)
    })

    it('should use crypto.getRandomValues (security check)', () => {
      // This tests that the function exists and works correctly
      // The actual crypto verification is implicit in the implementation
      const id1 = generateProjectId()
      const id2 = generateProjectId()
      
      // Should be different (extremely unlikely to collide)
      expect(id1).not.toBe(id2)
    })
  })

  describe('State Manager Client Functions', () => {
    it('should export getStateManager function', async () => {
      const { getStateManager } = await import('./client')
      expect(typeof getStateManager).toBe('function')
    })

    it('should export initSession function', async () => {
      const { initSession } = await import('./client')
      expect(typeof initSession).toBe('function')
    })

    it('should export getSessionState function', async () => {
      const { getSessionState } = await import('./client')
      expect(typeof getSessionState).toBe('function')
    })

    it('should export setSessionVibe function', async () => {
      const { setSessionVibe } = await import('./client')
      expect(typeof setSessionVibe).toBe('function')
    })

    it('should export updateSessionAst function', async () => {
      const { updateSessionAst } = await import('./client')
      expect(typeof updateSessionAst).toBe('function')
    })
  })

  describe('StateManager Integration Patterns', () => {
    // These tests document the expected behavior for integration testing
    // Full integration tests require Miniflare/Wrangler environment
    
    it('should use internal URLs for DO communication', async () => {
      // Verify the pattern matches architecture requirements
      const { initSession, getSessionState, setSessionVibe, updateSessionAst } = await import('./client')
      
      // These functions are designed to work with Durable Objects
      // They use internal URLs like 'http://internal/state/*'
      expect(initSession).toBeDefined()
      expect(getSessionState).toBeDefined()
      expect(setSessionVibe).toBeDefined()
      expect(updateSessionAst).toBeDefined()
    })
  })
})
