/**
 * History Manager
 * 
 * Manages undo/redo history for AST state.
 * Maintains a capped history stack for memory efficiency.
 */

import type { ASTComponent } from '../nudge-engine/patcher';

/** Maximum history entries to prevent memory issues */
export const MAX_HISTORY_SIZE = 50;

/** History entry */
export interface HistoryEntry {
  /** Unique entry ID */
  id: string;
  /** Timestamp when entry was created */
  timestamp: number;
  /** The AST state at this point */
  ast: Record<string, ASTComponent>;
  /** Description of what changed */
  description: string;
}

/** History state */
export interface HistoryState {
  /** All history entries */
  entries: HistoryEntry[];
  /** Current position in history (0 = most recent) */
  currentIndex: number;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
}

/**
 * Create initial history state
 */
export function createHistoryState(initialAst: Record<string, ASTComponent> = {}): HistoryState {
  const initialEntry: HistoryEntry = {
    id: `history_${Date.now()}`,
    timestamp: Date.now(),
    ast: { ...initialAst },
    description: 'Initial state',
  };

  return {
    entries: [initialEntry],
    currentIndex: 0,
    canUndo: false,
    canRedo: false,
  };
}

/**
 * Push a new state to history
 */
export function pushHistory(
  state: HistoryState,
  ast: Record<string, ASTComponent>,
  description: string
): HistoryState {
  // If we're not at the most recent entry, truncate forward history
  const entries = state.entries.slice(0, state.entries.length - state.currentIndex);

  // Create new entry
  const newEntry: HistoryEntry = {
    id: `history_${Date.now()}`,
    timestamp: Date.now(),
    ast: JSON.parse(JSON.stringify(ast)), // Deep clone
    description,
  };

  // Add to history
  entries.push(newEntry);

  // Cap history size
  if (entries.length > MAX_HISTORY_SIZE) {
    entries.shift();
  }

  return {
    entries,
    currentIndex: 0,
    canUndo: entries.length > 1,
    canRedo: false,
  };
}

/**
 * Undo to previous state
 */
export function undo(state: HistoryState): { state: HistoryState; ast: Record<string, ASTComponent> | null } {
  if (!state.canUndo) {
    return { state, ast: null };
  }

  const newIndex = state.currentIndex + 1;
  const targetEntry = state.entries[state.entries.length - 1 - newIndex];

  if (!targetEntry) {
    return { state, ast: null };
  }

  return {
    state: {
      ...state,
      currentIndex: newIndex,
      canUndo: newIndex < state.entries.length - 1,
      canRedo: true,
    },
    ast: JSON.parse(JSON.stringify(targetEntry.ast)),
  };
}

/**
 * Redo to next state
 */
export function redo(state: HistoryState): { state: HistoryState; ast: Record<string, ASTComponent> | null } {
  if (!state.canRedo) {
    return { state, ast: null };
  }

  const newIndex = state.currentIndex - 1;
  const targetEntry = state.entries[state.entries.length - 1 - newIndex];

  if (!targetEntry || newIndex < 0) {
    return { state, ast: null };
  }

  return {
    state: {
      ...state,
      currentIndex: newIndex,
      canUndo: true,
      canRedo: newIndex > 0,
    },
    ast: JSON.parse(JSON.stringify(targetEntry.ast)),
  };
}

/**
 * Get current AST from history
 */
export function getCurrentAst(state: HistoryState): Record<string, ASTComponent> {
  const entry = state.entries[state.entries.length - 1 - state.currentIndex];
  return entry ? JSON.parse(JSON.stringify(entry.ast)) : {};
}

/**
 * Get history summary for UI
 */
export function getHistorySummary(state: HistoryState): {
  total: number;
  current: number;
  canUndo: boolean;
  canRedo: boolean;
  recentEntries: Array<{ description: string; timestamp: number }>;
} {
  return {
    total: state.entries.length,
    current: state.entries.length - state.currentIndex,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    recentEntries: state.entries.slice(-5).reverse().map(e => ({
      description: e.description,
      timestamp: e.timestamp,
    })),
  };
}

/**
 * Clear all history except current state
 */
export function clearHistory(state: HistoryState): HistoryState {
  const currentEntry = state.entries[state.entries.length - 1 - state.currentIndex];
  
  return {
    entries: currentEntry ? [currentEntry] : [],
    currentIndex: 0,
    canUndo: false,
    canRedo: false,
  };
}
