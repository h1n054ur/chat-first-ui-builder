import { describe, it, expect } from 'bun:test';
import {
  extractClasses,
  applyDelta,
  validateDelta,
  applyNudgeToAST,
  type StyleDelta,
  type ASTComponent,
} from './patcher';

describe('Story 3.2: Apply Visual Nudge (Style Delta)', () => {
  describe('extractClasses', () => {
    it('should extract classes from element with data-02-id', () => {
      const jsx = '<div data-02-id="comp_1" class="p-4 bg-white rounded">Content</div>';
      const classes = extractClasses(jsx, 'comp_1');
      expect(classes).toEqual(['p-4', 'bg-white', 'rounded']);
    });

    it('should handle class before data-02-id', () => {
      const jsx = '<button class="px-4 py-2 bg-blue-500" data-02-id="btn_1">Click</button>';
      const classes = extractClasses(jsx, 'btn_1');
      expect(classes).toEqual(['px-4', 'py-2', 'bg-blue-500']);
    });

    it('should return empty array for non-existent element', () => {
      const jsx = '<div data-02-id="comp_1" class="p-4">Content</div>';
      const classes = extractClasses(jsx, 'comp_999');
      expect(classes).toEqual([]);
    });
  });

  describe('applyDelta', () => {
    it('should add classes to element', () => {
      const jsx = '<div data-02-id="comp_1" class="p-4">Content</div>';
      const delta: StyleDelta = { add: ['p-6', 'shadow-lg'], remove: [] };
      
      const result = applyDelta(jsx, 'comp_1', delta);
      
      expect(result.success).toBe(true);
      expect(result.newClasses).toContain('p-4');
      expect(result.newClasses).toContain('p-6');
      expect(result.newClasses).toContain('shadow-lg');
    });

    it('should remove classes from element', () => {
      const jsx = '<div data-02-id="comp_1" class="p-4 p-6 shadow-lg">Content</div>';
      const delta: StyleDelta = { add: [], remove: ['p-4', 'shadow-lg'] };
      
      const result = applyDelta(jsx, 'comp_1', delta);
      
      expect(result.success).toBe(true);
      expect(result.newClasses).not.toContain('p-4');
      expect(result.newClasses).not.toContain('shadow-lg');
      expect(result.newClasses).toContain('p-6');
    });

    it('should add and remove classes in single operation', () => {
      const jsx = '<button data-02-id="btn_1" class="px-4 py-2 bg-blue-500">Submit</button>';
      const delta: StyleDelta = { add: ['px-6', 'py-3'], remove: ['px-4', 'py-2'] };
      
      const result = applyDelta(jsx, 'btn_1', delta);
      
      expect(result.success).toBe(true);
      expect(result.previousClasses).toEqual(['px-4', 'py-2', 'bg-blue-500']);
      expect(result.newClasses).toContain('px-6');
      expect(result.newClasses).toContain('py-3');
      expect(result.newClasses).toContain('bg-blue-500');
      expect(result.newClasses).not.toContain('px-4');
      expect(result.newClasses).not.toContain('py-2');
    });

    it('should fail gracefully for non-existent element', () => {
      const jsx = '<div data-02-id="comp_1" class="p-4">Content</div>';
      const delta: StyleDelta = { add: ['p-6'], remove: [] };
      
      const result = applyDelta(jsx, 'comp_999', delta);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not find element');
    });

    it('should preserve other attributes', () => {
      const jsx = '<button data-02-id="btn_1" class="px-4" onclick="handleClick()">Click</button>';
      const delta: StyleDelta = { add: ['px-6'], remove: ['px-4'] };
      
      const result = applyDelta(jsx, 'btn_1', delta);
      
      expect(result.success).toBe(true);
      expect(result.jsx).toContain('onclick="handleClick()"');
    });
  });

  describe('validateDelta', () => {
    it('should accept valid delta', () => {
      const delta: StyleDelta = {
        add: ['p-4', 'bg-white', 'rounded-lg'],
        remove: ['p-2', 'bg-gray-100'],
      };
      
      const result = validateDelta(delta);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject delta with HTML characters', () => {
      const delta: StyleDelta = {
        add: ['<script>alert(1)</script>'],
        remove: [],
      };
      
      const result = validateDelta(delta);
      expect(result.valid).toBe(false);
      expect(result.issues[0]).toContain('HTML characters');
    });

    it('should reject delta with javascript protocol', () => {
      const delta: StyleDelta = {
        add: ['javascript:alert(1)'],
        remove: [],
      };
      
      const result = validateDelta(delta);
      expect(result.valid).toBe(false);
      expect(result.issues[0]).toContain('javascript protocol');
    });

    it('should reject overly long class names', () => {
      const delta: StyleDelta = {
        add: ['a'.repeat(101)],
        remove: [],
      };
      
      const result = validateDelta(delta);
      expect(result.valid).toBe(false);
      expect(result.issues[0]).toContain('maximum length');
    });
  });

  describe('applyNudgeToAST', () => {
    it('should update component in AST', () => {
      const ast: Record<string, ASTComponent> = {
        comp_1: {
          id: 'comp_1',
          jsx: '<div data-02-id="comp_1" class="p-4 bg-white">Card</div>',
          classes: ['p-4', 'bg-white'],
          createdAt: '2026-01-15T10:00:00Z',
        },
      };
      
      const delta: StyleDelta = { add: ['shadow-lg', 'rounded'], remove: [] };
      const result = applyNudgeToAST(ast, 'comp_1', delta);
      
      expect(result.success).toBe(true);
      expect(result.ast.comp_1.classes).toContain('shadow-lg');
      expect(result.ast.comp_1.classes).toContain('rounded');
      expect(result.ast.comp_1.updatedAt).toBeDefined();
    });

    it('should fail for non-existent component', () => {
      const ast: Record<string, ASTComponent> = {};
      const delta: StyleDelta = { add: ['p-4'], remove: [] };
      
      const result = applyNudgeToAST(ast, 'comp_999', delta);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found in AST');
    });

    it('should reject invalid delta', () => {
      const ast: Record<string, ASTComponent> = {
        comp_1: {
          id: 'comp_1',
          jsx: '<div data-02-id="comp_1" class="p-4">Content</div>',
          createdAt: '2026-01-15T10:00:00Z',
        },
      };
      
      const delta: StyleDelta = { add: ['<script>bad</script>'], remove: [] };
      const result = applyNudgeToAST(ast, 'comp_1', delta);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid delta');
    });
  });

  describe('AC3: <200ms performance', () => {
    it('should apply nudge in under 200ms', () => {
      const ast: Record<string, ASTComponent> = {
        comp_1: {
          id: 'comp_1',
          jsx: '<div data-02-id="comp_1" class="p-4 bg-white rounded shadow">Complex component with many classes</div>',
          classes: ['p-4', 'bg-white', 'rounded', 'shadow'],
          createdAt: '2026-01-15T10:00:00Z',
        },
      };
      
      const delta: StyleDelta = { 
        add: ['p-6', 'bg-slate-50', 'rounded-lg', 'shadow-lg', 'border', 'border-slate-200'],
        remove: ['p-4', 'bg-white', 'rounded', 'shadow'],
      };
      
      const start = performance.now();
      const result = applyNudgeToAST(ast, 'comp_1', delta);
      const elapsed = performance.now() - start;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(200); // Must complete in <200ms
    });
  });
});
