# Project Overview: 02 - Chat-First UI Builder

## Vision
A chat-first frontend UX/UI builder deployed on Cloudflare Workers. It allows users to describe UI components in natural language, generate them using AI (Anthropic Claude), and "sculpt" them through visual nudges.

## Key Features
- **Zen Sculptor**: Minimalist initial prompt interface.
- **Utility Master**: Powerful 3-column workspace for iteration.
- **Nudge Engine**: AST-constrained style updates (Tailwind classes).
- **Durable State**: Real-time sync and history via Cloudflare Durable Objects.
- **Streaming Generation**: Real-time SSE streaming for AI responses.
- **Export**: Production-ready code export as a ZIP bundle.

## Tech Stack
- **Runtime**: Bun
- **Framework**: Hono
- **Infrastructure**: Cloudflare Workers, Durable Objects, D1, R2, KV, Queues
- **Frontend**: Vite, Vite SSR Components, Tailwind CSS v4
- **AI**: Anthropic Claude SDK
- **Validation**: Zod

## Repository Structure
- `my-app/`: Main application directory.
  - `src/`: Source code.
    - `features/`: Core business logic (chat, nudge-engine, state-manager, etc.).
    - `components/`: UI components (ZenSculptor, UtilityMaster, etc.).
    - `infrastructure/`: Cloudflare-specific implementations (Durable Objects, D1).
  - `public/`: Static assets.
  - `wrangler.toml`: Cloudflare Workers configuration.
