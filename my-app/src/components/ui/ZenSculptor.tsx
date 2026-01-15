/**
 * Zen Sculptor - Initial Screen
 * 
 * The calm, minimal first screen where users describe what they want to create.
 * Per UX Spec: "Zen Sculptor" - Hyper-minimalist, preview-centric canvas
 * 
 * Flow: User types -> Transitions to Utility Master workspace
 */

import type { FC } from 'hono/jsx';

interface ZenSculptorProps {
  projectId?: string;
}

export const ZenSculptor: FC<ZenSculptorProps> = ({ projectId }) => {
  return (
    <div class="zen-container">
      {/* Logo/Brand */}
      <div class="mb-12 text-center animate-fade-in" style="animation-delay: 0.1s">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent)] mb-6 accent-glow">
          <span class="text-2xl font-bold text-white">02</span>
        </div>
        <h1 class="text-3xl font-semibold tracking-tight mb-2">What are you building?</h1>
        <p class="text-muted text-base">Describe your UI component and watch it come to life.</p>
      </div>

      {/* Main Input */}
      <div class="zen-input-wrapper">
        <form 
          id="zen-form"
          hx-post="/api/generate"
          hx-target="#app-root"
          hx-swap="innerHTML"
          hx-indicator="#zen-loading"
        >
          <input type="hidden" name="projectId" value={projectId || ''} />
          
          <div class="relative">
            <input
              type="text"
              name="prompt"
              class="input-zen pr-32"
              placeholder="A hero section with a bold headline and CTA button..."
              autocomplete="off"
              autofocus
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <kbd class="chip text-xs px-2 py-1">↵</kbd>
            </div>
          </div>
        </form>

        {/* Loading State */}
        <div id="zen-loading" class="htmx-indicator mt-6 text-center">
          <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--panel)] border border-[var(--line)]">
            <span class="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
            <span class="text-sm text-muted">Generating your component...</span>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div class="mt-8 animate-fade-in" style="animation-delay: 0.3s">
          <p class="text-xs text-muted uppercase tracking-widest mb-4 text-center">Quick starts</p>
          <div class="flex flex-wrap justify-center gap-2">
            {[
              'Hero section with gradient',
              'Pricing table',
              'Feature grid',
              'Testimonial carousel',
              'Contact form',
              'Navigation bar'
            ].map((suggestion, i) => (
              <button
                key={i}
                type="button"
                class="chip hover:border-[var(--accent)] hover:text-[var(--text)] transition-all cursor-pointer"
                onclick={`document.querySelector('input[name="prompt"]').value = '${suggestion}'; document.querySelector('input[name="prompt"]').focus();`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Hints */}
      <div class="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-xs text-muted animate-fade-in" style="animation-delay: 0.5s">
        <span class="flex items-center gap-2">
          <kbd class="chip px-2 py-1">⌘K</kbd>
          <span>Command bar</span>
        </span>
        <span class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
          <span>AI Ready</span>
        </span>
      </div>
    </div>
  );
};
