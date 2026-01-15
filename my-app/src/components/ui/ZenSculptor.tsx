/**
 * Zen Sculptor - Initial Screen
 * 
 * The calm, minimal first screen where users describe what they want to create.
 * Professional AI IDE - Bolt/Replit Parity
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
      {/* Logo */}
      <div class="zen-logo animate-fade-in">02</div>
      
      {/* Title */}
      <h1 class="zen-title animate-fade-in" style="animation-delay: 0.1s">
        What are you building?
      </h1>
      <p class="zen-subtitle animate-fade-in" style="animation-delay: 0.15s">
        Describe your UI component. Be as specific as you'd like.
      </p>

      {/* Main Input */}
      <div class="zen-input-wrapper animate-slide-up" style="animation-delay: 0.2s">
        <form 
          id="zen-form"
          action="/ui/generate"
          method="POST"
        >
          <input type="hidden" name="projectId" value={projectId || ''} />
          <input type="hidden" name="vibeId" value="minimalist" />
          
          <input
            type="text"
            name="prompt"
            class="zen-input"
            placeholder="A hero section with a bold headline and gradient background..."
            autocomplete="off"
            autofocus
            required
          />
          <button type="submit" class="zen-submit">
            Generate
          </button>
        </form>
      </div>

      {/* Quick Suggestions */}
      <div class="zen-chips animate-fade-in" style="animation-delay: 0.35s">
        {[
          'Hero section with CTA',
          'Pricing table',
          'Feature grid',
          'Testimonial card',
          'Contact form',
          'Navigation bar'
        ].map((suggestion) => (
          <button
            type="button"
            class="zen-chip"
            onclick={`document.querySelector('.zen-input').value = '${suggestion}'; document.querySelector('.zen-input').focus();`}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div class="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-sm text-[var(--text-subtle)] animate-fade-in" style="animation-delay: 0.5s">
        <span class="flex items-center gap-2">
          <kbd class="px-2 py-1 bg-[var(--glass-hover)] rounded text-xs">⏎</kbd>
          <span>to generate</span>
        </span>
        <span class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[var(--success)]"></span>
          <span>AI Ready</span>
        </span>
      </div>
    </div>
  );
};
