/**
 * Cloudflare Worker Bindings Type Definition
 * 
 * This interface defines all Cloudflare bindings available in the Worker environment.
 * Run `bun run cf-typegen` after modifying wrangler.toml to regenerate types.
 */
export interface CloudflareBindings {
  /** D1 Database for persistent storage */
  DB: D1Database;
  
  /** R2 Bucket for asset storage */
  ASSETS: R2Bucket;
  
  /** KV Namespace for caching */
  CACHE: KVNamespace;
  
  /** Durable Object for real-time session state */
  STATE_MANAGER: DurableObjectNamespace;
  
  /** Queue for background job processing */
  TASKS: Queue;

  /** Anthropic API Key for Claude */
  ANTHROPIC_API_KEY: string;

  /** AI Model to use (optional, defaults to claude-sonnet-4-20250514) */
  AI_MODEL?: string;
}

/**
 * Standard API Response Wrapper
 * All API responses MUST use this format.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
