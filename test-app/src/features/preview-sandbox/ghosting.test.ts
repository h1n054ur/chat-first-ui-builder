import { describe, it, expect, beforeEach } from 'bun:test';
import {
  DEFAULT_GHOSTING_CONFIG,
  DEFAULT_TOAST_CONFIG,
  createDiffToast,
  getActiveToasts,
  dismissToast,
  clearAllToasts,
  formatDeltaForDisplay,
  type GhostState,
  type DiffToastState,
} from './ghosting';
import type { StyleDelta } from '../nudge-engine/patcher';

describe('Story 3.3: Visual Diff Feedback (Ghosting)', () => {
  beforeEach(() => {
    clearAllToasts();
  });

  describe('Ghosting Configuration', () => {
    it('should have default fade duration of 2 seconds', () => {
      expect(DEFAULT_GHOSTING_CONFIG.fadeDuration).toBe(2000);
    });

    it('should have default initial opacity of 0.5', () => {
      expect(DEFAULT_GHOSTING_CONFIG.initialOpacity).toBe(0.5);
    });

    it('should have appropriate z-index', () => {
      expect(DEFAULT_GHOSTING_CONFIG.zIndex).toBe(50);
    });
  });

  describe('GhostState Interface', () => {
    it('should support required properties', () => {
      const ghost: GhostState = {
        id: 'ghost_comp_1_123',
        originalHtml: '<div class="p-4">Content</div>',
        createdAt: Date.now(),
        isVisible: true,
      };

      expect(ghost.id).toContain('ghost_');
      expect(ghost.originalHtml).toContain('div');
      expect(ghost.isVisible).toBe(true);
    });
  });

  describe('Diff Toast', () => {
    it('should create toast with delta', () => {
      const delta: StyleDelta = {
        add: ['p-6', 'shadow-lg'],
        remove: ['p-4'],
      };

      const toast = createDiffToast('comp_1', delta);

      expect(toast.id).toContain('toast_comp_1');
      expect(toast.delta).toEqual(delta);
      expect(toast.elementId).toBe('comp_1');
      expect(toast.createdAt).toBeLessThanOrEqual(Date.now());
    });

    it('should track active toasts', () => {
      const delta: StyleDelta = { add: ['p-6'], remove: [] };
      
      createDiffToast('comp_1', delta);
      createDiffToast('comp_2', delta);

      expect(getActiveToasts()).toHaveLength(2);
    });

    it('should dismiss specific toast', () => {
      const delta: StyleDelta = { add: ['p-6'], remove: [] };
      
      const toast1 = createDiffToast('comp_1', delta);
      createDiffToast('comp_2', delta);

      const result = dismissToast(toast1.id);

      expect(result).toBe(true);
      expect(getActiveToasts()).toHaveLength(1);
    });

    it('should return false when dismissing non-existent toast', () => {
      const result = dismissToast('non_existent_toast');
      expect(result).toBe(false);
    });

    it('should clear all toasts', () => {
      const delta: StyleDelta = { add: ['p-6'], remove: [] };
      
      createDiffToast('comp_1', delta);
      createDiffToast('comp_2', delta);
      createDiffToast('comp_3', delta);

      clearAllToasts();

      expect(getActiveToasts()).toHaveLength(0);
    });

    it('should have default duration of 4 seconds', () => {
      expect(DEFAULT_TOAST_CONFIG.duration).toBe(4000);
    });

    it('should have default position of bottom-right', () => {
      expect(DEFAULT_TOAST_CONFIG.position).toBe('bottom-right');
    });
  });

  describe('formatDeltaForDisplay', () => {
    it('should format added classes', () => {
      const delta: StyleDelta = { add: ['p-6', 'shadow-lg'], remove: [] };
      const result = formatDeltaForDisplay(delta);

      expect(result.added).toBe('+p-6 +shadow-lg');
      expect(result.removed).toBe('');
    });

    it('should format removed classes', () => {
      const delta: StyleDelta = { add: [], remove: ['p-4', 'shadow'] };
      const result = formatDeltaForDisplay(delta);

      expect(result.added).toBe('');
      expect(result.removed).toBe('-p-4 -shadow');
    });

    it('should format both added and removed', () => {
      const delta: StyleDelta = {
        add: ['p-6'],
        remove: ['p-4'],
      };
      const result = formatDeltaForDisplay(delta);

      expect(result.added).toBe('+p-6');
      expect(result.removed).toBe('-p-4');
    });

    it('should handle empty delta', () => {
      const delta: StyleDelta = { add: [], remove: [] };
      const result = formatDeltaForDisplay(delta);

      expect(result.added).toBe('');
      expect(result.removed).toBe('');
    });
  });

  describe('AC1: Ghosting for 2 seconds', () => {
    it('should configure fade duration to 2000ms', () => {
      expect(DEFAULT_GHOSTING_CONFIG.fadeDuration).toBe(2000);
    });
  });

  describe('AC2: Diff Toast with class changes', () => {
    it('should include add and remove arrays in toast', () => {
      const delta: StyleDelta = {
        add: ['px-6', 'py-3', 'rounded-lg'],
        remove: ['px-4', 'py-2', 'rounded'],
      };

      const toast = createDiffToast('btn_1', delta);

      expect(toast.delta.add).toContain('px-6');
      expect(toast.delta.add).toContain('py-3');
      expect(toast.delta.remove).toContain('px-4');
      expect(toast.delta.remove).toContain('py-2');
    });
  });
});
