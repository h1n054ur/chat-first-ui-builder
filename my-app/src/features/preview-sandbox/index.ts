/**
 * Preview Sandbox Feature
 * 
 * Handles communication between the preview iframe and the parent app.
 * Supports element selection, highlighting, and nudge application.
 */

export * from './types';
export * from './selection-manager';
export * from './ghosting';
export { 
  initSandbox, 
  cleanupSandbox,
  SELECTION_CLASSES 
} from './sandbox-script';
