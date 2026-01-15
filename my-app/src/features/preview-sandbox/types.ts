/**
 * Preview Sandbox Types
 * 
 * Types for communication between preview sandbox (iframe) and parent app.
 */

/** Message types for postMessage communication */
export type PreviewMessageType = 
  | 'element_selected'
  | 'element_deselected'
  | 'selection_cleared'
  | 'preview_ready'
  | 'preview_error';

/** Element selection info passed from sandbox to parent */
export interface SelectedElement {
  /** The data-02-id attribute value */
  id: string;
  /** CSS selector for the element */
  selector: string;
  /** Tag name (e.g., 'button', 'div') */
  tagName: string;
  /** Current Tailwind classes */
  classes: string[];
  /** Text content preview (first 50 chars) */
  textPreview: string;
}

/** Message from sandbox to parent app */
export interface PreviewMessage {
  type: PreviewMessageType;
  payload?: SelectedElement | string;
  timestamp: number;
  origin: string;
}

/** Message from parent to sandbox */
export type ParentMessageType = 
  | 'highlight_element'
  | 'clear_highlight'
  | 'update_content'
  | 'apply_nudge';

export interface ParentMessage {
  type: ParentMessageType;
  payload?: {
    elementId?: string;
    content?: string;
    classes?: { add: string[]; remove: string[] };
  };
  timestamp: number;
}

/** Selection state in the app */
export interface SelectionState {
  /** Currently selected element, or null if nothing selected */
  currentTarget: SelectedElement | null;
  /** Whether selection mode is active */
  isSelecting: boolean;
  /** Timestamp of last selection */
  selectedAt: number | null;
}

/** Initial selection state */
export const initialSelectionState: SelectionState = {
  currentTarget: null,
  isSelecting: false,
  selectedAt: null,
};
