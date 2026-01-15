/**
 * Streaming Chat Client
 * 
 * Handles streaming responses from Claude for real-time UI updates.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { VibeTokens } from '../nudge-engine/vibes';
import { getComponentGenerationPrompt } from './prompts';

/** Stream event types */
export type StreamEventType = 
  | 'status'      // Status update (e.g., "Planning...")
  | 'token'       // Text token from AI
  | 'complete'    // Generation complete
  | 'error';      // Error occurred

/** Stream event payload */
export interface StreamEvent {
  type: StreamEventType;
  data: string;
  timestamp: number;
}

/** Status messages for different phases */
export const STATUS_MESSAGES = {
  PLANNING: 'Planning component structure...',
  APPLYING_VIBE: 'Applying design tokens...',
  GENERATING: 'Generating JSX...',
  FINALIZING: 'Finalizing output...',
  COMPLETE: 'Generation complete',
  ERROR: 'An error occurred',
} as const;

/**
 * Create an SSE formatted message
 */
export function formatSSE(event: StreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

/**
 * Stream component generation with status updates
 */
export async function* streamComponentGeneration(
  client: Anthropic,
  prompt: string,
  vibe: VibeTokens,
  context?: string,
  model: string = 'claude-sonnet-4-20250514'
): AsyncGenerator<StreamEvent> {
  const startTime = Date.now();

  // Emit planning status immediately (TTFT < 500ms requirement)
  yield {
    type: 'status',
    data: STATUS_MESSAGES.PLANNING,
    timestamp: Date.now() - startTime,
  };

  try {
    const systemPrompt = getComponentGenerationPrompt(vibe);
    let userPrompt = prompt;
    if (context) {
      userPrompt = `Context: ${context}\n\nRequest: ${prompt}`;
    }

    // Emit vibe application status
    yield {
      type: 'status',
      data: STATUS_MESSAGES.APPLYING_VIBE,
      timestamp: Date.now() - startTime,
    };

    // Start streaming from Claude
    const stream = await client.messages.stream({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Emit generating status
    yield {
      type: 'status',
      data: STATUS_MESSAGES.GENERATING,
      timestamp: Date.now() - startTime,
    };

    // Stream tokens as they arrive
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield {
          type: 'token',
          data: event.delta.text,
          timestamp: Date.now() - startTime,
        };
      }
    }

    // Emit finalizing status
    yield {
      type: 'status',
      data: STATUS_MESSAGES.FINALIZING,
      timestamp: Date.now() - startTime,
    };

    // Emit completion
    yield {
      type: 'complete',
      data: STATUS_MESSAGES.COMPLETE,
      timestamp: Date.now() - startTime,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Emit error event with detailed info
    yield {
      type: 'error',
      data: JSON.stringify({
        message,
        partial: true, // Indicates stream may have partial content
        recoverable: false,
      }),
      timestamp: Date.now() - startTime,
    };
    
    // Also emit a complete event to signal end of stream
    yield {
      type: 'complete',
      data: JSON.stringify({
        status: 'failed',
        reason: message,
      }),
      timestamp: Date.now() - startTime,
    };
  }
}

/**
 * Create a ReadableStream for SSE responses
 */
export function createSSEStream(
  generator: AsyncGenerator<StreamEvent>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          const sseData = formatSSE(event);
          controller.enqueue(encoder.encode(sseData));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
