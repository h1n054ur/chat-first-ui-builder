/**
 * VibeCard Component
 * 
 * Displays a vibe option in the gallery.
 * Uses anchor tag for navigation (server-side rendering compatible).
 */

import type { VibeTokens } from '../../features/nudge-engine/vibes';

interface VibeCardProps {
  vibe: VibeTokens;
  selected: boolean;
}

export function VibeCard({ vibe, selected }: VibeCardProps) {
  const borderClass = selected 
    ? 'ring-2 ring-indigo-500 ring-offset-2' 
    : 'border border-slate-200 hover:border-slate-300';

  return (
    <a
      href={`/?vibe=${vibe.id}`}
      class={`block rounded-lg p-4 text-left transition-all ${borderClass}`}
      style={{
        backgroundColor: vibe.colors.surface,
        color: vibe.colors.text,
      }}
    >
      <div class="mb-3 flex items-center gap-2">
        <div
          class="h-4 w-4 rounded-full"
          style={{ backgroundColor: vibe.colors.primary }}
        />
        <div
          class="h-4 w-4 rounded-full"
          style={{ backgroundColor: vibe.colors.accent }}
        />
        <div
          class="h-4 w-4 rounded-full"
          style={{ backgroundColor: vibe.colors.secondary }}
        />
      </div>
      <h3
        class="text-lg font-semibold"
        style={{ fontFamily: vibe.typography.fontSans }}
      >
        {vibe.name}
      </h3>
      <p
        class="mt-1 text-sm"
        style={{ color: vibe.colors.textMuted }}
      >
        {vibe.description}
      </p>
      {selected && (
        <div class="mt-2 text-xs font-medium text-indigo-600">
          Selected
        </div>
      )}
    </a>
  );
}
