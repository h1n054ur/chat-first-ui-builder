/**
 * AST-to-JSX Serializer
 * 
 * Transforms internal AST state into clean, human-readable Hono/JSX code.
 * Zero-cleanup goal: Output should be "drop-in" ready.
 */

import type { ASTComponent } from '../nudge-engine/patcher';

/** Export options */
export interface ExportOptions {
  /** Include component wrapper function */
  includeWrapper: boolean;
  /** Component name for the wrapper */
  componentName?: string;
  /** Include imports at top of file */
  includeImports: boolean;
  /** Format output with indentation */
  format: boolean;
  /** Indentation string (default: '  ') */
  indent?: string;
}

/** Default export options */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeWrapper: true,
  componentName: 'GeneratedComponent',
  includeImports: true,
  format: true,
  indent: '  ',
};

/** System attribute prefixes to strip from export */
const SYSTEM_ATTRIBUTE_PREFIXES = [
  'data-02-',     // All internal tracking attributes
  'data-ghost-',  // Ghost overlay attributes
];

/**
 * Strip system-specific attributes from JSX
 * Removes all attributes that start with system prefixes (data-02-*, data-ghost-*)
 */
export function stripSystemAttributes(jsx: string): string {
  let cleaned = jsx;
  
  for (const prefix of SYSTEM_ATTRIBUTE_PREFIXES) {
    // Escape special regex chars in prefix and match any attribute starting with it
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match: space(s) + prefix + attribute-name-chars + ="value" or ='value' or =value
    const pattern = new RegExp(`\\s*${escapedPrefix}[a-zA-Z0-9_-]*(?:="[^"]*"|='[^']*'|=[^\\s>]*)`, 'gi');
    cleaned = cleaned.replace(pattern, '');
  }
  
  return cleaned;
}

/**
 * Convert JSX to use standard attribute names
 * (Hono JSX uses 'class' but React uses 'className')
 */
export function normalizeAttributes(jsx: string, targetFramework: 'hono' | 'react' = 'hono'): string {
  if (targetFramework === 'react') {
    // Convert class to className for React
    return jsx.replace(/\bclass=/g, 'className=');
  }
  return jsx;
}

/**
 * Format JSX with proper indentation
 */
export function formatJsx(jsx: string, indent: string = '  '): string {
  // Simple formatter - for production, use a proper parser like Prettier
  let formatted = jsx.trim();
  let level = 0;
  let result = '';
  let inTag = false;
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i];
    const nextChar = formatted[i + 1];
    const prevChar = formatted[i - 1];
    
    // Track quotes
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      }
    }
    
    if (!inQuote) {
      // Opening tag
      if (char === '<' && nextChar !== '/') {
        if (result && result[result.length - 1] !== '\n') {
          result += '\n' + indent.repeat(level);
        }
        result += char;
        inTag = true;
        level++;
      }
      // Closing tag
      else if (char === '<' && nextChar === '/') {
        level--;
        if (result[result.length - 1] !== '\n' && result[result.length - 1] !== '>') {
          result += '\n' + indent.repeat(level);
        }
        result += char;
        inTag = true;
      }
      // Self-closing or end of tag
      else if (char === '>' && prevChar === '/') {
        level--;
        result += char;
        inTag = false;
      }
      else if (char === '>') {
        result += char;
        inTag = false;
      }
      else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  // Clean up extra newlines
  return result.replace(/\n\s*\n/g, '\n').trim();
}

/**
 * Serialize a single component to clean JSX
 */
export function serializeComponent(
  component: ASTComponent,
  options: Partial<ExportOptions> = {}
): string {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  
  // Strip system attributes
  let jsx = stripSystemAttributes(component.jsx);
  
  // Format if requested
  if (opts.format) {
    jsx = formatJsx(jsx, opts.indent);
  }
  
  // Wrap in component function if requested
  if (opts.includeWrapper) {
    const name = opts.componentName || 'Component';
    const imports = opts.includeImports 
      ? "import type { FC } from 'hono/jsx';\n\n"
      : '';
    
    return `${imports}export const ${name}: FC = () => {
  return (
${jsx.split('\n').map(line => opts.indent + opts.indent + line).join('\n')}
  );
};
`;
  }
  
  return jsx;
}

/**
 * Serialize multiple components to a module
 */
export function serializeComponents(
  components: Record<string, ASTComponent>,
  options: Partial<ExportOptions> = {}
): string {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  
  const componentEntries = Object.entries(components);
  
  if (componentEntries.length === 0) {
    return '// No components to export\n';
  }
  
  // Build imports
  let output = "import type { FC } from 'hono/jsx';\n\n";
  
  // Export each component
  for (const [id, component] of componentEntries) {
    const name = idToComponentName(id);
    const jsx = stripSystemAttributes(component.jsx);
    const formattedJsx = opts.format ? formatJsx(jsx, opts.indent) : jsx;
    
    output += `export const ${name}: FC = () => {
  return (
${formattedJsx.split('\n').map(line => opts.indent + opts.indent + line).join('\n')}
  );
};

`;
  }
  
  return output;
}

/**
 * Convert component ID to valid component name
 */
export function idToComponentName(id: string): string {
  // Convert comp_123 to Comp123, hero_section to HeroSection, etc.
  return id
    .split(/[_-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Generate export bundle info
 */
export interface ExportBundle {
  filename: string;
  content: string;
  type: 'component' | 'style' | 'config' | 'index';
}

/**
 * Create full export bundle for download
 */
export function createExportBundle(
  components: Record<string, ASTComponent>,
  vibeId: string,
  vibeCss: string
): ExportBundle[] {
  const bundle: ExportBundle[] = [];
  
  // Main components file
  bundle.push({
    filename: 'components.tsx',
    content: serializeComponents(components),
    type: 'component',
  });
  
  // Vibe CSS
  bundle.push({
    filename: 'vibe.css',
    content: vibeCss,
    type: 'style',
  });
  
  // Index file
  bundle.push({
    filename: 'index.ts',
    content: `// Auto-generated by 02 Builder
// Vibe: ${vibeId}

export * from './components';
`,
    type: 'index',
  });
  
  return bundle;
}
