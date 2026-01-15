/**
 * Utility Master - Professional AI IDE Workspace
 * 
 * "Void Shell" Architecture - Bolt/Replit Parity
 * 
 * Epic 6: The preview canvas is the BACKGROUND (z-0)
 *         All tool panels FLOAT on top with glassmorphism
 * 
 * Epic 7: SSE streaming with live thinking state
 * Epic 8: Digital Clay - click elements to target them
 * Epic 9: Visual diff ghosting for nudge feedback
 */

import type { FC } from 'hono/jsx';

interface HistoryItem {
  id: string;
  type: 'generate' | 'nudge' | 'undo';
  description: string;
  timestamp: string;
}

interface ThinkingLog {
  timestamp: string;
  message: string;
  type?: 'default' | 'success' | 'accent';
}

interface UtilityMasterProps {
  projectId: string;
  vibeId?: string;
  componentJsx?: string;
  history?: HistoryItem[];
  isStreaming?: boolean;
  streamingPhase?: string;
  thinkingLogs?: ThinkingLog[];
  selectedElement?: { tag: string; classes: string[] } | null;
}

export const UtilityMaster: FC<UtilityMasterProps> = ({ 
  projectId, 
  vibeId = 'minimalist',
  componentJsx = '',
  history = [],
  isStreaming = false,
  streamingPhase = 'Generating...',
  thinkingLogs = [],
  selectedElement = null
}) => {
  const iframeScript = `
    <script>
      // Story 8.1: Bidirectional postMessage Sync
      document.addEventListener('click', function(e) {
        e.preventDefault();
        const el = e.target;
        const rect = el.getBoundingClientRect();
        window.parent.postMessage({
          type: 'element-selected',
          data: {
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            classes: Array.from(el.classList),
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
          }
        }, '*');
      });
      
      // Highlight on hover
      let hoverOverlay = null;
      document.addEventListener('mouseover', function(e) {
        if (!hoverOverlay) {
          hoverOverlay = document.createElement('div');
          hoverOverlay.style.cssText = 'position:fixed;pointer-events:none;border:1px dashed rgba(139,92,246,0.5);background:rgba(139,92,246,0.05);transition:all 0.1s ease;z-index:9999;';
          document.body.appendChild(hoverOverlay);
        }
        const rect = e.target.getBoundingClientRect();
        hoverOverlay.style.top = rect.top + 'px';
        hoverOverlay.style.left = rect.left + 'px';
        hoverOverlay.style.width = rect.width + 'px';
        hoverOverlay.style.height = rect.height + 'px';
        hoverOverlay.style.opacity = '1';
      });
      document.addEventListener('mouseout', function() {
        if (hoverOverlay) hoverOverlay.style.opacity = '0';
      });
    </script>
  `;

  return (
    <div class="void-shell" id="workspace">
      {/* Story 6.1: Full-Bleed Preview Canvas (z-0 background) */}
      <div class="void-canvas" id="void-canvas">
        <div class="preview-container viewport-desktop" id="preview-container">
          {componentJsx ? (
            <iframe
              id="preview-iframe"
              class="preview-iframe"
              srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 24px; min-height: 100vh; cursor: crosshair; }
    * { cursor: crosshair !important; }
  </style>
</head>
<body>${componentJsx}${iframeScript}</body>
</html>`}
              title="Component Preview"
            />
          ) : (
            <div class="h-full flex items-center justify-center bg-[#0a0a0b]">
              <div class="text-center">
                <div class="w-20 h-20 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                  <svg class="w-10 h-10 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <p class="text-lg text-[var(--text-muted)] mb-2">Your component will appear here</p>
                <p class="text-sm text-[var(--text-subtle)]">Press <kbd class="px-2 py-1 bg-[var(--glass-hover)] rounded text-xs">Cmd+K</kbd> to start</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Story 8.2: Indigo Selector Overlay */}
      <div class={`selection-overlay ${selectedElement ? 'visible' : ''}`} id="selection-overlay">
        {selectedElement && (
          <span class="selection-label">{`<${selectedElement.tag}>`}</span>
        )}
      </div>

      {/* Story 6.3: Top Control Pill */}
      <div class="control-pill">
        <div class="control-pill-section">
          <div class="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-xs font-bold text-white">02</div>
          <span class="text-sm font-medium">{projectId.slice(0, 8)}</span>
        </div>
        
        <div class="control-pill-divider"></div>
        
        <div class="control-pill-section">
          <button 
            class="viewport-btn active" 
            id="btn-desktop"
            onclick="document.getElementById('preview-container').className='preview-container viewport-desktop'; document.querySelectorAll('.viewport-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');"
          >
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Desktop
          </button>
          <button 
            class="viewport-btn" 
            id="btn-tablet"
            onclick="document.getElementById('preview-container').className='preview-container viewport-tablet'; document.querySelectorAll('.viewport-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');"
          >
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Tablet
          </button>
          <button 
            class="viewport-btn" 
            id="btn-mobile"
            onclick="document.getElementById('preview-container').className='preview-container viewport-mobile'; document.querySelectorAll('.viewport-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');"
          >
            <svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Mobile
          </button>
        </div>
        
        <div class="control-pill-divider"></div>
        
        <div class="control-pill-section">
          <button class="viewport-btn" onclick="fetch('/api/projects/'+'{projectId}'+'/undo',{method:'POST'}).then(()=>location.reload())">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button class="viewport-btn" onclick="fetch('/api/projects/'+'{projectId}'+'/redo',{method:'POST'}).then(()=>location.reload())">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel Toggle Buttons */}
      <button 
        class="panel-toggle panel-toggle-left" 
        id="toggle-left"
        onclick="document.getElementById('panel-left').classList.toggle('collapsed'); document.getElementById('void-canvas').classList.toggle('left-collapsed');"
        title="Toggle history (Cmd+B)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      </button>
      
      <button 
        class="panel-toggle panel-toggle-right" 
        id="toggle-right"
        onclick="document.getElementById('panel-right').classList.toggle('collapsed'); document.getElementById('void-canvas').classList.toggle('right-collapsed');"
        title="Toggle code (Cmd+I)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      {/* Story 6.2: Left Glass Panel - Chat/History */}
      <aside class="glass-panel panel-left" id="panel-left">
        <div class="panel-content">
          {/* Story 7.1 & 7.3: Thinking State */}
          {isStreaming && (
            <div class="thinking-indicator">
              <div class="thinking-dot"></div>
              <div class="thinking-dot"></div>
              <div class="thinking-dot"></div>
              <span class="text-sm text-[var(--accent)]">Generating...</span>
            </div>
          )}

          {/* Selected Element Context */}
          {selectedElement && (
            <div class="mb-4 p-3 bg-[var(--accent-subtle)] border border-[rgba(139,92,246,0.3)] rounded-lg">
              <div class="text-xs text-[var(--accent)] font-medium mb-1">Targeting</div>
              <div class="font-mono text-sm">&lt;{selectedElement.tag}&gt;</div>
              {selectedElement.classes.length > 0 && (
                <div class="text-xs text-[var(--text-muted)] mt-1 truncate">
                  .{selectedElement.classes.slice(0, 3).join(' .')}
                </div>
              )}
            </div>
          )}

          {/* Nudge Input */}
          <div class="mb-6">
            <div class="section-title">Nudge</div>
            <form action={`/ui/nudge/${projectId}`} method="POST">
              <input
                type="text"
                name="prompt"
                placeholder={selectedElement ? `Make this ${selectedElement.tag} calmer...` : "Make it calmer..."}
                class="w-full bg-[var(--bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                required
              />
            </form>
          </div>

          {/* Quick Nudges */}
          <div class="mb-6">
            <div class="section-title">Quick Nudges</div>
            <div class="flex flex-wrap gap-2">
              {['More air', 'Tighter', 'Bolder', 'Calmer', 'Premium', 'Minimal'].map((nudge) => (
                <form action={`/ui/nudge/${projectId}`} method="POST" class="inline">
                  <input type="hidden" name="prompt" value={nudge} />
                  <button type="submit" class="zen-chip">
                    {nudge}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {/* History */}
          <div>
            <div class="section-title">History</div>
            <div class="space-y-2">
              {history.length > 0 ? (
                history.map((item, i) => (
                  <div key={i} class="p-3 rounded-lg bg-[var(--bg)] border border-[var(--glass-border)] hover:border-[var(--accent)] transition-colors cursor-pointer">
                    <div class="flex items-center gap-2 mb-1">
                      <span class={`w-2 h-2 rounded-full ${item.type === 'generate' ? 'bg-[var(--success)]' : item.type === 'nudge' ? 'bg-[var(--accent)]' : 'bg-[var(--warning)]'}`}></span>
                      <span class="text-xs text-[var(--text-subtle)] uppercase tracking-wider">{item.type}</span>
                    </div>
                    <div class="text-sm text-[var(--text)]">{item.description}</div>
                  </div>
                ))
              ) : (
                <div class="p-3 rounded-lg bg-[var(--bg)] border border-[var(--glass-border)]">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                    <span class="text-xs text-[var(--text-subtle)] uppercase tracking-wider">Generate</span>
                  </div>
                  <div class="text-sm text-[var(--text)]">Initial component</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Story 6.2: Right Glass Panel - Code/Inspector */}
      <aside class="glass-panel panel-right" id="panel-right">
        <div class="panel-content">
          {/* Active Vibe */}
          <div class="mb-6">
            <div class="section-title">Active Vibe</div>
            <div class="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[rgba(139,92,246,0.3)]">
              <div class="text-sm font-medium text-[var(--text)] capitalize">{vibeId}</div>
              <p class="text-xs text-[var(--text-muted)] mt-1">High-contrast, airy spacing</p>
            </div>
          </div>

          {/* Code Preview */}
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <div class="section-title mb-0">Code</div>
              <button 
                class="text-xs text-[var(--accent)] hover:underline"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(componentJsx || '')}).then(()=>alert('Copied!'))`}
              >
                Copy
              </button>
            </div>
            <div class="p-4 rounded-xl bg-[var(--bg)] border border-[var(--glass-border)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto max-h-80 overflow-y-auto">
              <pre class="whitespace-pre-wrap">{componentJsx || '// No component generated yet'}</pre>
            </div>
          </div>

          {/* Export */}
          <div>
            <a href={`/api/projects/${projectId}/export`} class="btn-primary w-full flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Code
            </a>
          </div>

          {/* Shortcuts */}
          <div class="mt-6">
            <div class="section-title">Shortcuts</div>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-[var(--text-muted)]">Command bar</span>
                <kbd class="px-2 py-0.5 bg-[var(--glass-hover)] rounded text-[10px]">⌘K</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--text-muted)]">Toggle panels</span>
                <kbd class="px-2 py-0.5 bg-[var(--glass-hover)] rounded text-[10px]">⌘B / ⌘I</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--text-muted)]">Undo / Redo</span>
                <kbd class="px-2 py-0.5 bg-[var(--glass-hover)] rounded text-[10px]">⌘Z / ⌘⇧Z</kbd>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Story 8.3: Floating OmniBox Command Palette (Cmd+K) */}
      <div class="omnibox-backdrop" id="omnibox-backdrop" onclick="this.classList.remove('visible'); document.getElementById('omnibox').classList.remove('visible');"></div>
      <div class="omnibox" id="omnibox">
        {selectedElement && (
          <div class="omnibox-context">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>Targeting: &lt;{selectedElement.tag}&gt;</span>
          </div>
        )}
        <div class="omnibox-input-wrapper">
          <form action={selectedElement ? `/ui/nudge/${projectId}` : `/ui/generate`} method="POST" id="omnibox-form">
            <input type="hidden" name="projectId" value={projectId} />
            <input 
              type="text" 
              name="prompt" 
              class="omnibox-input" 
              placeholder={selectedElement ? "Describe the change..." : "What would you like to build?"} 
              id="omnibox-input"
              autocomplete="off"
            />
          </form>
        </div>
        
        {/* Command sections */}
        <div class="omnibox-suggestions" id="omnibox-suggestions">
          {/* Quick Actions */}
          <div class="omnibox-section-title">Quick Actions</div>
          <div class="omnibox-suggestion" onclick="document.getElementById('code-editor-overlay').classList.toggle('visible'); document.getElementById('omnibox-backdrop').classList.remove('visible'); document.getElementById('omnibox').classList.remove('visible');">
            <div class="omnibox-suggestion-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div class="omnibox-suggestion-content">
              <div class="omnibox-suggestion-title">Toggle Code Editor</div>
              <div class="omnibox-suggestion-description">View and edit the generated code</div>
            </div>
            <div class="omnibox-suggestion-shortcut"><kbd>Cmd+E</kbd></div>
          </div>
          
          <div class="omnibox-suggestion" onclick="fetch('/api/projects/'+'{projectId}'+'/undo',{method:'POST'}).then(()=>location.reload())">
            <div class="omnibox-suggestion-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <div class="omnibox-suggestion-content">
              <div class="omnibox-suggestion-title">Undo Last Change</div>
              <div class="omnibox-suggestion-description">Revert to previous state</div>
            </div>
            <div class="omnibox-suggestion-shortcut"><kbd>Cmd+Z</kbd></div>
          </div>
          
          <div class="omnibox-suggestion" onclick={`navigator.clipboard.writeText(${JSON.stringify(componentJsx || '')}).then(()=>{document.getElementById('omnibox-backdrop').classList.remove('visible'); document.getElementById('omnibox').classList.remove('visible'); alert('Copied to clipboard!');})`}>
            <div class="omnibox-suggestion-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="omnibox-suggestion-content">
              <div class="omnibox-suggestion-title">Copy Code</div>
              <div class="omnibox-suggestion-description">Copy JSX to clipboard</div>
            </div>
            <div class="omnibox-suggestion-shortcut"><kbd>Cmd+C</kbd></div>
          </div>
          
          {/* Design Nudges */}
          <div class="omnibox-section-title">Design Nudges</div>
          <div class="omnibox-suggestion" onclick="document.getElementById('omnibox-input').value='Make it more premium and polished'; document.getElementById('omnibox-form').submit();">
            <div class="omnibox-suggestion-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div class="omnibox-suggestion-content">
              <div class="omnibox-suggestion-title">Make it Premium</div>
              <div class="omnibox-suggestion-description">Add polish and refinement</div>
            </div>
          </div>
          
          <div class="omnibox-suggestion" onclick="document.getElementById('omnibox-input').value='Add more breathing room and whitespace'; document.getElementById('omnibox-form').submit();">
            <div class="omnibox-suggestion-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <div class="omnibox-suggestion-content">
              <div class="omnibox-suggestion-title">More Breathing Room</div>
              <div class="omnibox-suggestion-description">Increase spacing and whitespace</div>
            </div>
          </div>
          
          <div class="omnibox-suggestion" onclick="document.getElementById('omnibox-input').value='Make it feel calmer and more minimal'; document.getElementById('omnibox-form').submit();">
            <div class="omnibox-suggestion-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div class="omnibox-suggestion-content">
              <div class="omnibox-suggestion-title">Make it Calmer</div>
              <div class="omnibox-suggestion-description">Reduce visual noise, soften colors</div>
            </div>
          </div>
        </div>
        
        <div class="omnibox-hint">
          <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
          <span><kbd>Enter</kbd> to select</span>
          <span><kbd>Esc</kbd> to close</span>
        </div>
      </div>

      {/* Story 9.1: Diff Toast */}
      <div class="diff-toast" id="diff-toast">
        <div class="diff-toast-title">Style Updated</div>
        <div class="diff-toast-change">
          <span class="diff-removed">p-4</span>
          <span>→</span>
          <span class="diff-added">p-6</span>
        </div>
      </div>

      {/* Story 7.2: Live Thinking Terminal */}
      <div class={`thinking-terminal ${isStreaming ? 'visible' : ''}`} id="thinking-terminal">
        <div class="thinking-terminal-header">
          <div class="thinking-terminal-status">
            <div class="pulse"></div>
            <span class="thinking-terminal-title">AI is thinking</span>
          </div>
          <span class="thinking-terminal-phase">{streamingPhase}</span>
        </div>
        <div class="thinking-terminal-logs" id="thinking-logs">
          {thinkingLogs.length > 0 ? (
            thinkingLogs.map((log, i) => (
              <div key={i} class={`thinking-log-entry ${log.type || ''}`}>
                <span class="timestamp">{log.timestamp}</span>
                <span class="message">{log.message}</span>
              </div>
            ))
          ) : (
            <>
              <div class="thinking-log-entry">
                <span class="timestamp">0.0s</span>
                <span class="message">Initializing request...</span>
              </div>
              <div class="thinking-log-entry accent">
                <span class="timestamp">0.1s</span>
                <span class="message">Loading vibe tokens: {vibeId}</span>
              </div>
              <div class="thinking-log-entry">
                <span class="timestamp">0.2s</span>
                <span class="message">Streaming from Claude...</span>
              </div>
            </>
          )}
        </div>
        <div class="thinking-terminal-progress">
          <div class="thinking-terminal-progress-bar" id="thinking-progress" style="width: 30%;"></div>
        </div>
      </div>

      {/* Story 9.2: Translucent Code Editor Overlay */}
      <div class="code-editor-overlay" id="code-editor-overlay">
        <div class="code-editor-resize" id="code-editor-resize"></div>
        <div class="code-editor-header">
          <div class="code-editor-tabs">
            <button class="code-editor-tab active">JSX</button>
            <button class="code-editor-tab">CSS</button>
            <button class="code-editor-tab">Preview</button>
          </div>
          <div class="code-editor-actions">
            <button 
              class="code-editor-action" 
              title="Copy code"
              onclick={`navigator.clipboard.writeText(${JSON.stringify(componentJsx || '')}).then(()=>alert('Copied!'))`}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              class="code-editor-action" 
              title="Close (Cmd+E)"
              onclick="document.getElementById('code-editor-overlay').classList.remove('visible');"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="code-editor-body">
          <div class="code-editor-content">
            {componentJsx ? (
              componentJsx.split('\n').map((line, i) => (
                <div key={i} class="code-editor-line">
                  <span class="code-editor-line-number">{i + 1}</span>
                  <span class="code-editor-line-content">{line || ' '}</span>
                </div>
              ))
            ) : (
              <div class="code-editor-line">
                <span class="code-editor-line-number">1</span>
                <span class="code-editor-line-content code-comment">{'// Generate a component to see code here'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts & postMessage Handler */}
      <script dangerouslySetInnerHTML={{__html: `
        // Track selected suggestion index for keyboard nav
        let selectedSuggestionIndex = -1;
        
        // Cmd+K - Open OmniBox
        document.addEventListener('keydown', function(e) {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('omnibox-backdrop').classList.add('visible');
            document.getElementById('omnibox').classList.add('visible');
            document.getElementById('omnibox-input').focus();
            selectedSuggestionIndex = -1;
            updateSuggestionSelection();
          }
          
          // Escape - Close modals
          if (e.key === 'Escape') {
            document.getElementById('omnibox-backdrop').classList.remove('visible');
            document.getElementById('omnibox').classList.remove('visible');
            document.getElementById('code-editor-overlay').classList.remove('visible');
          }
          
          // Cmd+B - Toggle left panel
          if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            document.getElementById('panel-left').classList.toggle('collapsed');
            document.getElementById('void-canvas').classList.toggle('left-collapsed');
          }
          
          // Cmd+I - Toggle right panel (inspector)
          if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
            e.preventDefault();
            document.getElementById('panel-right').classList.toggle('collapsed');
            document.getElementById('void-canvas').classList.toggle('right-collapsed');
          }
          
          // Cmd+E - Toggle code editor overlay (Story 9.2)
          if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
            e.preventDefault();
            document.getElementById('code-editor-overlay').classList.toggle('visible');
          }
          
          // Arrow keys for OmniBox navigation
          const omnibox = document.getElementById('omnibox');
          if (omnibox && omnibox.classList.contains('visible')) {
            const suggestions = document.querySelectorAll('.omnibox-suggestion');
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
              updateSuggestionSelection();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
              updateSuggestionSelection();
            } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
              e.preventDefault();
              suggestions[selectedSuggestionIndex].click();
            }
          }
        });
        
        function updateSuggestionSelection() {
          const suggestions = document.querySelectorAll('.omnibox-suggestion');
          suggestions.forEach((s, i) => {
            s.classList.toggle('selected', i === selectedSuggestionIndex);
          });
        }

        // Story 8.1: Handle postMessage from iframe
        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'element-selected') {
            const data = e.data.data;
            const overlay = document.getElementById('selection-overlay');
            const iframe = document.getElementById('preview-iframe');
            if (iframe && overlay) {
              const iframeRect = iframe.getBoundingClientRect();
              overlay.style.top = (iframeRect.top + data.rect.top) + 'px';
              overlay.style.left = (iframeRect.left + data.rect.left) + 'px';
              overlay.style.width = data.rect.width + 'px';
              overlay.style.height = data.rect.height + 'px';
              overlay.classList.add('visible');
              
              // Update context display
              console.log('Selected:', data.tag, data.classes);
            }
          }
        });
        
        // Story 7.2: Update thinking terminal during SSE
        function updateThinkingTerminal(phase, progress, log) {
          const terminal = document.getElementById('thinking-terminal');
          const phaseEl = terminal.querySelector('.thinking-terminal-phase');
          const progressBar = document.getElementById('thinking-progress');
          const logsContainer = document.getElementById('thinking-logs');
          
          if (phaseEl) phaseEl.textContent = phase;
          if (progressBar) progressBar.style.width = progress + '%';
          if (log && logsContainer) {
            const entry = document.createElement('div');
            entry.className = 'thinking-log-entry';
            entry.innerHTML = '<span class="timestamp">' + (Date.now() / 1000).toFixed(1) + 's</span><span class="message">' + log + '</span>';
            logsContainer.appendChild(entry);
            logsContainer.scrollTop = logsContainer.scrollHeight;
          }
        }
        
        // Expose for SSE handler
        window.updateThinkingTerminal = updateThinkingTerminal;
      `}} />
    </div>
  );
};
