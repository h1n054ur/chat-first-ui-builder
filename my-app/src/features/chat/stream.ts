/**
 * Streaming Chat Client
 * 
 * Story 7.1: Surgical SSE Emitter
 * Story 7.3: Character-by-Character Patching
 * 
 * Handles streaming responses from Claude for real-time UI updates.
 * Uses `text/event-stream` with `Content-Encoding: Identity` to prevent buffering.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { VibeTokens } from '../nudge-engine/vibes';
import { getComponentGenerationPrompt } from './prompts';

/** Stream event types */
export type StreamEventType = 
  | 'status'      // Status update (e.g., "Planning...")
  | 'thinking'    // Story 7.2: Thinking log for terminal display
  | 'token'       // Single character/token from AI
  | 'fragment'    // JSX fragment for surgical patching
  | 'complete'    // Generation complete
  | 'error';      // Error occurred

/** Stream event payload */
export interface StreamEvent {
  type: StreamEventType;
  data: string;
  timestamp: number;
}

/** Status messages for different phases (Story 7.2: Live Thinking State) */
export const STATUS_MESSAGES = {
  PLANNING: 'Planning structure...',
  ANALYZING: 'Analyzing intent...',
  APPLYING_VIBE: 'Applying design tokens...',
  GENERATING: 'Generating...',
  STREAMING: 'Streaming from Claude...',
  PATCHING: 'Patching DOM...',
  APPLYING_STYLES: 'Applying Tailwind classes...',
  FINALIZING: 'Finalizing...',
  COMPLETE: 'Done',
  ERROR: 'Error occurred',
} as const;

/** Thinking log entry for Story 7.2 - exported for frontend type checking */
export interface ThinkingLogEntry {
  timestamp: number;
  phase: string;
  message: string;
  progress: number;
}

/** Parse a thinking event's data payload */
export function parseThinkingEvent(data: string): ThinkingLogEntry | null {
  try {
    return JSON.parse(data) as ThinkingLogEntry;
  } catch {
    return null;
  }
}

/**
 * Create an SSE formatted message
 * Format: event: type\ndata: json\n\n
 */
export function formatSSE(event: StreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

/**
 * Stream component generation with character-by-character output
 * TTFT target: < 500ms
 */
export async function* streamComponentGeneration(
  client: Anthropic,
  prompt: string,
  vibe: VibeTokens,
  context?: string,
  model: string = 'claude-sonnet-4-20250514'
): AsyncGenerator<StreamEvent> {
  const startTime = Date.now();
  let accumulatedJsx = '';
  let lastFragmentLength = 0;
  const FRAGMENT_INTERVAL = 100; // Emit fragment every ~100 characters

  // Story 7.2: Emit planning status immediately (TTFT < 500ms)
  yield {
    type: 'status',
    data: STATUS_MESSAGES.PLANNING,
    timestamp: Date.now() - startTime,
  };
  
  // Story 7.2: Emit thinking log for terminal
  yield {
    type: 'thinking',
    data: JSON.stringify({ phase: 'Planning', message: 'Analyzing component requirements...', progress: 10 }),
    timestamp: Date.now() - startTime,
  };

  try {
    const systemPrompt = getComponentGenerationPrompt(vibe);
    let userPrompt = prompt;
    if (context) {
      userPrompt = `Context: ${context}\n\nRequest: ${prompt}`;
    }

    // Story 7.2: Emit vibe application status with thinking log
    yield {
      type: 'status',
      data: STATUS_MESSAGES.APPLYING_VIBE,
      timestamp: Date.now() - startTime,
    };
    
    yield {
      type: 'thinking',
      data: JSON.stringify({ phase: 'Vibe', message: `Loading vibe tokens: ${vibe.name || 'default'}`, progress: 25 }),
      timestamp: Date.now() - startTime,
    };

    // Start streaming from Claude
    const stream = await client.messages.stream({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Story 7.2: Emit generating status with thinking log
    yield {
      type: 'status',
      data: STATUS_MESSAGES.STREAMING,
      timestamp: Date.now() - startTime,
    };
    
    yield {
      type: 'thinking',
      data: JSON.stringify({ phase: 'Streaming', message: 'Connected to Claude, receiving tokens...', progress: 40 }),
      timestamp: Date.now() - startTime,
    };

    // Stream tokens character-by-character for "alive" feel
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        accumulatedJsx += text;
        
        // Emit each character individually for smooth animation
        for (const char of text) {
          yield {
            type: 'token',
            data: char,
            timestamp: Date.now() - startTime,
          };
        }
        
        // Emit fragment for DOM patching every ~100 chars (clearer logic)
        if (accumulatedJsx.length - lastFragmentLength >= FRAGMENT_INTERVAL) {
          lastFragmentLength = accumulatedJsx.length;
          yield {
            type: 'fragment',
            data: accumulatedJsx,
            timestamp: Date.now() - startTime,
          };
        }
      }
    }

    // Emit final fragment with complete JSX
    yield {
      type: 'fragment',
      data: accumulatedJsx,
      timestamp: Date.now() - startTime,
    };
    
    // Story 7.2: Emit finalizing thinking log
    yield {
      type: 'thinking',
      data: JSON.stringify({ phase: 'Finalizing', message: 'Applying final optimizations...', progress: 95 }),
      timestamp: Date.now() - startTime,
    };

    // Emit completion
    yield {
      type: 'complete',
      data: accumulatedJsx,
      timestamp: Date.now() - startTime,
    };
    
    // Story 7.2: Emit complete thinking log
    yield {
      type: 'thinking',
      data: JSON.stringify({ phase: 'Complete', message: 'Generation complete!', progress: 100 }),
      timestamp: Date.now() - startTime,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    yield {
      type: 'error',
      data: JSON.stringify({
        message,
        partial: accumulatedJsx.length > 0,
        partialContent: accumulatedJsx,
      }),
      timestamp: Date.now() - startTime,
    };
  }
}

/**
 * Stream nudge application with visual diff
 */
export async function* streamNudgeApplication(
  client: Anthropic,
  currentJsx: string,
  nudgePrompt: string,
  vibe: VibeTokens,
  model: string = 'claude-sonnet-4-20250514'
): AsyncGenerator<StreamEvent> {
  const startTime = Date.now();

  yield {
    type: 'status',
    data: 'Analyzing intent...',
    timestamp: Date.now() - startTime,
  };

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: `You are a CSS/Tailwind expert. Given JSX with Tailwind classes and a design intent, return ONLY the modified JSX with updated classes. Make surgical style-only changes. Preserve all logic and structure.`,
      messages: [{
        role: 'user',
        content: `Current JSX:\n${currentJsx}\n\nIntent: "${nudgePrompt}"\n\nReturn ONLY the modified JSX with updated Tailwind classes.`
      }],
    });

    yield {
      type: 'status',
      data: STATUS_MESSAGES.PATCHING,
      timestamp: Date.now() - startTime,
    };

    const content = response.content[0];
    const newJsx = content.type === 'text' ? content.text : '';

    // Extract and emit the diff for visual feedback
    yield {
      type: 'fragment',
      data: JSON.stringify({
        before: currentJsx,
        after: newJsx,
      }),
      timestamp: Date.now() - startTime,
    };

    yield {
      type: 'complete',
      data: newJsx,
      timestamp: Date.now() - startTime,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    yield {
      type: 'error',
      data: message,
      timestamp: Date.now() - startTime,
    };
  }
}

/**
 * Create a ReadableStream for SSE responses
 * Uses Content-Encoding: Identity to prevent edge buffering
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

/**
 * SSE Response headers for Cloudflare Workers
 * Critical: Content-Encoding: Identity prevents edge buffering
 */
export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'Content-Encoding': 'identity',
  'X-Accel-Buffering': 'no',
};
