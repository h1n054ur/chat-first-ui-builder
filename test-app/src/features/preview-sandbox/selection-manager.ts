/**
 * Selection Manager
 * 
 * Manages the selection state in the parent app.
 * Handles messages from the preview sandbox and updates the global selection state.
 */

import type { PreviewMessage, SelectionState, SelectedElement } from './types';
import { initialSelectionState } from './types';

/** Callback type for selection changes */
export type SelectionChangeCallback = (state: SelectionState) => void;

/** Selection manager class */
export class SelectionManager {
  private state: SelectionState = { ...initialSelectionState };
  private listeners: Set<SelectionChangeCallback> = new Set();
  private allowedOrigins: string[];
  /** Bound handler reference for proper cleanup */
  private boundHandleMessage: ((event: MessageEvent<PreviewMessage>) => void) | null = null;
  
  constructor(allowedOrigins: string[] = ['*']) {
    this.allowedOrigins = allowedOrigins;
  }
  
  /**
   * Initialize the selection manager
   */
  init(): void {
    // Store bound reference for cleanup
    this.boundHandleMessage = this.handleMessage.bind(this);
    window.addEventListener('message', this.boundHandleMessage);
  }
  
  /**
   * Cleanup listeners
   */
  destroy(): void {
    if (this.boundHandleMessage) {
      window.removeEventListener('message', this.boundHandleMessage);
      this.boundHandleMessage = null;
    }
    this.listeners.clear();
  }
  
  /**
   * Subscribe to selection changes
   */
  subscribe(callback: SelectionChangeCallback): () => void {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * Get current selection state
   */
  getState(): SelectionState {
    return { ...this.state };
  }
  
  /**
   * Get currently selected element
   */
  getCurrentTarget(): SelectedElement | null {
    return this.state.currentTarget;
  }
  
  /**
   * Check if an element is currently selected
   */
  hasSelection(): boolean {
    return this.state.currentTarget !== null;
  }
  
  /**
   * Programmatically select an element by ID
   */
  selectElement(element: SelectedElement): void {
    this.updateState({
      currentTarget: element,
      isSelecting: false,
      selectedAt: Date.now(),
    });
  }
  
  /**
   * Clear the current selection
   */
  clearSelection(): void {
    this.updateState({
      currentTarget: null,
      isSelecting: false,
      selectedAt: null,
    });
  }
  
  /**
   * Handle messages from the preview sandbox
   */
  private handleMessage(event: MessageEvent<PreviewMessage>): void {
    // Validate origin (skip for local dev)
    if (this.allowedOrigins[0] !== '*' && !this.allowedOrigins.includes(event.origin)) {
      return;
    }
    
    const message = event.data;
    
    // Validate message structure
    if (!message || typeof message.type !== 'string') {
      return;
    }
    
    switch (message.type) {
      case 'element_selected':
        if (message.payload && typeof message.payload === 'object' && 'id' in message.payload) {
          this.updateState({
            currentTarget: message.payload as SelectedElement,
            isSelecting: false,
            selectedAt: message.timestamp,
          });
        }
        break;
        
      case 'element_deselected':
      case 'selection_cleared':
        this.updateState({
          currentTarget: null,
          isSelecting: false,
          selectedAt: null,
        });
        break;
        
      case 'preview_ready':
        // Preview is ready - could trigger initial state sync
        break;
        
      case 'preview_error':
        console.error('Preview error:', message.payload);
        break;
    }
  }
  
  /**
   * Update state and notify listeners
   */
  private updateState(newState: Partial<SelectionState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }
  
  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const stateCopy = { ...this.state };
    this.listeners.forEach(callback => callback(stateCopy));
  }
}

/** Singleton instance for global access */
let globalSelectionManager: SelectionManager | null = null;

/**
 * Get or create the global selection manager
 */
export function getSelectionManager(): SelectionManager {
  if (!globalSelectionManager) {
    globalSelectionManager = new SelectionManager();
  }
  return globalSelectionManager;
}

/**
 * Initialize the global selection manager
 */
export function initSelectionManager(allowedOrigins?: string[]): SelectionManager {
  if (globalSelectionManager) {
    globalSelectionManager.destroy();
  }
  globalSelectionManager = new SelectionManager(allowedOrigins);
  globalSelectionManager.init();
  return globalSelectionManager;
}
