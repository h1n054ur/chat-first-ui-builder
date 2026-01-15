import { describe, it, expect } from 'bun:test';
import {
  isProtectedAttribute,
  isModifiableAttribute,
  findProtectedAttributes,
  validateNudgePreservesLogic,
  safeApplyNudge,
  PROTECTED_ATTRIBUTE_PATTERNS,
  MODIFIABLE_ATTRIBUTES,
} from './logic-guard';

describe('Story 3.4: Preserve Custom User Logic during Nudges', () => {
  describe('isProtectedAttribute', () => {
    it('should protect onclick handlers', () => {
      expect(isProtectedAttribute('onclick')).toBe(true);
      expect(isProtectedAttribute('onClick')).toBe(true);
      expect(isProtectedAttribute('onSubmit')).toBe(true);
      expect(isProtectedAttribute('onMouseEnter')).toBe(true);
    });

    it('should protect HTMX attributes', () => {
      expect(isProtectedAttribute('hx-get')).toBe(true);
      expect(isProtectedAttribute('hx-post')).toBe(true);
      expect(isProtectedAttribute('hx-trigger')).toBe(true);
      expect(isProtectedAttribute('hx-swap')).toBe(true);
    });

    it('should protect Alpine.js attributes', () => {
      expect(isProtectedAttribute('x-data')).toBe(true);
      expect(isProtectedAttribute('x-show')).toBe(true);
      expect(isProtectedAttribute('@click')).toBe(true);
    });

    it('should protect Vue.js attributes', () => {
      expect(isProtectedAttribute('v-if')).toBe(true);
      expect(isProtectedAttribute('v-model')).toBe(true);
      expect(isProtectedAttribute(':class')).toBe(true);
    });

    it('should NOT protect class attribute', () => {
      expect(isProtectedAttribute('class')).toBe(false);
    });

    it('should NOT protect style attribute', () => {
      expect(isProtectedAttribute('style')).toBe(false);
    });
  });

  describe('isModifiableAttribute', () => {
    it('should allow class modification', () => {
      expect(isModifiableAttribute('class')).toBe(true);
      expect(isModifiableAttribute('className')).toBe(true);
    });

    it('should allow style modification', () => {
      expect(isModifiableAttribute('style')).toBe(true);
    });

    it('should NOT allow onclick modification', () => {
      expect(isModifiableAttribute('onclick')).toBe(false);
    });
  });

  describe('findProtectedAttributes', () => {
    it('should find onclick handler', () => {
      const tag = '<button onclick="handleClick()" class="px-4">Click</button>';
      const protected_ = findProtectedAttributes(tag);
      expect(protected_).toContain('onclick');
    });

    it('should find multiple protected attributes', () => {
      const tag = '<form onsubmit="handleSubmit()" hx-post="/api/submit" class="space-y-4">';
      const protected_ = findProtectedAttributes(tag);
      expect(protected_).toContain('onsubmit');
      expect(protected_).toContain('hx-post');
    });

    it('should return empty for tag with no protected attributes', () => {
      const tag = '<div class="p-4" id="card">Content</div>';
      const protected_ = findProtectedAttributes(tag);
      expect(protected_).toHaveLength(0);
    });
  });

  describe('validateNudgePreservesLogic', () => {
    it('should pass when only class is modified', () => {
      const original = '<button onclick="alert(1)" class="px-4 py-2">Click</button>';
      const modified = '<button onclick="alert(1)" class="px-6 py-3">Click</button>';

      const result = validateNudgePreservesLogic(original, modified);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail when onclick is removed', () => {
      const original = '<button onclick="alert(1)" class="px-4">Click</button>';
      const modified = '<button class="px-4">Click</button>';

      const result = validateNudgePreservesLogic(original, modified);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('onclick');
    });

    it('should fail when onclick is modified', () => {
      const original = '<button onclick="handleClick()" class="px-4">Click</button>';
      const modified = '<button onclick="evilCode()" class="px-4">Click</button>';

      const result = validateNudgePreservesLogic(original, modified);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('onclick');
    });

    it('should fail when tag structure changes', () => {
      const original = '<div class="p-4"><span>Text</span></div>';
      const modified = '<div class="p-4"><span>Text</span><span>Extra</span></div>';

      const result = validateNudgePreservesLogic(original, modified);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('hierarchy');
    });

    it('should pass when HTMX attributes are preserved', () => {
      const original = '<button hx-post="/api/save" hx-swap="innerHTML" class="btn">Save</button>';
      const modified = '<button hx-post="/api/save" hx-swap="innerHTML" class="btn-lg">Save</button>';

      const result = validateNudgePreservesLogic(original, modified);
      expect(result.valid).toBe(true);
    });
  });

  describe('safeApplyNudge', () => {
    it('should apply nudge while preserving onclick', () => {
      const original = '<button data-02-id="btn_1" onclick="handleClick()" class="px-4 py-2 bg-blue-500">Submit</button>';

      const result = safeApplyNudge(original, 'btn_1', ['px-6', 'py-3'], ['px-4', 'py-2']);

      expect(result.success).toBe(true);
      expect(result.jsx).toContain('onclick="handleClick()"');
      expect(result.jsx).toContain('px-6');
      expect(result.jsx).toContain('py-3');
      expect(result.jsx).not.toContain('px-4 ');
      expect(result.jsx).not.toContain('py-2 ');
    });

    it('should fail for non-existent element', () => {
      const original = '<button data-02-id="btn_1" class="px-4">Click</button>';

      const result = safeApplyNudge(original, 'btn_999', ['px-6'], []);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should preserve HTMX attributes', () => {
      const original = '<div data-02-id="form_1" hx-post="/api/data" hx-trigger="submit" class="p-4">Form</div>';

      const result = safeApplyNudge(original, 'form_1', ['p-6', 'bg-white'], ['p-4']);

      expect(result.success).toBe(true);
      expect(result.jsx).toContain('hx-post="/api/data"');
      expect(result.jsx).toContain('hx-trigger="submit"');
    });

    it('should preserve multiple event handlers', () => {
      const original = '<input data-02-id="input_1" onchange="validate()" onfocus="highlight()" class="border p-2" />';

      const result = safeApplyNudge(original, 'input_1', ['border-2', 'p-3'], ['border', 'p-2']);

      expect(result.success).toBe(true);
      expect(result.jsx).toContain('onchange="validate()"');
      expect(result.jsx).toContain('onfocus="highlight()"');
    });
  });

  describe('AC1: Only Tailwind classes modified', () => {
    it('should only modify class attribute during nudge', () => {
      const original = `
        <button 
          data-02-id="cta_btn"
          onclick="trackClick('cta')"
          onmouseover="showTooltip()"
          class="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Get Started
        </button>
      `;

      const result = safeApplyNudge(
        original,
        'cta_btn',
        ['px-6', 'py-3', 'bg-indigo-700', 'rounded-lg', 'shadow-lg'],
        ['px-4', 'py-2', 'bg-indigo-600', 'rounded']
      );

      expect(result.success).toBe(true);
      // Event handlers preserved
      expect(result.jsx).toContain("onclick=\"trackClick('cta')\"");
      expect(result.jsx).toContain('onmouseover="showTooltip()"');
      // Classes updated
      expect(result.jsx).toContain('px-6');
      expect(result.jsx).toContain('shadow-lg');
    });
  });

  describe('AC2: Functional logic preserved 100%', () => {
    it('should preserve all types of event handlers', () => {
      const handlers = [
        'onclick="a()"',
        'onsubmit="b()"',
        'onchange="c()"',
        'onfocus="d()"',
        'onblur="e()"',
      ];

      for (const handler of handlers) {
        const original = `<div data-02-id="test" ${handler} class="p-4">Test</div>`;
        const result = safeApplyNudge(original, 'test', ['p-6'], ['p-4']);

        expect(result.success).toBe(true);
        expect(result.jsx).toContain(handler);
      }
    });
  });

  describe('AC3: Custom logic still functions', () => {
    it('should not alter complex handler expressions', () => {
      const original = `<button data-02-id="btn" onclick="handleClick(event, { id: 123, action: 'submit' })" class="btn">Click</button>`;

      const result = safeApplyNudge(original, 'btn', ['btn-lg'], ['btn']);

      expect(result.success).toBe(true);
      expect(result.jsx).toContain("handleClick(event, { id: 123, action: 'submit' })");
    });
  });
});
