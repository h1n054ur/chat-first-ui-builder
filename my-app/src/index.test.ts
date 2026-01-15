import { describe, it, expect } from 'bun:test'
import app from './index'

describe('Story 1.1: Initialize Project with Starter Template', () => {
  describe('AC1: Hono, Vite, and Tailwind configured', () => {
    it('should have Hono app initialized', () => {
      expect(app).toBeDefined()
      expect(typeof app.fetch).toBe('function')
    })

    it('should respond to health check', async () => {
      const res = await app.request('/api/health')
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.status).toBe('ok')
    })

    it('should render home page with Tailwind classes', async () => {
      const res = await app.request('/')
      expect(res.status).toBe(200)
      const html = await res.text()
      // "Zen Sculptor" initial screen with custom CSS classes
      expect(html).toContain('zen-container')
      expect(html).toContain('02')
      expect(html).toContain('What are you building')
    })
  })

  describe('AC4: tsconfig.json configured for Hono JSX', () => {
    it('should have JSX import source set to hono/jsx', async () => {
      const tsconfig = await Bun.file('./tsconfig.json').json()
      expect(tsconfig.compilerOptions.jsxImportSource).toBe('hono/jsx')
    })
  })
})
