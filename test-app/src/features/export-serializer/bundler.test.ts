import { describe, it, expect } from 'bun:test';
import {
  createStylesFile,
  createProjectBundle,
  createZipFile,
  generateExportFilename,
  type ProjectBundle,
  type BundleManifest,
} from './bundler';
import type { ASTComponent } from '../nudge-engine/patcher';

describe('Story 5.2: Generate Zero-Cleanup Project Files', () => {
  const mockComponents: Record<string, ASTComponent> = {
    hero: {
      id: 'hero',
      jsx: '<section class="min-h-screen flex items-center justify-center"><h1>Welcome</h1></section>',
      createdAt: '2026-01-15T10:00:00Z',
    },
    button: {
      id: 'button',
      jsx: '<button class="px-4 py-2 bg-blue-600 text-white rounded">Click Me</button>',
      createdAt: '2026-01-15T10:00:00Z',
    },
  };

  const mockVibeCss = `:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
}`;

  describe('createStylesFile', () => {
    it('should include Tailwind directives', () => {
      const styles = createStylesFile(mockVibeCss);
      expect(styles).toContain('@import "tailwindcss"');
    });

    it('should include vibe CSS', () => {
      const styles = createStylesFile(mockVibeCss);
      expect(styles).toContain('--color-primary');
      expect(styles).toContain('--color-secondary');
    });

    it('should include @theme block', () => {
      const styles = createStylesFile(mockVibeCss);
      expect(styles).toContain('@theme');
    });
  });

  describe('createProjectBundle', () => {
    it('should create all necessary files', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      
      expect(bundle.files.has('src/components.tsx')).toBe(true);
      expect(bundle.files.has('src/styles.css')).toBe(true);
      expect(bundle.files.has('src/main.tsx')).toBe(true);
      expect(bundle.files.has('package.json')).toBe(true);
      expect(bundle.files.has('vite.config.ts')).toBe(true);
      expect(bundle.files.has('tsconfig.json')).toBe(true);
      expect(bundle.files.has('README.md')).toBe(true);
    });

    it('should create valid manifest', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      
      expect(bundle.manifest.vibeId).toBe('minimalist');
      expect(bundle.manifest.componentCount).toBe(2);
      expect(bundle.manifest.createdAt).toBeDefined();
      expect(bundle.manifest.files.length).toBeGreaterThan(0);
    });

    it('should include components in components.tsx', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const componentsFile = bundle.files.get('src/components.tsx');
      
      expect(componentsFile).toBeDefined();
      const content = new TextDecoder().decode(componentsFile);
      expect(content).toContain('Hero');
      expect(content).toContain('Button');
    });

    it('should include vibe CSS in styles.css', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const stylesFile = bundle.files.get('src/styles.css');
      
      expect(stylesFile).toBeDefined();
      const content = new TextDecoder().decode(stylesFile);
      expect(content).toContain('--color-primary');
    });

    it('should create valid package.json', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const packageFile = bundle.files.get('package.json');
      
      expect(packageFile).toBeDefined();
      const content = new TextDecoder().decode(packageFile);
      const pkg = JSON.parse(content);
      
      expect(pkg.dependencies.hono).toBeDefined();
      expect(pkg.devDependencies.tailwindcss).toBeDefined();
      expect(pkg.devDependencies.vite).toBeDefined();
      expect(pkg.scripts.dev).toBeDefined();
      expect(pkg.scripts.build).toBeDefined();
    });

    it('should create valid vite.config.ts', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const viteConfig = bundle.files.get('vite.config.ts');
      
      expect(viteConfig).toBeDefined();
      const content = new TextDecoder().decode(viteConfig);
      expect(content).toContain('tailwindcss');
      expect(content).toContain('jsxImportSource');
      expect(content).toContain('hono/jsx');
    });

    it('should create valid tsconfig.json', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const tsconfig = bundle.files.get('tsconfig.json');
      
      expect(tsconfig).toBeDefined();
      const content = new TextDecoder().decode(tsconfig);
      const config = JSON.parse(content);
      
      expect(config.compilerOptions.jsxImportSource).toBe('hono/jsx');
    });

    it('should include README with vibe info', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const readme = bundle.files.get('README.md');
      
      expect(readme).toBeDefined();
      const content = new TextDecoder().decode(readme);
      expect(content).toContain('minimalist');
      expect(content).toContain('bun install');
      expect(content).toContain('bun run dev');
    });
  });

  describe('createZipFile', () => {
    it('should create a valid ZIP file', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const zip = createZipFile(bundle);
      
      // ZIP files start with PK signature (0x504B0304)
      expect(zip[0]).toBe(0x50); // P
      expect(zip[1]).toBe(0x4B); // K
      expect(zip[2]).toBe(0x03);
      expect(zip[3]).toBe(0x04);
    });

    it('should have end of central directory record', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const zip = createZipFile(bundle);
      
      // End of central directory signature (0x06054B50)
      // Should be near the end of the file
      const endOffset = zip.length - 22;
      expect(zip[endOffset]).toBe(0x50);
      expect(zip[endOffset + 1]).toBe(0x4B);
      expect(zip[endOffset + 2]).toBe(0x05);
      expect(zip[endOffset + 3]).toBe(0x06);
    });

    it('should include all files from bundle', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      const zip = createZipFile(bundle);
      
      // Check that ZIP contains expected file count
      // Read from end of central directory record (offset 10-11 for total entries)
      const endOffset = zip.length - 22;
      const view = new DataView(zip.buffer, endOffset);
      const totalEntries = view.getUint16(10, true);
      
      expect(totalEntries).toBe(bundle.files.size);
    });
  });

  describe('generateExportFilename', () => {
    it('should include vibe ID', () => {
      const filename = generateExportFilename('minimalist');
      expect(filename).toContain('minimalist');
    });

    it('should have .zip extension', () => {
      const filename = generateExportFilename('minimalist');
      expect(filename).toMatch(/\.zip$/);
    });

    it('should include date', () => {
      const filename = generateExportFilename('minimalist');
      // Should contain date in YYYY-MM-DD format
      expect(filename).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should start with 02-export prefix', () => {
      const filename = generateExportFilename('minimalist');
      expect(filename).toMatch(/^02-export-/);
    });
  });

  describe('AC1: Ready-to-run file structure', () => {
    it('should create complete project structure', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      
      // All essential files for a runnable project
      const requiredFiles = [
        'src/components.tsx',
        'src/styles.css',
        'src/main.tsx',
        'package.json',
        'vite.config.ts',
        'tsconfig.json',
      ];
      
      for (const file of requiredFiles) {
        expect(bundle.files.has(file)).toBe(true);
      }
    });

    it('should have valid JSON configs', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      
      // package.json should be valid JSON
      const pkgContent = new TextDecoder().decode(bundle.files.get('package.json'));
      expect(() => JSON.parse(pkgContent)).not.toThrow();
      
      // tsconfig.json should be valid JSON
      const tsconfigContent = new TextDecoder().decode(bundle.files.get('tsconfig.json'));
      expect(() => JSON.parse(tsconfigContent)).not.toThrow();
    });
  });

  describe('AC2: Renders correctly in Bun/Hono environment', () => {
    it('should use Hono JSX import source', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      
      // Check tsconfig
      const tsconfigContent = new TextDecoder().decode(bundle.files.get('tsconfig.json'));
      const tsconfig = JSON.parse(tsconfigContent);
      expect(tsconfig.compilerOptions.jsxImportSource).toBe('hono/jsx');
      
      // Check vite config
      const viteContent = new TextDecoder().decode(bundle.files.get('vite.config.ts'));
      expect(viteContent).toContain("jsxImportSource: 'hono/jsx'");
    });

    it('should include Hono dependency', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      
      const pkgContent = new TextDecoder().decode(bundle.files.get('package.json'));
      const pkg = JSON.parse(pkgContent);
      
      expect(pkg.dependencies.hono).toBeDefined();
    });

    it('should include Tailwind v4 dependencies', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      
      const pkgContent = new TextDecoder().decode(bundle.files.get('package.json'));
      const pkg = JSON.parse(pkgContent);
      
      expect(pkg.devDependencies.tailwindcss).toMatch(/^\^4/);
      expect(pkg.devDependencies['@tailwindcss/vite']).toMatch(/^\^4/);
    });

    it('should have components use FC type from Hono', () => {
      const bundle = createProjectBundle(mockComponents, 'minimalist', mockVibeCss);
      
      const componentsContent = new TextDecoder().decode(bundle.files.get('src/components.tsx'));
      expect(componentsContent).toContain("import type { FC } from 'hono/jsx'");
    });
  });
});
