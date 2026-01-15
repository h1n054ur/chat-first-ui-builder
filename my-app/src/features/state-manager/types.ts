/**
 * State Manager Types
 * 
 * Types for session state management.
 */

import type { VibeTokens } from '../nudge-engine/vibes';

/**
 * Session state stored in Durable Object
 */
export interface SessionState {
  projectId: string;
  currentVibeId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * State update payload
 */
export interface StateUpdatePayload {
  vibeId?: string;
}
