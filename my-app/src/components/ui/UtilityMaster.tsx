/**
 * Utility Master - Workspace Screen
 * 
 * The dense, powerful workspace that appears after the user provides input.
 * Per UX Spec: "Pilot's Cockpit" density with "Zen Sculptor" focus
 * 
 * Layout: Sidebar (History/Chat) | Canvas (Preview) | Inspector (Code/Vibe)
 */

import type { FC } from 'hono/jsx';

interface HistoryItem {
  id: string;
  type: 'generate' | 'nudge' | 'undo';
  description: string;
  timestamp: string;
}

interface UtilityMasterProps {
  projectId: string;
  vibeId?: string;
  componentJsx?: string;
  history?: HistoryItem[];
}

export const UtilityMaster: FC<UtilityMasterProps> = ({ 
  projectId, 
  vibeId = 'minimalist',
  componentJsx = '',
  history = []
}) => {
  return (
    <div class="workspace">
      {/* Header */}
      <header class="workspace-header">
        <div class="flex items-center gap-4">
          <div class="nav-dot flex items-center justify-center text-sm font-bold text-white">02</div>
          <div>
            <div class="text-sm font-medium">Project Workspace</div>
            <div class="text-xs text-muted font-mono">{projectId}</div>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          {/* Viewport Toggle */}
          <div class="flex items-center gap-1 p-1 rounded-full bg-[rgba(255,255,255,0.04)] border border-[var(--line)]">
            <button class="px-3 py-1.5 text-xs rounded-full bg-[var(--panel)] text-[var(--text)]">Desktop</button>
            <button class="px-3 py-1.5 text-xs rounded-full text-muted hover:text-[var(--text)] transition-colors">Tablet</button>
            <button class="px-3 py-1.5 text-xs rounded-full text-muted hover:text-[var(--text)] transition-colors">Mobile</button>
          </div>
          
          {/* Actions */}
          <button class="btn-ghost flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Undo
          </button>
          <button class="btn-ghost flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
            Redo
          </button>
          <button class="btn-accent">Export Code</button>
        </div>
      </header>

      {/* Left Sidebar - History & Chat */}
      <aside class="workspace-sidebar">
        <div class="p-4">
          {/* Chat Input */}
          <div class="mb-6">
            <div class="text-xs text-muted uppercase tracking-widest mb-3">Nudge</div>
            <div class="relative">
              <input
                type="text"
                placeholder="Make it calmer..."
                class="w-full bg-[rgba(255,255,255,0.04)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-muted focus:outline-none focus:border-[var(--accent)] transition-colors"
                hx-post="/api/nudge"
                hx-trigger="keydown[key=='Enter']"
                hx-target="#preview-content"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd class="text-[10px] text-muted px-1.5 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)]">⌘</kbd>
                <kbd class="text-[10px] text-muted px-1.5 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)]">K</kbd>
              </div>
            </div>
          </div>

          {/* Quick Nudges */}
          <div class="mb-6">
            <div class="text-xs text-muted uppercase tracking-widest mb-3">Quick Nudges</div>
            <div class="flex flex-wrap gap-2">
              {['More air', 'Tighter', 'Bolder', 'Calmer', 'Premium'].map((nudge, i) => (
                <button key={i} class="chip text-xs hover:border-[var(--accent)] hover:text-[var(--text)] transition-all cursor-pointer">
                  {nudge}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div>
            <div class="text-xs text-muted uppercase tracking-widest mb-3">History</div>
            <div class="space-y-2">
              {history.length > 0 ? (
                history.map((item, i) => (
                  <div key={i} class="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--line)] hover:border-[var(--accent)] transition-colors cursor-pointer">
                    <div class="flex items-center gap-2 mb-1">
                      <span class={`w-1.5 h-1.5 rounded-full ${item.type === 'generate' ? 'bg-[var(--success)]' : item.type === 'nudge' ? 'bg-[var(--accent)]' : 'bg-[var(--warning)]'}`}></span>
                      <span class="text-[10px] text-muted uppercase tracking-wider">{item.type}</span>
                    </div>
                    <div class="text-xs text-[var(--text)]">{item.description}</div>
                  </div>
                ))
              ) : (
                <>
                  <div class="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--line)]">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
                      <span class="text-[10px] text-muted uppercase tracking-wider">Generate</span>
                    </div>
                    <div class="text-xs text-[var(--text)]">Initial component created</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <main class="workspace-canvas p-6">
        <div class="h-full flex items-center justify-center">
          <div id="preview-content" class="w-full max-w-4xl h-full preview-frame">
            {componentJsx ? (
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>body { margin: 0; padding: 20px; }</style>
                  </head>
                  <body>${componentJsx}</body>
                  </html>
                `}
                class="w-full h-full border-none"
                title="Component Preview"
              />
            ) : (
              <div class="h-full flex items-center justify-center text-muted">
                <div class="text-center">
                  <div class="w-16 h-16 rounded-2xl bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <p class="text-sm">Your component will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar - Inspector */}
      <aside class="workspace-inspector">
        <div class="p-4">
          {/* Active Vibe */}
          <div class="mb-6">
            <div class="text-xs text-muted uppercase tracking-widest mb-3">Active Vibe</div>
            <div class="p-4 rounded-xl border border-[color-mix(in_srgb,var(--accent),transparent_50%)] bg-[color-mix(in_srgb,var(--accent),transparent_90%)]">
              <div class="text-sm font-medium text-[var(--text)] mb-1 capitalize">{vibeId}</div>
              <p class="text-xs text-muted">High-contrast, airy spacing, geometric typography.</p>
            </div>
          </div>

          {/* Code Preview */}
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs text-muted uppercase tracking-widest">Code</div>
              <button class="text-xs text-[var(--accent)] hover:underline">Copy</button>
            </div>
            <div class="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] font-mono text-xs text-muted overflow-x-auto">
              <pre class="whitespace-pre-wrap">{componentJsx || '// No component generated yet'}</pre>
            </div>
          </div>

          {/* Element Inspector */}
          <div class="mt-6">
            <div class="text-xs text-muted uppercase tracking-widest mb-3">Selected Element</div>
            <div class="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--line)]">
              <div class="text-xs text-muted mb-2">No element selected</div>
              <p class="text-[11px] text-muted">Click an element in the preview to inspect and nudge it.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
