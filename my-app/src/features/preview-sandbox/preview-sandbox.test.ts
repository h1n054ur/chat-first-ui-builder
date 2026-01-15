import { describe, it, expect, beforeEach } from 'bun:test';
import { 
  SelectionManager,
  initialSelectionState,
  type SelectedElement,
  type PreviewMessage,
  SELECTION_CLASSES,
} from './index';

describe('Story 3.1: Point-and-Chat Component Targeting', () => {
  describe('Selection State Types', () => {
    it('should have correct initial selection state', () => {
      expect(initialSelectionState.currentTarget).toBeNull();
      expect(initialSelectionState.isSelecting).toBe(false);
      expect(initialSelectionState.selectedAt).toBeNull();
    });

    it('should define selection highlight classes', () => {
      expect(SELECTION_CLASSES).toContain('ring-2');
      expect(SELECTION_CLASSES).toContain('ring-indigo-500');
      expect(SELECTION_CLASSES).toContain('ring-offset-2');
    });
  });

  describe('SelectionManager', () => {
    let manager: SelectionManager;

    beforeEach(() => {
      manager = new SelectionManager(['*']);
    });

    it('should initialize with empty selection', () => {
      expect(manager.hasSelection()).toBe(false);
      expect(manager.getCurrentTarget()).toBeNull();
    });

    it('should select an element programmatically', () => {
      const element: SelectedElement = {
        id: 'comp_123',
        selector: '[data-02-id="comp_123"]',
        tagName: 'button',
        classes: ['px-4', 'py-2', 'bg-blue-500'],
        textPreview: 'Click me',
      };

      manager.selectElement(element);

      expect(manager.hasSelection()).toBe(true);
      expect(manager.getCurrentTarget()).toEqual(element);
      expect(manager.getState().selectedAt).not.toBeNull();
    });

    it('should clear selection', () => {
      const element: SelectedElement = {
        id: 'comp_123',
        selector: '[data-02-id="comp_123"]',
        tagName: 'button',
        classes: ['px-4'],
        textPreview: 'Test',
      };

      manager.selectElement(element);
      expect(manager.hasSelection()).toBe(true);

      manager.clearSelection();
      expect(manager.hasSelection()).toBe(false);
      expect(manager.getCurrentTarget()).toBeNull();
    });

    it('should notify listeners on selection change', () => {
      let callCount = 0;
      let lastState = initialSelectionState;

      manager.subscribe((state) => {
        callCount++;
        lastState = state;
      });

      // Initial call on subscribe
      expect(callCount).toBe(1);

      const element: SelectedElement = {
        id: 'comp_456',
        selector: '[data-02-id="comp_456"]',
        tagName: 'div',
        classes: ['p-4'],
        textPreview: 'Card',
      };

      manager.selectElement(element);
      expect(callCount).toBe(2);
      expect(lastState.currentTarget).toEqual(element);
    });

    it('should allow unsubscribing from changes', () => {
      let callCount = 0;

      const unsubscribe = manager.subscribe(() => {
        callCount++;
      });

      expect(callCount).toBe(1); // Initial call

      unsubscribe();

      manager.selectElement({
        id: 'test',
        selector: '[data-02-id="test"]',
        tagName: 'span',
        classes: [],
        textPreview: '',
      });

      // Should not have been called again
      expect(callCount).toBe(1);
    });
  });

  describe('SelectedElement Interface', () => {
    it('should support all required properties', () => {
      const element: SelectedElement = {
        id: 'hero_section',
        selector: '[data-02-id="hero_section"]',
        tagName: 'section',
        classes: ['min-h-screen', 'flex', 'items-center', 'bg-gradient-to-r'],
        textPreview: 'Welcome to our amazing product...',
      };

      expect(element.id).toBe('hero_section');
      expect(element.tagName).toBe('section');
      expect(element.classes).toHaveLength(4);
      expect(element.textPreview.length).toBeLessThanOrEqual(50);
    });
  });

  describe('PreviewMessage Interface', () => {
    it('should support element_selected message', () => {
      const message: PreviewMessage = {
        type: 'element_selected',
        payload: {
          id: 'btn_1',
          selector: '[data-02-id="btn_1"]',
          tagName: 'button',
          classes: ['px-4', 'py-2'],
          textPreview: 'Submit',
        },
        timestamp: Date.now(),
        origin: 'http://localhost:5173',
      };

      expect(message.type).toBe('element_selected');
      expect(message.payload).toBeDefined();
    });

    it('should support selection_cleared message', () => {
      const message: PreviewMessage = {
        type: 'selection_cleared',
        timestamp: Date.now(),
        origin: 'http://localhost:5173',
      };

      expect(message.type).toBe('selection_cleared');
      expect(message.payload).toBeUndefined();
    });
  });
});
