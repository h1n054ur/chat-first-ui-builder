/**
 * Claude AI Client
 * 
 * Client for interacting with the Anthropic Claude API.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { VibeTokens } from '../nudge-engine/vibes';
import { getComponentGenerationPrompt, getNudgePrompt } from './prompts';

/** Configuration for the AI client */
export interface AIClientConfig {
  apiKey: string;
  model?: string;
}

/** Component generation request */
export interface GenerateComponentRequest {
  prompt: string;
  vibe: VibeTokens;
  context?: string;
}

/** Component generation response */
export interface GenerateComponentResponse {
  success: boolean;
  jsx?: string;
  error?: string;
}

/** Nudge request */
export interface NudgeRequest {
  prompt: string;
  vibe: VibeTokens;
  targetElement: string;
  currentClasses: string[];
}

/** Nudge response */
export interface NudgeResponse {
  success: boolean;
  add?: string[];
  remove?: string[];
  error?: string;
}

/**
 * Create an Anthropic client
 */
export function createAIClient(config: AIClientConfig): Anthropic {
  return new Anthropic({
    apiKey: config.apiKey,
  });
}

/**
 * Generate a component from a text prompt
 */
export async function generateComponent(
  client: Anthropic,
  request: GenerateComponentRequest,
  model: string = 'claude-sonnet-4-20250514'
): Promise<GenerateComponentResponse> {
  try {
    const systemPrompt = getComponentGenerationPrompt(request.vibe);
    
    let userPrompt = request.prompt;
    if (request.context) {
      userPrompt = `Context: ${request.context}\n\nRequest: ${request.prompt}`;
    }

    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return { success: false, error: 'No text content in response' };
    }

    // Clean up the JSX (remove any markdown fences if present)
    let jsx = textContent.text.trim();
    if (jsx.startsWith('```')) {
      jsx = jsx.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
    }

    return { success: true, jsx };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Generate a nudge (style delta) from a text prompt
 */
export async function generateNudge(
  client: Anthropic,
  request: NudgeRequest,
  model: string = 'claude-sonnet-4-20250514'
): Promise<NudgeResponse> {
  try {
    const systemPrompt = getNudgePrompt(request.vibe);
    
    const userPrompt = `Target element: ${request.targetElement}
Current classes: ${request.currentClasses.join(' ')}

Nudge request: "${request.prompt}"`;

    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return { success: false, error: 'No text content in response' };
    }

    // Parse JSON response
    const delta = JSON.parse(textContent.text.trim()) as { add?: string[]; remove?: string[] };
    
    return {
      success: true,
      add: delta.add || [],
      remove: delta.remove || [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
