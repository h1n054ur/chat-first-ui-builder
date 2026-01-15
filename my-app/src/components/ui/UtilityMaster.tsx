/**
 * Utility Master - Workspace Screen
 * 
 * The dense, powerful workspace that appears after the user provides input.
 * Per UX Spec: "Pilot's Cockpit" density with "Zen Sculptor" focus
 * 
 * Layout: Sidebar (History/Chat) | Canvas (Preview) | Inspector (Code/Vibe)
 * 
 * Epic 6 Features:
 * - Story 6.1: Three-Tier Main Layout (380px sidebar, collapsible)
 * - Story 6.2: App Chrome & Branding (header with logo, footer hints)
 * - Story 6.3: Responsive Viewport Simulator (Desktop/Tablet/Mobile toggle)
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
    <div class="workspace" id="workspace">
      {/* Header - Story 6.2: App Chrome & Branding */}
      <header class="workspace-header">
        <div class="flex items-center gap-4">
          {/* Sidebar Toggle */}
          <button 
            class="btn-ghost p-2"
            onclick="document.getElementById('workspace').classList.toggle('sidebar-collapsed')"
            title="Toggle sidebar (Cmd+B)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          
          {/* Brand */}
          <div class="nav-dot flex items-center justify-center text-sm font-bold text-white">02</div>
          <div>
            <div class="text-sm font-medium">Project Workspace</div>
            <div class="text-xs text-muted font-mono">{projectId}</div>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          {/* Story 6.3: Viewport Simulator Toggle */}
          <div class="flex items-center gap-1 p-1 rounded-full bg-[rgba(255,255,255,0.04)] border border-[var(--line)]">
            <button 
              class="viewport-btn px-3 py-1.5 text-xs rounded-full bg-[var(--panel)] text-[var(--text)]"
              onclick="document.getElementById('preview-frame').className = 'w-full h-full preview-frame viewport-desktop'; document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('bg-[var(--panel)]', 'text-[var(--text)]')); this.classList.add('bg-[var(--panel)]', 'text-[var(--text)]');"
            >
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Desktop
              </span>
            </button>
            <button 
              class="viewport-btn px-3 py-1.5 text-xs rounded-full text-muted hover:text-[var(--text)] transition-colors"
              onclick="document.getElementById('preview-frame').className = 'w-full h-full preview-frame viewport-tablet'; document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('bg-[var(--panel)]', 'text-[var(--text)]')); this.classList.add('bg-[var(--panel)]', 'text-[var(--text)]');"
            >
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Tablet
              </span>
            </button>
            <button 
              class="viewport-btn px-3 py-1.5 text-xs rounded-full text-muted hover:text-[var(--text)] transition-colors"
              onclick="document.getElementById('preview-frame').className = 'w-full h-full preview-frame viewport-mobile'; document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('bg-[var(--panel)]', 'text-[var(--text)]')); this.classList.add('bg-[var(--panel)]', 'text-[var(--text)]');"
            >
              <span class="flex items-center gap-1.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Mobile
              </span>
            </button>
          </div>
          
          {/* Actions */}
          <button class="btn-ghost flex items-center gap-2" onclick="fetch('/api/projects/' + '{projectId}' + '/undo', {method: 'POST'}).then(() => location.reload())">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Undo
          </button>
          <button class="btn-ghost flex items-center gap-2" onclick="fetch('/api/projects/' + '{projectId}' + '/redo', {method: 'POST'}).then(() => location.reload())">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
            Redo
          </button>
          <a href={`/api/projects/${projectId}/export`} class="btn-accent">Export Code</a>
          
          {/* Inspector Toggle */}
          <button 
            class="btn-ghost p-2"
            onclick="document.getElementById('workspace').classList.toggle('inspector-collapsed')"
            title="Toggle inspector (Cmd+I)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Left Sidebar - History & Chat (Story 6.1: Collapsible) */}
      <aside class="workspace-sidebar">
        <div class="p-4">
          {/* Chat Input */}
          <div class="mb-6">
            <div class="text-xs text-muted uppercase tracking-widest mb-3">Nudge</div>
            <form action={`/ui/nudge/${projectId}`} method="POST">
              <input
                type="text"
                name="prompt"
                placeholder="Make it calmer..."
                class="w-full bg-[rgba(255,255,255,0.04)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-muted focus:outline-none focus:border-[var(--accent)] transition-colors"
                required
              />
            </form>
          </div>

          {/* Quick Nudges */}
          <div class="mb-6">
            <div class="text-xs text-muted uppercase tracking-widest mb-3">Quick Nudges</div>
            <div class="flex flex-wrap gap-2">
              {['More air', 'Tighter', 'Bolder', 'Calmer', 'Premium'].map((nudge, i) => (
                <form key={i} action={`/ui/nudge/${projectId}`} method="POST" class="inline">
                  <input type="hidden" name="prompt" value={nudge} />
                  <button type="submit" class="chip text-xs hover:border-[var(--accent)] hover:text-[var(--text)] transition-all cursor-pointer">
                    {nudge}
                  </button>
                </form>
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

      {/* Main Canvas (Story 6.3: Viewport Simulator) */}
      <main class="workspace-canvas p-6">
        <div class="h-full flex items-center justify-center">
          <div id="preview-frame" class="w-full h-full preview-frame viewport-desktop">
            {componentJsx ? (
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>body { margin: 0; padding: 20px; min-height: 100vh; }</style>
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
                  <p class="text-xs text-muted mt-2">Type a description in the sidebar to generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Hints - Story 6.2: App Chrome */}
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 text-xs text-muted">
          <span class="flex items-center gap-2">
            <kbd class="chip px-2 py-1 text-[10px]">Cmd+B</kbd>
            <span>Toggle sidebar</span>
          </span>
          <span class="flex items-center gap-2">
            <kbd class="chip px-2 py-1 text-[10px]">Cmd+K</kbd>
            <span>Command bar</span>
          </span>
          <span class="flex items-center gap-2">
            <kbd class="chip px-2 py-1 text-[10px]">Cmd+Z</kbd>
            <span>Undo</span>
          </span>
        </div>
      </main>

      {/* Right Sidebar - Inspector (Story 6.1: Collapsible) */}
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
              <button 
                class="text-xs text-[var(--accent)] hover:underline"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(componentJsx || '// No component generated yet')}).then(() => alert('Copied to clipboard!'))`}
              >
                Copy
              </button>
            </div>
            <div class="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] font-mono text-xs text-muted overflow-x-auto max-h-64 overflow-y-auto">
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
          
          {/* Keyboard Shortcuts */}
          <div class="mt-6">
            <div class="text-xs text-muted uppercase tracking-widest mb-3">Shortcuts</div>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-muted">Toggle sidebar</span>
                <kbd class="chip px-2 py-0.5 text-[10px]">Cmd+B</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Command bar</span>
                <kbd class="chip px-2 py-0.5 text-[10px]">Cmd+K</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Toggle inspector</span>
                <kbd class="chip px-2 py-0.5 text-[10px]">Cmd+I</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Undo</span>
                <kbd class="chip px-2 py-0.5 text-[10px]">Cmd+Z</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Redo</span>
                <kbd class="chip px-2 py-0.5 text-[10px]">Cmd+Shift+Z</kbd>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Keyboard Shortcuts Script */}
      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('keydown', function(e) {
          // Cmd+B - Toggle sidebar
          if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            document.getElementById('workspace').classList.toggle('sidebar-collapsed');
          }
          // Cmd+I - Toggle inspector
          if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
            e.preventDefault();
            document.getElementById('workspace').classList.toggle('inspector-collapsed');
          }
        });
      `}} />
    </div>
  );
};
