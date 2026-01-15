/**
 * VibePreview Component
 * 
 * Displays a preview of the selected vibe's styling.
 */

import type { VibeTokens } from '../../features/nudge-engine/vibes';

interface VibePreviewProps {
  vibe: VibeTokens;
}

export function VibePreview({ vibe }: VibePreviewProps) {
  return (
    <div
      class="rounded-lg p-6"
      style={{
        backgroundColor: vibe.colors.background,
        color: vibe.colors.text,
        fontFamily: vibe.typography.fontSans,
      }}
    >
      <h1
        class="text-3xl mb-4"
        style={{
          fontWeight: vibe.typography.headingWeight,
          fontFamily: vibe.typography.fontSerif,
        }}
      >
        {vibe.name} Preview
      </h1>
      <p
        class="mb-4"
        style={{
          color: vibe.colors.textMuted,
          fontWeight: vibe.typography.bodyWeight,
        }}
      >
        This preview demonstrates the visual signature of the {vibe.name} vibe.
        Notice the color palette, typography, and spacing.
      </p>
      <div class="flex gap-3 mb-4">
        <button
          class="px-4 py-2"
          style={{
            backgroundColor: vibe.colors.primary,
            color: vibe.colors.background,
            borderRadius: vibe.borderRadius.md,
          }}
        >
          Primary Button
        </button>
        <button
          class="px-4 py-2"
          style={{
            backgroundColor: vibe.colors.accent,
            color: vibe.colors.background,
            borderRadius: vibe.borderRadius.md,
          }}
        >
          Accent Button
        </button>
      </div>
      <div
        class="p-4"
        style={{
          backgroundColor: vibe.colors.surface,
          borderRadius: vibe.borderRadius.lg,
          border: `1px solid ${vibe.colors.border}`,
        }}
      >
        <h3
          class="text-lg mb-2"
          style={{ fontWeight: vibe.typography.headingWeight }}
        >
          Card Component
        </h3>
        <p style={{ color: vibe.colors.textMuted }}>
          A sample card using the vibe's surface color and border styling.
        </p>
      </div>
    </div>
  );
}
