import { clsx } from 'clsx';
import type { RecordingState } from '@/types';

interface StatusIndicatorProps {
  state: RecordingState;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusIndicator({
  state,
  size = 'md',
  showLabel = false,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses: Record<RecordingState, string> = {
    idle: 'bg-surface-400 dark:bg-surface-500',
    countdown: 'bg-amber-500',
    recording: 'bg-red-500',
    paused: 'bg-amber-500',
    stopping: 'bg-surface-400 dark:bg-surface-500',
    error: 'bg-red-700',
  };

  const labelMap: Record<RecordingState, string> = {
    idle: 'Ready',
    countdown: 'Starting...',
    recording: 'Recording',
    paused: 'Paused',
    stopping: 'Stopping...',
    error: 'Error',
  };

  const isPulsing = state === 'recording';

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex">
        <span
          className={clsx(
            'rounded-full',
            sizeClasses[size],
            colorClasses[state],
            isPulsing && 'animate-ping absolute inline-flex opacity-75'
          )}
        />
        {isPulsing && (
          <span
            className={clsx(
              'rounded-full relative inline-flex',
              sizeClasses[size],
              colorClasses[state]
            )}
          />
        )}
        {!isPulsing && (
          <span className="sr-only" />
        )}
      </span>
      {showLabel && (
        <span
          className={clsx(
            'text-sm font-medium',
            state === 'recording' && 'text-red-600 dark:text-red-400',
            state === 'paused' && 'text-amber-600 dark:text-amber-400',
            state === 'error' && 'text-red-700 dark:text-red-500',
            state === 'idle' && 'text-surface-500 dark:text-surface-400',
            state === 'countdown' && 'text-amber-600 dark:text-amber-400',
            state === 'stopping' && 'text-surface-500 dark:text-surface-400'
          )}
        >
          {labelMap[state]}
        </span>
      )}
    </div>
  );
}
