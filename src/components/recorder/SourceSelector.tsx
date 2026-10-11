import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Monitor, AppWindow, Maximize, Crop } from 'lucide-react';
import type { CaptureSource, MonitorInfo } from '@/types';
import { api } from '@/services/ipc';
import { t } from '@/i18n';

interface SourceSelectorProps {
  value: CaptureSource;
  onChange: (source: CaptureSource) => void;
  disabled?: boolean;
}

type SourceTab = 'fullScreen' | 'monitor' | 'window' | 'region';

function getTab(source: CaptureSource): SourceTab {
  return source.type;
}

export function SourceSelector({
  value,
  onChange,
  disabled = false,
}: SourceSelectorProps) {
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);
  const [windowTitle, setWindowTitle] = useState(
    value.type === 'window' ? value.title : ''
  );
  const [regionX, setRegionX] = useState(
    value.type === 'region' ? value.x : 0
  );
  const [regionY, setRegionY] = useState(
    value.type === 'region' ? value.y : 0
  );
  const [regionW, setRegionW] = useState(
    value.type === 'region' ? value.width : 800
  );
  const [regionH, setRegionH] = useState(
    value.type === 'region' ? value.height : 600
  );

  const activeTab = getTab(value);

  useEffect(() => {
    api.getMonitors().then(setMonitors).catch(() => setMonitors([]));
  }, []);

  const tabs: { id: SourceTab; label: string; icon: typeof Monitor }[] = [
    { id: 'fullScreen', label: t('recorder.fullScreen'), icon: Maximize },
    { id: 'monitor', label: t('recorder.monitor'), icon: Monitor },
    { id: 'window', label: t('recorder.window'), icon: AppWindow },
    { id: 'region', label: t('recorder.region'), icon: Crop },
  ];

  const handleTabChange = (tab: SourceTab) => {
    if (disabled) return;
    switch (tab) {
      case 'fullScreen':
        onChange({ type: 'fullScreen' });
        break;
      case 'monitor': {
        const primary = monitors.find((m) => m.isPrimary);
        onChange({ type: 'monitor', id: primary?.id ?? 0 });
        break;
      }
      case 'window':
        onChange({ type: 'window', title: windowTitle });
        break;
      case 'region':
        onChange({
          type: 'region',
          x: regionX,
          y: regionY,
          width: regionW,
          height: regionH,
        });
        break;
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
        {t('recorder.sourceSelection')}
      </label>

      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            disabled={disabled}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors',
              activeTab === id
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'monitor' && (
        <div>
          <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
            {t('recorder.selectMonitor')}
          </label>
          <select
            className="input-field text-sm"
            value={value.type === 'monitor' ? value.id : 0}
            onChange={(e) =>
              onChange({ type: 'monitor', id: Number(e.target.value) })
            }
            disabled={disabled}
          >
            {monitors.length === 0 && (
              <option value={0}>No monitors detected</option>
            )}
            {monitors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.width}x{m.height}){m.isPrimary ? ' - Primary' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeTab === 'window' && (
        <div>
          <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
            {t('recorder.selectWindow')}
          </label>
          <input
            type="text"
            className="input-field text-sm"
            placeholder="Window title..."
            value={windowTitle}
            onChange={(e) => {
              setWindowTitle(e.target.value);
              onChange({ type: 'window', title: e.target.value });
            }}
            disabled={disabled}
          />
        </div>
      )}

      {activeTab === 'region' && (
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
              X
            </label>
            <input
              type="number"
              className="input-field text-sm"
              value={regionX}
              onChange={(e) => {
                const x = Number(e.target.value);
                setRegionX(x);
                onChange({
                  type: 'region',
                  x,
                  y: regionY,
                  width: regionW,
                  height: regionH,
                });
              }}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
              Y
            </label>
            <input
              type="number"
              className="input-field text-sm"
              value={regionY}
              onChange={(e) => {
                const y = Number(e.target.value);
                setRegionY(y);
                onChange({
                  type: 'region',
                  x: regionX,
                  y,
                  width: regionW,
                  height: regionH,
                });
              }}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
              Width
            </label>
            <input
              type="number"
              className="input-field text-sm"
              value={regionW}
              onChange={(e) => {
                const w = Number(e.target.value);
                setRegionW(w);
                onChange({
                  type: 'region',
                  x: regionX,
                  y: regionY,
                  width: w,
                  height: regionH,
                });
              }}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
              Height
            </label>
            <input
              type="number"
              className="input-field text-sm"
              value={regionH}
              onChange={(e) => {
                const h = Number(e.target.value);
                setRegionH(h);
                onChange({
                  type: 'region',
                  x: regionX,
                  y: regionY,
                  width: regionW,
                  height: h,
                });
              }}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
