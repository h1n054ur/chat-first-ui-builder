import { describe, it, expect } from 'bun:test';
import {
  stripSystemAttributes,
  normalizeAttributes,
  formatJsx,
  serializeComponent,
  serializeComponents,
  idToComponentName,
  createExportBundle,
  DEFAULT_EXPORT_OPTIONS,
  type ExportOptions,
} from './serializer';
import type { ASTComponent } from '../nudge-engine/patcher';

describe('Story 5.1: Export Component Code', () => {
  describe('stripSystemAttributes', () => {
    it('should remove data-02-id attributes', () => {
      const jsx = '<div data-02-id="comp_1" class="p-4">Content</div>';
      const result = stripSystemAttributes(jsx);
      expect(result).not.toContain('data-02-id');
      expect(result).toContain('class="p-4"');
    });

    it('should remove multiple system attributes', () => {
      const jsx = '<div data-02-id="comp_1" data-ghost-id="g1" class="p-4">Content</div>';
      const result = stripSystemAttributes(jsx);
      expect(result).not.toContain('data-02-id');
      expect(result).not.toContain('data-ghost-id');
    });

    it('should preserve other data attributes', () => {
      const jsx = '<div data-testid="my-test" data-02-id="comp_1" class="p-4">Content</div>';
      const result = stripSystemAttributes(jsx);
      expect(result).toContain('data-testid="my-test"');
      expect(result).not.toContain('data-02-id');
    });
  });

  describe('normalizeAttributes', () => {
    it('should keep class for Hono', () => {
      const jsx = '<div class="p-4">Content</div>';
      const result = normalizeAttributes(jsx, 'hono');
      expect(result).toContain('class=');
    });

    it('should convert class to className for React', () => {
      const jsx = '<div class="p-4">Content</div>';
      const result = normalizeAttributes(jsx, 'react');
      expect(result).toContain('className=');
      expect(result).not.toContain('class=');
    });
  });

  describe('formatJsx', () => {
    it('should format simple JSX', () => {
      const jsx = '<div class="p-4"><span>Hello</span></div>';
      const result = formatJsx(jsx);
      expect(result).toContain('\n');
    });

    it('should handle self-closing tags', () => {
      const jsx = '<input type="text" />';
      const result = formatJsx(jsx);
      expect(result).toContain('<input');
    });
  });

  describe('serializeComponent', () => {
    const component: ASTComponent = {
      id: 'hero_section',
      jsx: '<section data-02-id="hero_section" class="min-h-screen flex items-center"><h1>Welcome</h1></section>',
      createdAt: '2026-01-15T10:00:00Z',
    };

    it('should strip system attributes', () => {
      const result = serializeComponent(component);
      expect(result).not.toContain('data-02-id');
    });

    it('should include imports by default', () => {
      const result = serializeComponent(component);
      expect(result).toContain("import type { FC } from 'hono/jsx'");
    });

    it('should wrap in component function by default', () => {
      const result = serializeComponent(component);
      expect(result).toContain('export const GeneratedComponent: FC');
      expect(result).toContain('return (');
    });

    it('should use custom component name', () => {
      const result = serializeComponent(component, { componentName: 'HeroSection' });
      expect(result).toContain('export const HeroSection: FC');
    });

    it('should skip wrapper when disabled', () => {
      const result = serializeComponent(component, { includeWrapper: false });
      expect(result).not.toContain('export const');
      expect(result).toContain('<section');
    });
  });

  describe('serializeComponents', () => {
    const components: Record<string, ASTComponent> = {
      hero_section: {
        id: 'hero_section',
        jsx: '<section data-02-id="hero_section" class="min-h-screen">Hero</section>',
        createdAt: '2026-01-15T10:00:00Z',
      },
      cta_button: {
        id: 'cta_button',
        jsx: '<button data-02-id="cta_button" class="px-4 py-2">Click</button>',
        createdAt: '2026-01-15T10:00:00Z',
      },
    };

    it('should export multiple components', () => {
      const result = serializeComponents(components);
      expect(result).toContain('HeroSection');
      expect(result).toContain('CtaButton');
    });

    it('should have single import statement', () => {
      const result = serializeComponents(components);
      const importCount = (result.match(/import type/g) || []).length;
      expect(importCount).toBe(1);
    });

    it('should handle empty components', () => {
      const result = serializeComponents({});
      expect(result).toContain('No components');
    });
  });

  describe('idToComponentName', () => {
    it('should convert underscore ids', () => {
      expect(idToComponentName('hero_section')).toBe('HeroSection');
      expect(idToComponentName('cta_button')).toBe('CtaButton');
    });

    it('should convert hyphen ids', () => {
      expect(idToComponentName('hero-section')).toBe('HeroSection');
    });

    it('should handle comp_ prefix', () => {
      expect(idToComponentName('comp_123')).toBe('Comp123');
    });

    it('should capitalize first letter', () => {
      expect(idToComponentName('button')).toBe('Button');
    });
  });

  describe('createExportBundle', () => {
    const components: Record<string, ASTComponent> = {
      card: {
        id: 'card',
        jsx: '<div data-02-id="card" class="p-4 bg-white rounded">Card</div>',
        createdAt: '2026-01-15T10:00:00Z',
      },
    };
    const vibeCss = ':root { --color-primary: #000; }';

    it('should create components file', () => {
      const bundle = createExportBundle(components, 'minimalist', vibeCss);
      const componentsFile = bundle.find(f => f.filename === 'components.tsx');
      
      expect(componentsFile).toBeDefined();
      expect(componentsFile!.content).toContain('Card');
      expect(componentsFile!.type).toBe('component');
    });

    it('should create vibe CSS file', () => {
      const bundle = createExportBundle(components, 'minimalist', vibeCss);
      const cssFile = bundle.find(f => f.filename === 'vibe.css');
      
      expect(cssFile).toBeDefined();
      expect(cssFile!.content).toContain('--color-primary');
      expect(cssFile!.type).toBe('style');
    });

    it('should create index file', () => {
      const bundle = createExportBundle(components, 'minimalist', vibeCss);
      const indexFile = bundle.find(f => f.filename === 'index.ts');
      
      expect(indexFile).toBeDefined();
      expect(indexFile!.content).toContain("export * from './components'");
      expect(indexFile!.content).toContain('minimalist');
    });
  });

  describe('AC1: Serializes AST to human-readable Hono/JSX', () => {
    it('should produce readable output', () => {
      const component: ASTComponent = {
        id: 'test',
        jsx: '<div data-02-id="test" class="flex items-center justify-between p-4"><span>Label</span><button>Action</button></div>',
        createdAt: '',
      };

      const result = serializeComponent(component, { includeWrapper: false, format: true });
      
      // Should be formatted with newlines
      expect(result.split('\n').length).toBeGreaterThan(1);
      // Should not have system attrs
      expect(result).not.toContain('data-02-id');
    });
  });

  describe('AC2: Follows Hono JSX conventions', () => {
    it('should use camelCase attribute names where appropriate', () => {
      const component: ASTComponent = {
        id: 'test',
        jsx: '<div class="p-4" tabindex="0">Content</div>',
        createdAt: '',
      };

      const result = serializeComponent(component, { includeWrapper: false });
      expect(result).toContain('class='); // Hono uses class, not className
    });

    it('should use standard Tailwind classes', () => {
      const component: ASTComponent = {
        id: 'test',
        jsx: '<div class="p-4 bg-white rounded-lg shadow-md">Content</div>',
        createdAt: '',
      };

      const result = serializeComponent(component, { includeWrapper: false });
      expect(result).toContain('p-4');
      expect(result).toContain('bg-white');
      expect(result).toContain('rounded-lg');
    });
  });

  describe('AC3: No system attributes leak', () => {
    it('should remove all data-02-* attributes', () => {
      const component: ASTComponent = {
        id: 'test',
        jsx: '<div data-02-id="test" data-02-tracked="true" data-02-version="1" class="p-4">Content</div>',
        createdAt: '',
      };

      const result = serializeComponent(component);
      expect(result).not.toMatch(/data-02-/);
    });
  });
});
