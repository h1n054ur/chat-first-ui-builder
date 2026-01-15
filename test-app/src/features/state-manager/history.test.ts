import { describe, it, expect, beforeEach } from 'bun:test';
import {
  createHistoryState,
  pushHistory,
  undo,
  redo,
  getCurrentAst,
  getHistorySummary,
  clearHistory,
  MAX_HISTORY_SIZE,
  type HistoryState,
} from './history';
import type { ASTComponent } from '../nudge-engine/patcher';

describe('Story 4.1: Undo/Redo Visual Changes', () => {
  let initialState: HistoryState;

  beforeEach(() => {
    initialState = createHistoryState({
      comp_1: {
        id: 'comp_1',
        jsx: '<div class="p-4">Initial</div>',
        createdAt: '2026-01-15T10:00:00Z',
      },
    });
  });

  describe('createHistoryState', () => {
    it('should create initial history with one entry', () => {
      const state = createHistoryState();
      expect(state.entries).toHaveLength(1);
      expect(state.currentIndex).toBe(0);
      expect(state.canUndo).toBe(false);
      expect(state.canRedo).toBe(false);
    });

    it('should include initial AST in first entry', () => {
      const ast: Record<string, ASTComponent> = {
        comp_1: { id: 'comp_1', jsx: '<div>Test</div>', createdAt: '2026-01-15T10:00:00Z' },
      };
      const state = createHistoryState(ast);
      expect(state.entries[0].ast.comp_1).toBeDefined();
    });
  });

  describe('pushHistory', () => {
    it('should add new entry to history', () => {
      const newAst: Record<string, ASTComponent> = {
        comp_1: {
          id: 'comp_1',
          jsx: '<div class="p-6">Updated</div>',
          createdAt: '2026-01-15T10:00:00Z',
        },
      };

      const newState = pushHistory(initialState, newAst, 'Added padding');

      expect(newState.entries).toHaveLength(2);
      expect(newState.canUndo).toBe(true);
      expect(newState.canRedo).toBe(false);
    });

    it('should cap history at MAX_HISTORY_SIZE', () => {
      let state = initialState;

      // Push more than MAX_HISTORY_SIZE entries
      for (let i = 0; i < MAX_HISTORY_SIZE + 10; i++) {
        state = pushHistory(state, { [`comp_${i}`]: { id: `comp_${i}`, jsx: `<div>${i}</div>`, createdAt: '' } }, `Change ${i}`);
      }

      expect(state.entries.length).toBeLessThanOrEqual(MAX_HISTORY_SIZE);
    });

    it('should truncate forward history when pushing from non-current position', () => {
      // Push two changes
      let state = pushHistory(initialState, { comp_1: { id: 'comp_1', jsx: '<div>V2</div>', createdAt: '' } }, 'V2');
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V3</div>', createdAt: '' } }, 'V3');

      expect(state.entries).toHaveLength(3);

      // Undo once
      const { state: undoneState } = undo(state);

      // Push a new change (should truncate V3)
      const newState = pushHistory(undoneState!, { comp_1: { id: 'comp_1', jsx: '<div>V4</div>', createdAt: '' } }, 'V4');

      expect(newState.entries).toHaveLength(3); // Initial, V2, V4 (V3 truncated)
      expect(newState.canRedo).toBe(false);
    });
  });

  describe('undo', () => {
    it('should return previous AST state', () => {
      const v2Ast: Record<string, ASTComponent> = {
        comp_1: { id: 'comp_1', jsx: '<div class="p-6">V2</div>', createdAt: '' },
      };
      const state = pushHistory(initialState, v2Ast, 'V2');

      const { state: undoneState, ast } = undo(state);

      expect(undoneState!.canUndo).toBe(false);
      expect(undoneState!.canRedo).toBe(true);
      expect(ast!.comp_1.jsx).toContain('p-4'); // Back to initial
    });

    it('should not undo when at beginning', () => {
      const { state: undoneState, ast } = undo(initialState);

      expect(undoneState).toBe(initialState);
      expect(ast).toBeNull();
    });

    it('should support multiple undos', () => {
      let state = initialState;
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V2</div>', createdAt: '' } }, 'V2');
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V3</div>', createdAt: '' } }, 'V3');

      let { state: s1, ast: a1 } = undo(state);
      expect(a1!.comp_1.jsx).toContain('V2');

      let { state: s2, ast: a2 } = undo(s1!);
      expect(a2!.comp_1.jsx).toContain('Initial');
    });
  });

  describe('redo', () => {
    it('should return next AST state after undo', () => {
      const v2Ast: Record<string, ASTComponent> = {
        comp_1: { id: 'comp_1', jsx: '<div class="p-6">V2</div>', createdAt: '' },
      };
      let state = pushHistory(initialState, v2Ast, 'V2');
      const { state: undoneState } = undo(state);

      const { state: redoneState, ast } = redo(undoneState!);

      expect(redoneState!.canRedo).toBe(false);
      expect(redoneState!.canUndo).toBe(true);
      expect(ast!.comp_1.jsx).toContain('p-6'); // Back to V2
    });

    it('should not redo when at most recent', () => {
      const { state: redoneState, ast } = redo(initialState);

      expect(redoneState).toBe(initialState);
      expect(ast).toBeNull();
    });

    it('should support multiple redos', () => {
      let state = initialState;
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V2</div>', createdAt: '' } }, 'V2');
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V3</div>', createdAt: '' } }, 'V3');

      // Undo twice
      let { state: s1 } = undo(state);
      let { state: s2 } = undo(s1!);

      // Redo twice
      let { state: s3, ast: a1 } = redo(s2!);
      expect(a1!.comp_1.jsx).toContain('V2');

      let { state: s4, ast: a2 } = redo(s3!);
      expect(a2!.comp_1.jsx).toContain('V3');
    });
  });

  describe('getCurrentAst', () => {
    it('should return current AST based on index', () => {
      let state = initialState;
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V2</div>', createdAt: '' } }, 'V2');

      const current = getCurrentAst(state);
      expect(current.comp_1.jsx).toContain('V2');

      const { state: undoneState } = undo(state);
      const previous = getCurrentAst(undoneState!);
      expect(previous.comp_1.jsx).toContain('Initial');
    });
  });

  describe('getHistorySummary', () => {
    it('should return history metadata', () => {
      let state = initialState;
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V2</div>', createdAt: '' } }, 'Added padding');

      const summary = getHistorySummary(state);

      expect(summary.total).toBe(2);
      expect(summary.current).toBe(2);
      expect(summary.canUndo).toBe(true);
      expect(summary.canRedo).toBe(false);
      expect(summary.recentEntries).toHaveLength(2);
    });
  });

  describe('clearHistory', () => {
    it('should keep only current state', () => {
      let state = initialState;
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V2</div>', createdAt: '' } }, 'V2');
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V3</div>', createdAt: '' } }, 'V3');

      const cleared = clearHistory(state);

      expect(cleared.entries).toHaveLength(1);
      expect(cleared.canUndo).toBe(false);
      expect(cleared.canRedo).toBe(false);
    });
  });

  describe('AC1: Revert to previous state', () => {
    it('should revert to previous transactional state', () => {
      let state = initialState;
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div class="p-8">Large padding</div>', createdAt: '' } }, 'Nudge: more air');

      const { ast } = undo(state);

      expect(ast!.comp_1.jsx).toContain('p-4');
      expect(ast!.comp_1.jsx).not.toContain('p-8');
    });
  });

  describe('AC2: Immediate preview update', () => {
    it('should return AST immediately (no async)', () => {
      let state = initialState;
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>New</div>', createdAt: '' } }, 'Update');

      const start = performance.now();
      const { ast } = undo(state);
      const elapsed = performance.now() - start;

      expect(ast).not.toBeNull();
      expect(elapsed).toBeLessThan(10); // Should be instant
    });
  });

  describe('AC3: Navigate history', () => {
    it('should navigate full history with undo/redo', () => {
      let state = initialState;
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V2</div>', createdAt: '' } }, 'V2');
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V3</div>', createdAt: '' } }, 'V3');
      state = pushHistory(state, { comp_1: { id: 'comp_1', jsx: '<div>V4</div>', createdAt: '' } }, 'V4');

      // Start at V4
      expect(getCurrentAst(state).comp_1.jsx).toContain('V4');

      // Undo to V3
      let { state: s1 } = undo(state);
      expect(getCurrentAst(s1!).comp_1.jsx).toContain('V3');

      // Undo to V2
      let { state: s2 } = undo(s1!);
      expect(getCurrentAst(s2!).comp_1.jsx).toContain('V2');

      // Redo to V3
      let { state: s3 } = redo(s2!);
      expect(getCurrentAst(s3!).comp_1.jsx).toContain('V3');

      // Redo to V4
      let { state: s4 } = redo(s3!);
      expect(getCurrentAst(s4!).comp_1.jsx).toContain('V4');
    });
  });
});
