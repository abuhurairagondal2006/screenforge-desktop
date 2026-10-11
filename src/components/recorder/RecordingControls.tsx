import { Circle, Square, Pause, Play, Camera } from 'lucide-react';
import { clsx } from 'clsx';
import type { RecordingState } from '@/types';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import { formatDuration, formatBytes } from '@/utils/formatters';
import { t } from '@/i18n';

interface RecordingControlsProps {
  recordingState: RecordingState;
  elapsedSecs: number;
  framesCaptured: number;
  fileSizeEstimate: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onScreenshot?: () => void;
  disabled?: boolean;
}

export function RecordingControls({
  recordingState,
  elapsedSecs,
  framesCaptured,
  fileSizeEstimate,
  onStart,
  onStop,
  onPause,
  onResume,
  onScreenshot,
  disabled = false,
}: RecordingControlsProps) {
  const isIdle = recordingState === 'idle';
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isStopping = recordingState === 'stopping';
  const isCountdown = recordingState === 'countdown';
  const isActive = isRecording || isPaused;

  return (
    <div className="space-y-4">
      {/* Status bar when recording */}
      {isActive && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <StatusIndicator state={recordingState} size="md" showLabel />
            <div className="flex items-center gap-6 text-sm">
              <div className="text-surface-600 dark:text-surface-400">
                <span className="text-surface-400 dark:text-surface-500 mr-1">
                  {t('recorder.elapsed')}:
                </span>
                <span className="font-mono font-semibold text-surface-900 dark:text-surface-100">
                  {formatDuration(elapsedSecs)}
                </span>
              </div>
              <div className="text-surface-600 dark:text-surface-400">
                <span className="text-surface-400 dark:text-surface-500 mr-1">
                  {t('recorder.frames')}:
                </span>
                <span className="font-mono">
                  {framesCaptured.toLocaleString()}
                </span>
              </div>
              <div className="text-surface-600 dark:text-surface-400">
                <span className="text-surface-400 dark:text-surface-500 mr-1">
                  {t('recorder.fileSize')}:
                </span>
                <span className="font-mono">
                  {formatBytes(fileSizeEstimate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-3">
        {isIdle && (
          <button
            onClick={onStart}
            disabled={disabled}
            className={clsx(
              'flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-200',
              'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-500/25',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Circle size={20} fill="currentColor" />
            <span>{t('recorder.startRecording')}</span>
          </button>
        )}

        {isCountdown && (
          <button
            disabled
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white bg-amber-600 opacity-75 cursor-not-allowed"
          >
            <Circle size={20} className="animate-pulse" fill="currentColor" />
            <span>{t('recorder.countingDown', { seconds: '' })}</span>
          </button>
        )}

        {isActive && (
          <>
            {isPaused ? (
              <button
                onClick={onResume}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
              >
                <Play size={18} />
                <span>{t('recorder.resumeRecording')}</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
              >
                <Pause size={18} />
                <span>{t('recorder.pauseRecording')}</span>
              </button>
            )}

            <button
              onClick={onStop}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
            >
              <Square size={18} fill="currentColor" />
              <span>{t('recorder.stopRecording')}</span>
            </button>

            {onScreenshot && (
              <button
                onClick={onScreenshot}
                className="btn-ghost p-3 rounded-xl"
                title={t('home.takeScreenshot')}
              >
                <Camera size={18} />
              </button>
            )}
          </>
        )}

        {isStopping && (
          <button
            disabled
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-surface-400 bg-surface-200 dark:bg-surface-800 cursor-not-allowed"
          >
            <Square size={18} />
            <span>{t('recorder.stopping')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
