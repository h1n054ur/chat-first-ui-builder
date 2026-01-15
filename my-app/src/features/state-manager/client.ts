/**
 * State Manager Client
 * 
 * Client utilities for interacting with the StateManager Durable Object.
 */

import type { CloudflareBindings } from '../../lib/types';

/**
 * Get a StateManager Durable Object instance by project ID
 */
export function getStateManager(env: CloudflareBindings, projectId: string): DurableObjectStub {
  const id = env.STATE_MANAGER.idFromName(projectId);
  return env.STATE_MANAGER.get(id);
}

/**
 * Initialize a new session in the StateManager
 */
export async function initSession(
  env: CloudflareBindings,
  projectId: string,
  vibeId?: string
): Promise<Response> {
  const stub = getStateManager(env, projectId);
  return stub.fetch(new Request('http://internal/state/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, vibeId }),
  }));
}

/**
 * Get session state from StateManager
 */
export async function getSessionState(
  env: CloudflareBindings,
  projectId: string
): Promise<Response> {
  const stub = getStateManager(env, projectId);
  return stub.fetch(new Request('http://internal/state'));
}

/**
 * Update vibe in StateManager
 */
export async function setSessionVibe(
  env: CloudflareBindings,
  projectId: string,
  vibeId: string
): Promise<Response> {
  const stub = getStateManager(env, projectId);
  return stub.fetch(new Request('http://internal/state/vibe', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vibeId }),
  }));
}

/**
 * Update AST in StateManager
 */
export async function updateSessionAst(
  env: CloudflareBindings,
  projectId: string,
  ast: Record<string, unknown>
): Promise<Response> {
  const stub = getStateManager(env, projectId);
  return stub.fetch(new Request('http://internal/state/ast', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ast }),
  }));
}

/**
 * Generate a cryptographically secure random project ID
 * 
 * Uses crypto.getRandomValues() for security.
 * Per Dev Notes: "Ensure Project IDs are sufficiently random to prevent session hijacking"
 */
export function generateProjectId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 21;
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
}

/**
 * Undo the last AST change
 */
export async function undoSession(
  env: CloudflareBindings,
  projectId: string
): Promise<Response> {
  const stub = getStateManager(env, projectId);
  return stub.fetch(new Request('http://internal/state/undo', {
    method: 'POST',
  }));
}

/**
 * Redo the last undone AST change
 */
export async function redoSession(
  env: CloudflareBindings,
  projectId: string
): Promise<Response> {
  const stub = getStateManager(env, projectId);
  return stub.fetch(new Request('http://internal/state/redo', {
    method: 'POST',
  }));
}

/**
 * Get history summary for a session
 */
export async function getSessionHistory(
  env: CloudflareBindings,
  projectId: string
): Promise<Response> {
  const stub = getStateManager(env, projectId);
  return stub.fetch(new Request('http://internal/state/history'));
}
