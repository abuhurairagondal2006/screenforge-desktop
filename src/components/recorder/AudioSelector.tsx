import { useState, useEffect } from 'react';
import { Mic, Volume2, MicOff, Radio } from 'lucide-react';
import { clsx } from 'clsx';
import type { AudioMode, AudioDevice } from '@/types';
import { api } from '@/services/ipc';
import { t } from '@/i18n';

interface AudioSelectorProps {
  value: AudioMode;
  onChange: (mode: AudioMode) => void;
  disabled?: boolean;
}

const AUDIO_MODES: { id: AudioMode; label: string; icon: typeof Mic }[] = [
  { id: 'none', label: 'recorder.noAudio', icon: MicOff },
  { id: 'systemAudio', label: 'recorder.systemAudio', icon: Volume2 },
  { id: 'microphone', label: 'recorder.microphone', icon: Mic },
  { id: 'both', label: 'recorder.bothAudio', icon: Radio },
];

export function AudioSelector({
  value,
  onChange,
  disabled = false,
}: AudioSelectorProps) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);

  useEffect(() => {
    api.getAudioDevices().then(setDevices).catch(() => setDevices([]));
  }, []);

  const inputDevices = devices.filter((d) => d.deviceType === 'input');
  const outputDevices = devices.filter((d) => d.deviceType === 'output');

  const showMicSelector = value === 'microphone' || value === 'both';
  const showOutputSelector = value === 'systemAudio' || value === 'both';

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
        {t('recorder.audioMode')}
      </label>

      <div className="grid grid-cols-4 gap-2">
        {AUDIO_MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            disabled={disabled}
            className={clsx(
              'flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors',
              value === id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon size={16} />
            <span>{t(label)}</span>
          </button>
        ))}
      </div>

      {showOutputSelector && outputDevices.length > 0 && (
        <div>
          <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
            Output Device
          </label>
          <select className="input-field text-sm" disabled={disabled}>
            {outputDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.isDefault ? ' (Default)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {showMicSelector && inputDevices.length > 0 && (
        <div>
          <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
            Microphone
          </label>
          <select className="input-field text-sm" disabled={disabled}>
            {inputDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.isDefault ? ' (Default)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
