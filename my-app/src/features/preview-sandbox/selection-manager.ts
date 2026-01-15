/**
 * Selection Manager
 * 
 * Story 8.1: Bidirectional postMessage Sync
 * Story 8.2: Indigo Selector Overlay
 * 
 * Manages the selection state in the parent app.
 * Handles messages from the preview sandbox and updates the global selection state.
 */

import type { PreviewMessage, SelectionState, SelectedElement } from './types';
import { initialSelectionState } from './types';

/** Element metadata received from iframe */
export interface ElementMetadata {
  tag: string;
  id: string | null;
  classes: string[];
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

/** Callback type for selection changes */
export type SelectionChangeCallback = (state: SelectionState) => void;

/** Selection manager class */
export class SelectionManager {
  private state: SelectionState = { ...initialSelectionState };
  private listeners: Set<SelectionChangeCallback> = new Set();
  private allowedOrigins: string[];
  /** Bound handler reference for proper cleanup */
  private boundHandleMessage: ((event: MessageEvent<PreviewMessage>) => void) | null = null;
  /** Reference to the iframe element */
  private iframeElement: HTMLIFrameElement | null = null;
  /** Reference to the overlay element */
  private overlayElement: HTMLElement | null = null;
  
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
    
    // Handle window resize to update overlay position
    window.addEventListener('resize', this.updateOverlayPosition.bind(this));
  }
  
  /**
   * Set the iframe reference for coordinate calculations
   */
  setIframe(iframe: HTMLIFrameElement | null): void {
    this.iframeElement = iframe;
  }
  
  /**
   * Set the overlay element reference
   */
  setOverlay(overlay: HTMLElement | null): void {
    this.overlayElement = overlay;
  }
  
  /**
   * Cleanup listeners
   */
  destroy(): void {
    if (this.boundHandleMessage) {
      window.removeEventListener('message', this.boundHandleMessage);
      this.boundHandleMessage = null;
    }
    window.removeEventListener('resize', this.updateOverlayPosition.bind(this));
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
    this.hideOverlay();
  }
  
  /**
   * Handle messages from the preview sandbox
   * Story 8.1: Bidirectional postMessage Sync
   */
  private handleMessage(event: MessageEvent): void {
    // Validate origin (skip for local dev)
    if (this.allowedOrigins[0] !== '*' && !this.allowedOrigins.includes(event.origin)) {
      console.warn('Rejected message from origin:', event.origin);
      return;
    }
    
    const message = event.data;
    
    // Validate message structure
    if (!message || typeof message.type !== 'string') {
      return;
    }
    
    switch (message.type) {
      case 'element-selected':
        // New format from UtilityMaster iframe
        if (message.data && typeof message.data === 'object') {
          const metadata = message.data as ElementMetadata;
          
          // Update overlay position
          this.positionOverlay(metadata.rect);
          
          // Update state with selected element
          this.updateState({
            currentTarget: {
              id: metadata.id || `${metadata.tag}-${Date.now()}`,
              tag: metadata.tag,
              classes: metadata.classes,
              rect: metadata.rect,
            } as SelectedElement,
            isSelecting: false,
            selectedAt: Date.now(),
          });
        }
        break;
        
      case 'element_selected':
        // Legacy format
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
        this.clearSelection();
        break;
        
      case 'preview_ready':
        // Preview is ready - could trigger initial state sync
        console.log('Preview iframe ready');
        break;
        
      case 'preview_error':
        console.error('Preview error:', message.payload);
        break;
    }
  }
  
  /**
   * Story 8.2: Position the indigo selector overlay
   */
  private positionOverlay(rect: ElementMetadata['rect']): void {
    if (!this.overlayElement || !this.iframeElement) return;
    
    const iframeRect = this.iframeElement.getBoundingClientRect();
    
    // Calculate position relative to viewport, accounting for iframe position
    this.overlayElement.style.top = `${iframeRect.top + rect.top}px`;
    this.overlayElement.style.left = `${iframeRect.left + rect.left}px`;
    this.overlayElement.style.width = `${rect.width}px`;
    this.overlayElement.style.height = `${rect.height}px`;
    this.overlayElement.classList.add('visible');
  }
  
  /**
   * Update overlay position on window resize
   */
  private updateOverlayPosition(): void {
    const currentTarget = this.state.currentTarget as (SelectedElement & { rect?: ElementMetadata['rect'] }) | null;
    if (currentTarget?.rect) {
      this.positionOverlay(currentTarget.rect);
    }
  }
  
  /**
   * Hide the overlay
   */
  private hideOverlay(): void {
    if (this.overlayElement) {
      this.overlayElement.classList.remove('visible');
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
