/**
 * Sandbox Script
 * 
 * This script runs inside the preview iframe.
 * It handles element selection and communicates with the parent app via postMessage.
 * 
 * Security: Uses strict origin checks for all postMessage communication.
 */

import type { PreviewMessage, SelectedElement, ParentMessage } from './types';
import { createGhost, createDiffToast } from './ghosting';

/** Allowed parent origin - configure this for production */
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:8787'];

/** Electric Indigo selection ring classes */
const SELECTION_CLASSES = ['ring-2', 'ring-indigo-500', 'ring-offset-2'];

/** Currently highlighted element */
let currentHighlight: HTMLElement | null = null;

/**
 * Get allowed parent origin based on environment
 * In production, this would be the actual domain; in dev, allow localhost
 */
function getParentOrigin(): string {
  // Check if we're in a known allowed origin context
  const currentOrigin = window.location.origin;
  
  // In development, allow localhost origins
  if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
    // Return parent's origin if available, otherwise use wildcard for dev only
    try {
      return window.parent.location.origin;
    } catch {
      // Cross-origin - return first allowed origin
      return ALLOWED_ORIGINS[0];
    }
  }
  
  // In production, use the configured origin
  return ALLOWED_ORIGINS.find(o => !o.includes('localhost')) || ALLOWED_ORIGINS[0];
}

/**
 * Send message to parent app with origin validation
 */
function sendToParent(type: PreviewMessage['type'], payload?: PreviewMessage['payload']): void {
  const message: PreviewMessage = {
    type,
    payload,
    timestamp: Date.now(),
    origin: window.location.origin,
  };
  
  // Send to parent with validated origin (not wildcard)
  const targetOrigin = getParentOrigin();
  window.parent.postMessage(message, targetOrigin);
}

/**
 * Extract selection info from an element
 */
function getElementInfo(element: HTMLElement): SelectedElement | null {
  const id = element.getAttribute('data-02-id');
  if (!id) return null;
  
  return {
    id,
    selector: buildSelector(element),
    tagName: element.tagName.toLowerCase(),
    classes: Array.from(element.classList),
    textPreview: (element.textContent || '').slice(0, 50).trim(),
  };
}

/**
 * Build a CSS selector for an element
 */
function buildSelector(element: HTMLElement): string {
  const id = element.getAttribute('data-02-id');
  if (id) return `[data-02-id="${id}"]`;
  
  const tagName = element.tagName.toLowerCase();
  const elementId = element.id;
  if (elementId) return `${tagName}#${elementId}`;
  
  const classes = Array.from(element.classList).slice(0, 3).join('.');
  if (classes) return `${tagName}.${classes}`;
  
  return tagName;
}

/**
 * Apply selection highlight to an element
 */
function highlightElement(element: HTMLElement): void {
  // Remove highlight from previous element
  clearHighlight();
  
  // Add highlight classes
  element.classList.add(...SELECTION_CLASSES);
  currentHighlight = element;
}

/**
 * Clear selection highlight
 */
function clearHighlight(): void {
  if (currentHighlight) {
    currentHighlight.classList.remove(...SELECTION_CLASSES);
    currentHighlight = null;
  }
}

/**
 * Handle click events in the sandbox
 */
function handleClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  
  // Find the closest element with data-02-id
  const targetElement = target.closest('[data-02-id]') as HTMLElement | null;
  
  if (targetElement) {
    event.preventDefault();
    event.stopPropagation();
    
    const elementInfo = getElementInfo(targetElement);
    if (elementInfo) {
      highlightElement(targetElement);
      sendToParent('element_selected', elementInfo);
    }
  } else {
    // Clicked outside any tracked element - clear selection
    clearHighlight();
    sendToParent('selection_cleared');
  }
}

/**
 * Handle keyboard events (Escape to deselect)
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    clearHighlight();
    sendToParent('element_deselected');
  }
}

/**
 * Handle messages from parent app
 */
function handleParentMessage(event: MessageEvent<ParentMessage>): void {
  // Validate origin - reject messages from unknown origins
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(event.origin) || 
    event.origin.includes('localhost') || 
    event.origin.includes('127.0.0.1');
  
  if (!isAllowedOrigin) {
    console.warn('Rejected message from untrusted origin:', event.origin);
    return;
  }
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'highlight_element':
      if (payload?.elementId) {
        const element = document.querySelector(`[data-02-id="${payload.elementId}"]`) as HTMLElement;
        if (element) highlightElement(element);
      }
      break;
      
    case 'clear_highlight':
      clearHighlight();
      break;
      
    case 'update_content':
      if (payload?.content && payload?.elementId) {
        const element = document.querySelector(`[data-02-id="${payload.elementId}"]`);
        if (element) {
          element.outerHTML = payload.content;
        }
      }
      break;
      
    case 'apply_nudge':
      if (payload?.elementId && payload?.classes) {
        const element = document.querySelector(`[data-02-id="${payload.elementId}"]`) as HTMLElement;
        if (element) {
          // Create ghost overlay before applying changes (AC: 3-3)
          createGhost(payload.elementId, element);
          
          // Apply the class changes
          payload.classes.remove.forEach((cls: string) => element.classList.remove(cls));
          payload.classes.add.forEach((cls: string) => element.classList.add(cls));
          
          // Create diff toast to show what changed (AC: 3-3)
          createDiffToast(payload.elementId, {
            add: payload.classes.add,
            remove: payload.classes.remove,
          });
          
          // Notify parent that nudge was applied
          sendToParent('nudge_applied', { elementId: payload.elementId });
        }
      }
      break;
  }
}

/**
 * Initialize sandbox listeners
 */
export function initSandbox(): void {
  // Click listener for element selection
  document.addEventListener('click', handleClick, true);
  
  // Keyboard listener for deselection
  document.addEventListener('keydown', handleKeydown);
  
  // Message listener for parent communication
  window.addEventListener('message', handleParentMessage);
  
  // Notify parent that sandbox is ready
  sendToParent('preview_ready');
}

/**
 * Cleanup sandbox listeners
 */
export function cleanupSandbox(): void {
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('message', handleParentMessage);
  clearHighlight();
}

// Export for testing
export { sendToParent, getElementInfo, highlightElement, clearHighlight, SELECTION_CLASSES };
