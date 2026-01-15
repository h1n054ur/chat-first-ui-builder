/**
 * AST Patcher
 * 
 * Applies style deltas (Tailwind class changes) to the component AST.
 * CRITICAL: Only modifies class/style attributes - never touches structure or logic.
 * 
 * Per Project Context: "AI agents MUST NOT modify component structure during nudges"
 * 
 * Integrates with Logic Guard to ensure protected attributes are never modified.
 */

import { validateNudgePreservesLogic } from './logic-guard';

/** Style delta from AI */
export interface StyleDelta {
  add: string[];
  remove: string[];
}

/** Component in the AST */
export interface ASTComponent {
  id: string;
  jsx: string;
  classes?: string[];
  createdAt: string;
  updatedAt?: string;
}

/** Patch result */
export interface PatchResult {
  success: boolean;
  jsx: string;
  appliedDelta: StyleDelta;
  previousClasses: string[];
  newClasses: string[];
  error?: string;
}

/**
 * Extract classes from a class attribute in JSX
 */
export function extractClasses(jsx: string, elementId: string): string[] {
  // Find the element with the given data-02-id
  const idPattern = new RegExp(`data-02-id=["']${elementId}["'][^>]*class=["']([^"']*)["']`, 'i');
  const idPatternAlt = new RegExp(`class=["']([^"']*)["'][^>]*data-02-id=["']${elementId}["']`, 'i');
  
  let match = jsx.match(idPattern);
  if (!match) {
    match = jsx.match(idPatternAlt);
  }
  
  if (!match) {
    // Only fallback to root element if no elementId was specified
    if (!elementId) {
      const rootClassMatch = jsx.match(/^<\w+[^>]*class=["']([^"']*)["']/);
      if (rootClassMatch) {
        return rootClassMatch[1].split(/\s+/).filter(Boolean);
      }
    }
    return [];
  }
  
  return match[1].split(/\s+/).filter(Boolean);
}

/**
 * Apply a style delta to a specific element in the JSX
 */
export function applyDelta(jsx: string, elementId: string, delta: StyleDelta): PatchResult {
  const previousClasses = extractClasses(jsx, elementId);
  
  // Calculate new classes
  const classSet = new Set(previousClasses);
  
  // Remove classes
  delta.remove.forEach(cls => classSet.delete(cls));
  
  // Add classes
  delta.add.forEach(cls => classSet.add(cls));
  
  const newClasses = Array.from(classSet);
  const newClassString = newClasses.join(' ');
  
  // Build pattern to find and replace the class attribute
  // Need to handle both orders: data-02-id before class, and class before data-02-id
  let updatedJsx = jsx;
  let patched = false;
  
  // Pattern 1: data-02-id comes before class
  const pattern1 = new RegExp(
    `(data-02-id=["']${elementId}["'][^>]*class=["'])([^"']*)["']`,
    'i'
  );
  if (pattern1.test(updatedJsx)) {
    updatedJsx = updatedJsx.replace(pattern1, `$1${newClassString}"`);
    patched = true;
  }
  
  // Pattern 2: class comes before data-02-id
  if (!patched) {
    const pattern2 = new RegExp(
      `(class=["'])([^"']*)["']([^>]*data-02-id=["']${elementId}["'])`,
      'i'
    );
    if (pattern2.test(updatedJsx)) {
      updatedJsx = updatedJsx.replace(pattern2, `$1${newClassString}"$3`);
      patched = true;
    }
  }
  
  // Pattern 3: Element is root and has no data-02-id in pattern (fallback)
  if (!patched && elementId) {
    // Find element with the ID and update its class
    const elementPattern = new RegExp(
      `(<[^>]*data-02-id=["']${elementId}["'][^>]*)class=["'][^"']*["']`,
      'gi'
    );
    if (elementPattern.test(updatedJsx)) {
      updatedJsx = updatedJsx.replace(elementPattern, `$1class="${newClassString}"`);
      patched = true;
    }
  }
  
  if (!patched) {
    return {
      success: false,
      jsx,
      appliedDelta: { add: [], remove: [] },
      previousClasses,
      newClasses: previousClasses,
      error: `Could not find element with data-02-id="${elementId}"`,
    };
  }
  
  // Validate that the nudge preserved logic (event handlers, etc.)
  const logicValidation = validateNudgePreservesLogic(jsx, updatedJsx);
  if (!logicValidation.valid) {
    return {
      success: false,
      jsx,
      appliedDelta: { add: [], remove: [] },
      previousClasses,
      newClasses: previousClasses,
      error: `Logic preservation failed: ${logicValidation.violations.join(', ')}`,
    };
  }
  
  return {
    success: true,
    jsx: updatedJsx,
    appliedDelta: delta,
    previousClasses,
    newClasses,
  };
}

/**
 * Validate a style delta (ensure it only contains valid Tailwind classes)
 */
export function validateDelta(delta: StyleDelta): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Basic validation - classes should be strings without dangerous content
  const validateClass = (cls: string, type: 'add' | 'remove') => {
    if (typeof cls !== 'string') {
      issues.push(`${type}: Invalid class type (expected string)`);
      return;
    }
    if (cls.includes('<') || cls.includes('>')) {
      issues.push(`${type}: Class "${cls}" contains HTML characters`);
    }
    if (cls.includes('"') || cls.includes("'")) {
      issues.push(`${type}: Class "${cls}" contains quote characters`);
    }
    if (cls.includes('javascript:')) {
      issues.push(`${type}: Class "${cls}" contains javascript protocol`);
    }
    if (cls.length > 100) {
      issues.push(`${type}: Class "${cls}" exceeds maximum length`);
    }
  };
  
  delta.add.forEach(cls => validateClass(cls, 'add'));
  delta.remove.forEach(cls => validateClass(cls, 'remove'));
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Apply nudge to AST and return updated component
 */
export function applyNudgeToAST(
  ast: Record<string, ASTComponent>,
  componentId: string,
  delta: StyleDelta
): { success: boolean; ast: Record<string, ASTComponent>; error?: string } {
  const component = ast[componentId];
  
  if (!component) {
    return {
      success: false,
      ast,
      error: `Component "${componentId}" not found in AST`,
    };
  }
  
  // Validate delta
  const validation = validateDelta(delta);
  if (!validation.valid) {
    return {
      success: false,
      ast,
      error: `Invalid delta: ${validation.issues.join(', ')}`,
    };
  }
  
  // Apply delta
  const patchResult = applyDelta(component.jsx, componentId, delta);
  
  if (!patchResult.success) {
    return {
      success: false,
      ast,
      error: patchResult.error,
    };
  }
  
  // Update AST with new JSX
  const updatedAST = {
    ...ast,
    [componentId]: {
      ...component,
      jsx: patchResult.jsx,
      classes: patchResult.newClasses,
      updatedAt: new Date().toISOString(),
    },
  };
  
  return {
    success: true,
    ast: updatedAST,
  };
}
