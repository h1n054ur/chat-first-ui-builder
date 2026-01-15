/**
 * Logic Guard
 * 
 * Protects user logic (event handlers, state bindings) during nudge operations.
 * CRITICAL: Only class and style attributes should ever be modified.
 * 
 * Per Project Context: "AI agents MUST NOT modify component structure during nudges"
 */

/** Protected attribute patterns - these MUST NOT be modified */
export const PROTECTED_ATTRIBUTE_PATTERNS = [
  // Event handlers (onclick, onsubmit, etc.)
  /^on[a-z]+$/i,
  // HTMX attributes
  /^hx-/i,
  // Alpine.js attributes
  /^x-/i,
  /^@/,
  // Vue.js attributes
  /^v-/i,
  /^:/,
  // React/JSX event handlers (onClick, onSubmit, etc.)
  /^on[A-Z]/,
  // Angular attributes
  /^\(/,
  /^\[/,
  /^\*/,
  // Data binding
  /^bind/i,
  /^ref$/i,
  // Form attributes that affect behavior
  /^action$/i,
  /^method$/i,
  /^enctype$/i,
  // Special attributes
  /^key$/i,
  /^name$/i,
  /^value$/i,
  /^checked$/i,
  /^selected$/i,
  /^disabled$/i,
];

/** Allowed attributes for modification */
export const MODIFIABLE_ATTRIBUTES = new Set([
  'class',
  'className',
  'style',
]);

/**
 * Check if an attribute is protected (should not be modified)
 */
export function isProtectedAttribute(attrName: string): boolean {
  // Check against patterns
  for (const pattern of PROTECTED_ATTRIBUTE_PATTERNS) {
    if (pattern.test(attrName)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if an attribute can be modified during a nudge
 */
export function isModifiableAttribute(attrName: string): boolean {
  return MODIFIABLE_ATTRIBUTES.has(attrName);
}

/**
 * Extract all attributes from a JSX/HTML tag string
 */
export function extractAttributes(tagString: string): Map<string, string> {
  const attrs = new Map<string, string>();
  
  // Match attribute patterns: name="value" or name='value' or name={value}
  const attrPattern = /([a-zA-Z_][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;
  
  let match;
  while ((match = attrPattern.exec(tagString)) !== null) {
    const name = match[1];
    const value = match[2] || match[3] || match[4] || '';
    if (name && !['class', 'data'].includes(name.split('-')[0]) || name === 'class' || name.startsWith('data-')) {
      attrs.set(name, value);
    }
  }
  
  return attrs;
}

/**
 * Get list of protected attributes found in a tag
 */
export function findProtectedAttributes(tagString: string): string[] {
  const attrs = extractAttributes(tagString);
  const protected_: string[] = [];
  
  for (const attrName of attrs.keys()) {
    if (isProtectedAttribute(attrName)) {
      protected_.push(attrName);
    }
  }
  
  return protected_;
}

/**
 * Validate that a nudge operation only modifies allowed attributes
 * 
 * @param originalJsx - The original JSX before nudge
 * @param modifiedJsx - The JSX after nudge
 * @returns Validation result with any violations
 */
export function validateNudgePreservesLogic(
  originalJsx: string,
  modifiedJsx: string
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  // Extract protected attributes from original
  const originalProtected = findProtectedAttributes(originalJsx);
  
  // Check each protected attribute still exists with same value
  for (const attrName of originalProtected) {
    // Find the attribute in original
    const originalPattern = new RegExp(`${attrName}=(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`, 'i');
    const originalMatch = originalJsx.match(originalPattern);
    
    // Find in modified
    const modifiedMatch = modifiedJsx.match(originalPattern);
    
    if (originalMatch && !modifiedMatch) {
      violations.push(`Protected attribute "${attrName}" was removed`);
    } else if (originalMatch && modifiedMatch) {
      const originalValue = originalMatch[1] || originalMatch[2] || originalMatch[3];
      const modifiedValue = modifiedMatch[1] || modifiedMatch[2] || modifiedMatch[3];
      
      if (originalValue !== modifiedValue) {
        violations.push(`Protected attribute "${attrName}" was modified`);
      }
    }
  }
  
  // Check that hierarchy wasn't modified (same tag structure)
  const originalTags = originalJsx.match(/<\/?[a-zA-Z][^>]*>/g) || [];
  const modifiedTags = modifiedJsx.match(/<\/?[a-zA-Z][^>]*>/g) || [];
  
  if (originalTags.length !== modifiedTags.length) {
    violations.push('Component hierarchy was modified (different number of tags)');
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Safe nudge applier that validates logic preservation
 */
export function safeApplyNudge(
  originalJsx: string,
  elementId: string,
  classesToAdd: string[],
  classesToRemove: string[]
): { success: boolean; jsx: string; error?: string } {
  // Build the new class list
  const classPattern = new RegExp(
    `(data-02-id=["']${elementId}["'][^>]*class=["'])([^"']*)["']`,
    'i'
  );
  const classPatternAlt = new RegExp(
    `(class=["'])([^"']*)["']([^>]*data-02-id=["']${elementId}["'])`,
    'i'
  );
  
  let match = originalJsx.match(classPattern) || originalJsx.match(classPatternAlt);
  
  if (!match) {
    return {
      success: false,
      jsx: originalJsx,
      error: `Element with id "${elementId}" not found`,
    };
  }
  
  // Get current classes
  const currentClasses = new Set((match[2] || '').split(/\s+/).filter(Boolean));
  
  // Apply changes
  classesToRemove.forEach(cls => currentClasses.delete(cls));
  classesToAdd.forEach(cls => currentClasses.add(cls));
  
  const newClassString = Array.from(currentClasses).join(' ');
  
  // Apply the change
  let modifiedJsx = originalJsx;
  if (classPattern.test(originalJsx)) {
    modifiedJsx = originalJsx.replace(classPattern, `$1${newClassString}"`);
  } else {
    modifiedJsx = originalJsx.replace(classPatternAlt, `$1${newClassString}"$3`);
  }
  
  // Validate the result
  const validation = validateNudgePreservesLogic(originalJsx, modifiedJsx);
  
  if (!validation.valid) {
    return {
      success: false,
      jsx: originalJsx,
      error: `Logic preservation failed: ${validation.violations.join(', ')}`,
    };
  }
  
  return {
    success: true,
    jsx: modifiedJsx,
  };
}
