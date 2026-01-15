/**
 * Ghosting Visual Diff
 * 
 * Creates a "ghost" overlay of the previous state when changes are applied.
 * The ghost fades out over 2 seconds, showing the user what changed.
 */

import type { StyleDelta } from '../nudge-engine/patcher';

/** Ghosting configuration */
export interface GhostingConfig {
  /** Duration in ms for the ghost to fade (default: 2000) */
  fadeDuration: number;
  /** Initial opacity of the ghost (default: 0.5) */
  initialOpacity: number;
  /** Z-index for the ghost layer */
  zIndex: number;
}

/** Default ghosting configuration */
export const DEFAULT_GHOSTING_CONFIG: GhostingConfig = {
  fadeDuration: 2000,
  initialOpacity: 0.5,
  zIndex: 50,
};

/** Ghost element state */
export interface GhostState {
  /** The ghost element ID */
  id: string;
  /** Original HTML content */
  originalHtml: string;
  /** Timestamp when ghost was created */
  createdAt: number;
  /** Whether the ghost is still visible */
  isVisible: boolean;
}

/** Active ghosts map */
const activeGhosts = new Map<string, GhostState>();

/**
 * Create a ghost overlay for an element before applying changes
 */
export function createGhost(
  elementId: string,
  element: HTMLElement,
  config: Partial<GhostingConfig> = {}
): GhostState {
  const fullConfig = { ...DEFAULT_GHOSTING_CONFIG, ...config };
  const ghostId = `ghost_${elementId}_${Date.now()}`;
  
  // Capture current state
  const rect = element.getBoundingClientRect();
  const originalHtml = element.outerHTML;
  
  // Create ghost element
  const ghost = document.createElement('div');
  ghost.id = ghostId;
  ghost.className = 'ghost-overlay';
  ghost.innerHTML = originalHtml;
  ghost.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    opacity: ${fullConfig.initialOpacity};
    pointer-events: none;
    z-index: ${fullConfig.zIndex};
    transition: opacity ${fullConfig.fadeDuration}ms ease-out;
    filter: grayscale(50%);
  `;
  
  // Add to document
  document.body.appendChild(ghost);
  
  // Start fade animation
  requestAnimationFrame(() => {
    ghost.style.opacity = '0';
  });
  
  // Remove after fade completes
  setTimeout(() => {
    ghost.remove();
    activeGhosts.delete(ghostId);
  }, fullConfig.fadeDuration);
  
  const state: GhostState = {
    id: ghostId,
    originalHtml,
    createdAt: Date.now(),
    isVisible: true,
  };
  
  activeGhosts.set(ghostId, state);
  
  return state;
}

/**
 * Clear all active ghosts immediately
 */
export function clearAllGhosts(): void {
  activeGhosts.forEach((ghost) => {
    const element = document.getElementById(ghost.id);
    if (element) {
      element.remove();
    }
  });
  activeGhosts.clear();
}

/**
 * Get count of active ghosts
 */
export function getActiveGhostCount(): number {
  return activeGhosts.size;
}

/**
 * CSS styles for ghosting (to be injected into page)
 */
export const GHOST_STYLES = `
  .ghost-overlay {
    background: inherit;
    border-radius: inherit;
  }
  
  .ghost-overlay * {
    pointer-events: none !important;
  }
`;

// =============================================================================
// Diff Toast Types and Functions
// =============================================================================

/** Diff toast state */
export interface DiffToastState {
  id: string;
  delta: StyleDelta;
  elementId: string;
  createdAt: number;
  expiresAt: number;
}

/** Toast configuration */
export interface ToastConfig {
  /** Duration in ms before toast disappears (default: 4000) */
  duration: number;
  /** Position of the toast */
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/** Default toast configuration */
export const DEFAULT_TOAST_CONFIG: ToastConfig = {
  duration: 4000,
  position: 'bottom-right',
};

/** Active toasts */
const activeToasts: DiffToastState[] = [];

/**
 * Create diff toast data (for rendering by component)
 */
export function createDiffToast(
  elementId: string,
  delta: StyleDelta,
  config: Partial<ToastConfig> = {}
): DiffToastState {
  const fullConfig = { ...DEFAULT_TOAST_CONFIG, ...config };
  const now = Date.now();
  
  const toast: DiffToastState = {
    id: `toast_${elementId}_${now}`,
    delta,
    elementId,
    createdAt: now,
    expiresAt: now + fullConfig.duration,
  };
  
  activeToasts.push(toast);
  
  // Auto-remove after expiration
  setTimeout(() => {
    const index = activeToasts.findIndex(t => t.id === toast.id);
    if (index !== -1) {
      activeToasts.splice(index, 1);
    }
  }, fullConfig.duration);
  
  return toast;
}

/**
 * Get all active toasts
 */
export function getActiveToasts(): DiffToastState[] {
  return [...activeToasts];
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string): boolean {
  const index = activeToasts.findIndex(t => t.id === toastId);
  if (index !== -1) {
    activeToasts.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Clear all toasts
 */
export function clearAllToasts(): void {
  activeToasts.length = 0;
}

/**
 * Format delta for display
 */
export function formatDeltaForDisplay(delta: StyleDelta): { added: string; removed: string } {
  return {
    added: delta.add.length > 0 ? `+${delta.add.join(' +')}` : '',
    removed: delta.remove.length > 0 ? `-${delta.remove.join(' -')}` : '',
  };
}
