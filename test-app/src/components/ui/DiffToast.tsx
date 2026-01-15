/**
 * DiffToast Component
 * 
 * Shows the Tailwind classes added/removed after a nudge operation.
 */

import type { StyleDelta } from '../../features/nudge-engine/patcher';

interface DiffToastProps {
  /** The style delta that was applied */
  delta: StyleDelta;
  /** Element that was modified */
  elementName?: string;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
  /** Position on screen */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function DiffToast({
  delta,
  elementName = 'Element',
  onDismiss,
  position = 'bottom-right',
}: DiffToastProps) {
  const hasChanges = delta.add.length > 0 || delta.remove.length > 0;
  
  if (!hasChanges) return null;
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };
  
  return (
    <div
      class={`fixed ${positionClasses[position]} z-50 w-80 animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
        {/* Header */}
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span class="text-sm font-medium text-slate-900">Style Updated</span>
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <p class="mb-3 text-xs text-slate-500">{elementName}</p>
        
        {/* Added Classes */}
        {delta.add.length > 0 && (
          <div class="mb-2">
            <span class="text-xs font-medium text-green-600">Added:</span>
            <div class="mt-1 flex flex-wrap gap-1">
              {delta.add.map((cls) => (
                <span
                  key={cls}
                  class="inline-flex items-center rounded bg-green-100 px-1.5 py-0.5 text-xs font-mono text-green-700"
                >
                  +{cls}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Removed Classes */}
        {delta.remove.length > 0 && (
          <div>
            <span class="text-xs font-medium text-red-600">Removed:</span>
            <div class="mt-1 flex flex-wrap gap-1">
              {delta.remove.map((cls) => (
                <span
                  key={cls}
                  class="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-xs font-mono text-red-700 line-through"
                >
                  -{cls}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Container for multiple diff toasts
 */
interface DiffToastContainerProps {
  toasts: Array<{
    id: string;
    delta: StyleDelta;
    elementName?: string;
  }>;
  onDismiss?: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function DiffToastContainer({
  toasts,
  onDismiss,
  position = 'bottom-right',
}: DiffToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };
  
  const stackDirection = position.startsWith('top') ? 'flex-col' : 'flex-col-reverse';
  
  return (
    <div class={`fixed ${positionClasses[position]} z-50 ${stackDirection} gap-2`}>
      {toasts.map((toast) => (
        <DiffToast
          key={toast.id}
          delta={toast.delta}
          elementName={toast.elementName}
          onDismiss={onDismiss ? () => onDismiss(toast.id) : undefined}
          position={position}
        />
      ))}
    </div>
  );
}
