# Source Tree Analysis: 02 - Chat-First UI Builder

```
my-app/
├── src/
│   ├── index.tsx               # Main Hono entry point & Routes
│   ├── renderer.tsx            # Vite SSR rendering middleware
│   ├── style.css               # Global CSS & Design Tokens (Tailwind v4)
│   ├── components/             # UI Components (Hono/JSX)
│   │   ├── layout/             # Structural components
│   │   │   └── MainLayout.tsx  # Unused? (UtilityMaster uses its own layout)
│   │   ├── templates/          # Preview templates
│   │   │   └── VibePreview.tsx # Live preview for vibes
│   │   └── ui/                 # Core UI elements
│   │       ├── DiffToast.tsx   # Visual feedback for changes
│   │       ├── OmniBox.tsx     # Large chat input
│   │       ├── OmniBoxFloat.tsx # Floating Cmd+K input
│   │       ├── UtilityMaster.tsx # Workspace main view
│   │       ├── VibeGallery.tsx # Gallery of vibes
│   │       └── ZenSculptor.tsx # Initial screen
│   ├── features/               # Domain Logic (The "Brain")
│   │   ├── chat/               # Anthropic Claude Integration
│   │   │   ├── client.ts       # AI Client setup
│   │   │   ├── prompts.ts      # System prompts for Claude
│   │   │   ├── sanitize.ts     # JSX cleaning and safety
│   │   │   └── stream.ts       # SSE streaming logic
│   │   ├── export-serializer/  # Code bundling & Export
│   │   │   ├── bundler.ts      # File system structure generation
│   │   │   └── serializer.ts   # Component serialization
│   │   ├── nudge-engine/       # Visual Sculpting Logic
│   │   │   ├── index.ts        # Patcher entry point
│   │   │   ├── patcher.ts      # AST-based class replacement
│   │   │   ├── vibes.ts        # Vibe definitions
│   │   │   └── vibe-css.ts     # Vibe-to-CSS generator
│   │   ├── preview-sandbox/    # Iframe & Direct Selection
│   │   │   ├── ghosting.ts     # Visual diff "ghosting"
│   │   │   └── selection-manager.ts # Element selection logic
│   │   └── state-manager/      # Session Persistence
│   │       ├── client.ts       # Durable Object communication
│   │       └── history.ts      # Undo/Redo logic
│   ├── infrastructure/         # Cloudflare Platform Bindings
│   │   └── durable-objects/    # State storage classes
│   │       └── StateManager.ts # Main DO implementation
│   └── lib/                    # Shared Utilities
│       ├── types.ts            # Global Type definitions
│       └── validation.ts       # Zod schemas for API
├── public/                     # Static Assets
├── wrangler.toml               # Cloudflare Workers Config
└── package.json                # Project Manifest
```

## Critical Files
- `src/index.tsx`: The router and orchestration layer.
- `src/features/nudge-engine/patcher.ts`: Core logic for "sculpting" UI.
- `src/infrastructure/durable-objects/StateManager.ts`: Source of truth for session data.
- `src/style.css`: Defines the "Functional Premium" aesthetic.
