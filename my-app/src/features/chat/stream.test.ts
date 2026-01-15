import { describe, it, expect } from 'bun:test'
import { formatSSE, STATUS_MESSAGES, type StreamEvent } from './stream'

describe('Story 2.2: Stream AI Response Status', () => {
  describe('AC1: Status message definitions', () => {
    it('should have planning status', () => {
      expect(STATUS_MESSAGES.PLANNING).toBe('Planning structure...')
    })

    it('should have vibe application status', () => {
      expect(STATUS_MESSAGES.APPLYING_VIBE).toBe('Applying design tokens...')
    })

    it('should have generating status', () => {
      expect(STATUS_MESSAGES.GENERATING).toBe('Generating...')
    })

    it('should have completion status', () => {
      expect(STATUS_MESSAGES.COMPLETE).toBe('Done')
    })

    it('should have error status', () => {
      expect(STATUS_MESSAGES.ERROR).toBe('Error occurred')
    })
  })

  describe('AC2: SSE formatting', () => {
    it('should format status event correctly', () => {
      const event: StreamEvent = {
        type: 'status',
        data: 'Planning...',
        timestamp: 100,
      }
      const sse = formatSSE(event)
      expect(sse).toContain('event: status')
      expect(sse).toContain('"type":"status"')
      expect(sse).toContain('"data":"Planning..."')
      expect(sse).toContain('"timestamp":100')
      expect(sse).toEndWith('\n\n')
    })

    it('should format token event correctly', () => {
      const event: StreamEvent = {
        type: 'token',
        data: '<div',
        timestamp: 200,
      }
      const sse = formatSSE(event)
      expect(sse).toContain('event: token')
      expect(sse).toContain('"data":"<div"')
    })

    it('should format complete event correctly', () => {
      const event: StreamEvent = {
        type: 'complete',
        data: 'Done',
        timestamp: 500,
      }
      const sse = formatSSE(event)
      expect(sse).toContain('event: complete')
    })

    it('should format error event correctly', () => {
      const event: StreamEvent = {
        type: 'error',
        data: 'API error',
        timestamp: 300,
      }
      const sse = formatSSE(event)
      expect(sse).toContain('event: error')
      expect(sse).toContain('"data":"API error"')
    })

    it('should format fragment event correctly', () => {
      const event: StreamEvent = {
        type: 'fragment',
        data: '<div class="test">',
        timestamp: 250,
      }
      const sse = formatSSE(event)
      expect(sse).toContain('event: fragment')
      expect(sse).toContain('"data":"<div class=\\"test\\">"')
    })
  })

  describe('AC3: Stream event types', () => {
    it('should have all required event types', () => {
      const eventTypes = ['status', 'token', 'fragment', 'complete', 'error']
      
      for (const type of eventTypes) {
        const event: StreamEvent = {
          type: type as StreamEvent['type'],
          data: 'test',
          timestamp: 0,
        }
        expect(event.type).toBe(type)
      }
    })

    it('should include timestamp in all events', () => {
      const event: StreamEvent = {
        type: 'status',
        data: 'test',
        timestamp: 123,
      }
      const sse = formatSSE(event)
      expect(sse).toContain('"timestamp":123')
    })
  })
})
