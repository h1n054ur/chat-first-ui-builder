# Development Guide: 02 - Chat-First UI Builder

## Prerequisites
- **Bun**: Required for runtime and testing.
- **Cloudflare Account**: Required for D1, R2, and Workers deployment.
- **Anthropic API Key**: Required for AI component generation.

## Getting Started
1. **Install Dependencies**:
   ```bash
   cd my-app
   bun install
   ```
2. **Setup Environment**:
   Create a `.dev.vars` file in `my-app/`:
   ```env
   ANTHROPIC_API_KEY=your_key_here
   ```
3. **Run Development Server**:
   ```bash
   bun run dev
   ```
4. **Deploy to Cloudflare**:
   ```bash
   bun run deploy
   ```

## Key Commands
- `bun run dev`: Start local Vite/Wrangler development.
- `bun run build`: Build for production.
- `bun test`: Run the test suite (currently 199 tests).
- `bun run cf-typegen`: Generate Cloudflare binding types.

## Development Workflow
1. **Features**: New logic should be added to `src/features/`.
2. **Components**: UI components go in `src/components/ui/`.
3. **Tests**: Use `bun test` for unit and integration testing. Every feature should have a corresponding `.test.ts`.

## Deployment
Deployed via Wrangler to Cloudflare Workers. The project uses a single Worker with Durable Objects for state management.
