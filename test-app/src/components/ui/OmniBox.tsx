/**
 * OmniBox Component
 * 
 * The main input box for natural language commands.
 * Shows context when an element is selected for targeting.
 */

import type { SelectedElement } from '../../features/preview-sandbox/types';

interface OmniBoxProps {
  /** Currently selected element for targeting */
  selectedElement: SelectedElement | null;
  /** Placeholder text when no element selected */
  placeholder?: string;
  /** Whether the AI is currently processing */
  isLoading?: boolean;
  /** Callback when user submits a command */
  onSubmit?: (prompt: string) => void;
  /** Callback to clear selection */
  onClearSelection?: () => void;
}

export function OmniBox({
  selectedElement,
  placeholder = 'Describe what you want to create...',
  isLoading = false,
  onSubmit,
  onClearSelection,
}: OmniBoxProps) {
  const hasSelection = selectedElement !== null;
  
  // Build context label for selected element
  const contextLabel = hasSelection
    ? `Sculpting ${selectedElement.tagName}${selectedElement.textPreview ? `: "${selectedElement.textPreview}"` : ''}`
    : null;

  return (
    <div class="w-full">
      {/* Selection Context Badge */}
      {hasSelection && (
        <div class="mb-2 flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            {contextLabel}
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Clear selection (Esc)"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Input Box */}
      <form
        class="relative"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const input = form.elements.namedItem('prompt') as HTMLInputElement;
          if (input.value.trim() && onSubmit) {
            onSubmit(input.value.trim());
            input.value = '';
          }
        }}
      >
        <input
          type="text"
          name="prompt"
          disabled={isLoading}
          placeholder={hasSelection ? 'Try "more padding" or "calmer colors"...' : placeholder}
          class={`
            w-full rounded-xl border-2 bg-white px-4 py-3 pr-12 text-slate-900
            placeholder:text-slate-400
            focus:outline-none focus:ring-0
            disabled:cursor-not-allowed disabled:opacity-50
            ${hasSelection 
              ? 'border-indigo-300 focus:border-indigo-500' 
              : 'border-slate-200 focus:border-slate-400'}
          `}
        />
        <button
          type="submit"
          disabled={isLoading}
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
      
      {/* Hint Text */}
      <p class="mt-2 text-xs text-slate-500">
        {hasSelection 
          ? 'Type a nudge like "more air", "bolder", or "calmer" to refine the selected element.'
          : 'Click an element in the preview to select it, or describe a new component to generate.'}
      </p>
    </div>
  );
}
