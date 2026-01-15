# Data Models: 02 - Chat-First UI Builder

## Cloudflare Durable Objects: StateManager
The primary source of truth for active design sessions.

### Session State (`session`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `projectId` | `string` | Unique identifier for the project. |
| `vibeId` | `string` | The active design vibe ID (e.g., "minimalist"). |
| `ast` | `Record<string, ASTComponent>` | A collection of generated JSX components. |
| `createdAt` | `string` (ISO) | Session creation timestamp. |
| `updatedAt` | `string` (ISO) | Last modification timestamp. |

### History State (`history`)
Used for Undo/Redo functionality.
- **Stack**: Maintains a history of AST snapshots.
- **Pointer**: Current position in the history stack.

## Cloudflare D1 Database
Used for long-term project persistence and metadata.
_(Schema analysis in progress - D1 is bound as `DB` in wrangler.toml)_

## Cloudflare KV
Used for caching and fast retrieval of non-transactional data.
- **Vibes**: Cached design tokens and generated CSS.
- **Sessions**: Temporary lookup for project availability.

## R2 Storage
- **Export Bundles**: Generated ZIP files for project hand-off.
- **Static Assets**: User-uploaded or AI-generated images.
