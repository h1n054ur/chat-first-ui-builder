/**
 * HTML/JSX Sanitization
 * 
 * Enhanced edge-compatible sanitizer for AI-generated content.
 * 
 * Note: DOMPurify requires a DOM environment. For full server-side sanitization,
 * consider using isomorphic-dompurify or similar. This implementation provides
 * robust regex-based sanitization suitable for edge runtime.
 * 
 * Per Project Context: "All AI-generated HTML fragments pass through sanitization before injection"
 */

/** Allowed HTML tags for generated components */
const ALLOWED_TAGS = new Set([
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'button', 'input', 'textarea', 'select', 'option', 'label',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'form', 'fieldset', 'legend',
  'article', 'section', 'nav', 'aside', 'header', 'footer', 'main',
  'figure', 'figcaption', 'img', 'picture', 'source',
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'use',
  'video', 'audio', 'track',
  'br', 'hr', 'strong', 'em', 'code', 'pre', 'blockquote',
  'time', 'mark', 'small', 'sub', 'sup', 'abbr', 'cite', 'q',
]);

/** Allowed attributes (global + element-specific) */
const ALLOWED_ATTRS = new Set([
  'class', 'id', 'style', 'title', 'lang', 'dir',
  'href', 'target', 'rel',
  'src', 'alt', 'width', 'height', 'loading', 'srcset', 'sizes',
  'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly',
  'checked', 'selected', 'multiple', 'min', 'max', 'step', 'pattern', 'maxlength', 'minlength',
  'for', 'form', 'action', 'method', 'enctype',
  'role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
  'aria-expanded', 'aria-selected', 'aria-checked', 'aria-disabled', 'aria-live',
  'aria-atomic', 'aria-busy', 'aria-controls', 'aria-current', 'aria-haspopup',
  'tabindex', 'autofocus',
  'data-02-id', // Our internal tracking attribute
  'colspan', 'rowspan', 'scope', 'headers',
  'datetime', 'cite',
  // SVG attributes
  'viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y',
  'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'opacity', 'fill-opacity',
  'stroke-opacity', 'stroke-linecap', 'stroke-linejoin',
]);

/** Dangerous patterns - comprehensive list */
const DANGEROUS_PATTERNS: RegExp[] = [
  // Script injection
  /<script[\s\S]*?<\/script>/gi,
  /<script[^>]*>/gi,
  // Style injection (can contain expressions)
  /<style[\s\S]*?<\/style>/gi,
  // Event handlers (comprehensive list)
  /\s+on\w+\s*=\s*["'][^"']*["']/gi,
  /\s+on\w+\s*=\s*[^\s>]+/gi,
  // JavaScript URLs
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  // Dangerous tags
  /<iframe[\s\S]*?(?:<\/iframe>|\/?>)/gi,
  /<object[\s\S]*?(?:<\/object>|\/?>)/gi,
  /<embed[\s\S]*?(?:<\/embed>|\/?>)/gi,
  /<applet[\s\S]*?(?:<\/applet>|\/?>)/gi,
  /<meta[\s\S]*?(?:<\/meta>|\/?>)/gi,
  /<link[\s\S]*?(?:<\/link>|\/?>)/gi,
  /<base[\s\S]*?(?:<\/base>|\/?>)/gi,
  /<form[\s\S]*?action\s*=\s*["']?javascript/gi,
  // Expression injection
  /expression\s*\(/gi,
  /url\s*\(\s*["']?\s*javascript/gi,
  // XML injection
  /<!\[CDATA\[[\s\S]*?\]\]>/gi,
  /<!--[\s\S]*?-->/gi,
  // Template injection
  /\{\{[\s\S]*?\}\}/g,
  /\$\{[\s\S]*?\}/g,
];

/** Additional attribute patterns to remove */
const DANGEROUS_ATTR_PATTERNS: RegExp[] = [
  // Any attribute starting with 'on'
  /\s+on[a-z]+\s*=/gi,
  // formaction can bypass form action
  /\s+formaction\s*=/gi,
  // xlink:href in SVG
  /\s+xlink:href\s*=\s*["']?javascript/gi,
  // srcdoc in iframe (shouldn't exist after tag removal, but safety)
  /\s+srcdoc\s*=/gi,
];

/**
 * Sanitize JSX/HTML content
 * 
 * Multi-pass sanitization for maximum security:
 * 1. Remove dangerous tags with content
 * 2. Remove dangerous patterns
 * 3. Remove dangerous attributes
 * 4. Validate remaining structure
 */
export function sanitizeJsx(input: string): string {
  let sanitized = input;

  // Pass 1: Remove dangerous tags with their content
  sanitized = sanitized
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed>/gi, '');

  // Pass 2: Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Pass 3: Remove dangerous attributes
  for (const pattern of DANGEROUS_ATTR_PATTERNS) {
    sanitized = sanitized.replace(pattern, ' ');
  }

  // Pass 4: Clean up any remaining event handlers more aggressively
  // Match on* attributes with various value formats
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // Pass 5: Remove javascript: from any remaining href/src attributes
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, '$1=""');

  return sanitized.trim();
}

/**
 * Validate that JSX only contains allowed content
 * Returns validation result with specific issues found
 */
export function validateJsx(input: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for script tags
  if (/<script/i.test(input)) {
    issues.push('Script tags are not allowed');
  }

  // Check for event handlers
  if (/\bon[a-z]+\s*=/i.test(input)) {
    issues.push('Inline event handlers are not allowed');
  }

  // Check for javascript URLs
  if (/javascript\s*:/i.test(input)) {
    issues.push('JavaScript URLs are not allowed');
  }

  // Check for data URLs with HTML
  if (/data\s*:\s*text\/html/i.test(input)) {
    issues.push('Data HTML URLs are not allowed');
  }

  // Check for iframe tags
  if (/<iframe/i.test(input)) {
    issues.push('Iframe tags are not allowed');
  }

  // Check for dangerous expressions
  if (/expression\s*\(/i.test(input)) {
    issues.push('CSS expressions are not allowed');
  }

  // Check for template literals that could execute
  if (/\$\{[^}]+\}/.test(input)) {
    issues.push('Template literals are not allowed in generated content');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Add tracking ID to component for targeting
 * Used by the Nudge Engine to identify components
 */
export function addTrackingId(jsx: string, componentId: string): string {
  // Validate componentId to prevent injection
  const safeId = componentId.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // Add data-02-id to the root element
  return jsx.replace(
    /^(<\w+)/,
    `$1 data-02-id="${safeId}"`
  );
}

/**
 * Check if input contains only allowed tags
 * More strict validation for high-security contexts
 */
export function validateAllowedTags(input: string): { valid: boolean; disallowedTags: string[] } {
  const tagPattern = /<\/?([a-z][a-z0-9]*)/gi;
  const disallowedTags: string[] = [];
  
  let match;
  while ((match = tagPattern.exec(input)) !== null) {
    const tagName = match[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      if (!disallowedTags.includes(tagName)) {
        disallowedTags.push(tagName);
      }
    }
  }
  
  return {
    valid: disallowedTags.length === 0,
    disallowedTags,
  };
}
