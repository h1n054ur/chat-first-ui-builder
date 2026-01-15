/**
 * VibeGallery Component
 * 
 * Displays all available vibes for selection.
 * Uses href links for navigation (server-side rendering compatible).
 */

import type { VibeTokens } from '../../features/nudge-engine/vibes';
import { VibeCard } from './VibeCard';

interface VibeGalleryProps {
  vibes: VibeTokens[];
  selectedVibeId: string;
}

export function VibeGallery({ vibes, selectedVibeId }: VibeGalleryProps) {
  return (
    <div class="space-y-4">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-slate-900">Choose Your Vibe</h2>
        <p class="mt-1 text-slate-600">
          Select a design foundation for your project
        </p>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {vibes.map((vibe) => (
          <VibeCard
            key={vibe.id}
            vibe={vibe}
            selected={vibe.id === selectedVibeId}
          />
        ))}
      </div>
    </div>
  );
}
