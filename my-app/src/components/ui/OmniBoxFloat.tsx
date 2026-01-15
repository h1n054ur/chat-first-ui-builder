/**
 * Floating OmniBox Command Bar
 * 
 * Raycast-style command palette for intent-based nudges.
 * Triggered via Cmd+K (Mac) or Ctrl+K (Windows/Linux).
 * 
 * Per UX Spec: "A floating, context-aware interaction point for intent-based nudges"
 */

import type { FC } from 'hono/jsx';

interface OmniBoxFloatProps {
  isOpen?: boolean;
  selectedElement?: string | null;
  suggestions?: string[];
}

export const OmniBoxFloat: FC<OmniBoxFloatProps> = ({ 
  isOpen = false, 
  selectedElement = null,
  suggestions = ['More air', 'Tighter spacing', 'Make it calmer', 'More premium', 'Bolder']
}) => {
  const contextText = selectedElement 
    ? `Sculpting ${selectedElement}...` 
    : 'What would you like to create?';

  return (
    <div 
      id="omnibox-float"
      class={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] ${isOpen ? '' : 'hidden pointer-events-none'}`}
      data-omnibox-backdrop
    >
      {/* Backdrop */}
      <div 
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        data-omnibox-close
      />
      
      {/* Command Bar */}
      <div 
        class="relative w-full max-w-2xl animate-in fade-in slide-in-from-top-4 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div class="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl shadow-black/50">
          {/* Input Area */}
          <div class="relative border-b border-slate-800">
            {/* Context Badge */}
            {selectedElement && (
              <div class="absolute left-4 top-4">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-1 text-[11px] font-medium text-indigo-300 border border-indigo-500/30">
                  <span class="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  {selectedElement}
                </span>
              </div>
            )}
            
            <input
              type="text"
              id="omnibox-input"
              placeholder={contextText}
              class={`w-full bg-transparent px-5 py-5 text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none ${selectedElement ? 'pt-12' : ''}`}
              autocomplete="off"
              autofocus
            />
            
            {/* Keyboard Hints */}
            <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span class="text-[10px] text-slate-600">Press</span>
              <kbd class="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">↵</kbd>
              <span class="text-[10px] text-slate-600">to send</span>
            </div>
          </div>
          
          {/* Suggestions */}
          <div class="p-3">
            <div class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Quick Nudges
            </div>
            <div class="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  class="group rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  data-suggestion={suggestion}
                >
                  <span class="mr-1.5 text-slate-500 group-hover:text-indigo-400">"</span>
                  {suggestion}
                  <span class="ml-1.5 text-slate-500 group-hover:text-indigo-400">"</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div class="flex items-center justify-between border-t border-slate-800 bg-slate-900/50 px-4 py-2.5">
            <div class="flex items-center gap-4 text-[11px] text-slate-500">
              <span class="flex items-center gap-1.5">
                <kbd class="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px] font-mono">Tab</kbd>
                <span>autocomplete</span>
              </span>
              <span class="flex items-center gap-1.5">
                <kbd class="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px] font-mono">Esc</kbd>
                <span>close</span>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span class="text-[11px] text-slate-500">AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Client-side script to handle OmniBox interactions
 * This should be included in the page and executed on the client
 */
export const omniboxScript = `
<script>
(function() {
  const omnibox = document.getElementById('omnibox-float');
  const input = document.getElementById('omnibox-input');
  const backdrop = document.querySelector('[data-omnibox-backdrop]');
  const closeBtn = document.querySelector('[data-omnibox-close]');
  
  function openOmnibox() {
    omnibox?.classList.remove('hidden', 'pointer-events-none');
    input?.focus();
    document.body.style.overflow = 'hidden';
  }
  
  function closeOmnibox() {
    omnibox?.classList.add('hidden', 'pointer-events-none');
    document.body.style.overflow = '';
    if (input) input.value = '';
  }
  
  // Cmd+K / Ctrl+K handler
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const isOpen = !omnibox?.classList.contains('hidden');
      isOpen ? closeOmnibox() : openOmnibox();
    }
    if (e.key === 'Escape') {
      closeOmnibox();
    }
  });
  
  // Close on backdrop click
  closeBtn?.addEventListener('click', closeOmnibox);
  
  // Handle suggestion clicks
  document.querySelectorAll('[data-suggestion]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const suggestion = e.currentTarget.dataset.suggestion;
      if (input) input.value = suggestion;
      input?.focus();
    });
  });
  
  // Handle form submission
  input?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      const prompt = input.value.trim();
      // Dispatch custom event for the app to handle
      window.dispatchEvent(new CustomEvent('omnibox:submit', { detail: { prompt } }));
      closeOmnibox();
    }
  });
})();
</script>
`;
