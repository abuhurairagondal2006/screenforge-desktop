import { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Video,
  Camera,
  Volume2,
  Webcam,
  Keyboard,
  HardDrive,
  Wrench,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSettings } from '@/hooks/useSettings';
import type {
  QualityPreset,
  VideoCodec,
  ContainerFormat,
  ScreenshotFormat,
  AudioMode,
  WebcamOverlayShape,
} from '@/types';
import { formatHotkey } from '@/utils/formatters';
import { t } from '@/i18n';

type SettingsTab =
  | 'general'
  | 'recording'
  | 'screenshot'
  | 'audio'
  | 'webcam'
  | 'hotkeys'
  | 'storage'
  | 'advanced';

const TABS: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: 'general', label: 'settings.general', icon: Sun },
  { id: 'recording', label: 'settings.recording', icon: Video },
  { id: 'screenshot', label: 'settings.screenshot', icon: Camera },
  { id: 'audio', label: 'settings.audio', icon: Volume2 },
  { id: 'webcam', label: 'settings.webcam', icon: Webcam },
  { id: 'hotkeys', label: 'settings.hotkeys', icon: Keyboard },
  { id: 'storage', label: 'settings.storage', icon: HardDrive },
  { id: 'advanced', label: 'settings.advanced', icon: Wrench },
];

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    saveSettings,
    resetDefaults,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const renderGeneral = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          {t('settings.theme')}
        </label>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() =>
                updateSettings({ general: { ...settings.general, theme } })
              }
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                settings.general.theme === theme
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                  : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300'
              )}
            >
              {theme === 'light' && <Sun size={14} />}
              {theme === 'dark' && <Moon size={14} />}
              {theme === 'system' && <Monitor size={14} />}
              {t(`settings.theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {t('settings.language')}
        </label>
        <select
          className="input-field text-sm w-48"
          value={settings.general.language}
          onChange={(e) =>
            updateSettings({
              general: { ...settings.general, language: e.target.value },
            })
          }
        >
          <option value="en">English</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.general.launchOnStartup}
            onChange={(e) =>
              updateSettings({
                general: { ...settings.general, launchOnStartup: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.launchOnStartup')}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.general.startMinimized}
            onChange={(e) =>
              updateSettings({
                general: { ...settings.general, startMinimized: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.startMinimized')}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.general.showTrayIcon}
            onChange={(e) =>
              updateSettings({
                general: { ...settings.general, showTrayIcon: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.showTrayIcon')}
          </span>
        </label>
      </div>
    </div>
  );

  const renderRecording = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.defaultFps')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.recording.defaultFps}
            onChange={(e) =>
              updateSettings({
                recording: {
                  ...settings.recording,
                  defaultFps: Number(e.target.value),
                },
              })
            }
          >
            {[15, 24, 30, 60].map((fps) => (
              <option key={fps} value={fps}>
                {fps} fps
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.defaultResolution')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.recording.defaultResolution}
            onChange={(e) =>
              updateSettings({
                recording: {
                  ...settings.recording,
                  defaultResolution: e.target.value,
                },
              })
            }
          >
            <option value="1920x1080">1920x1080 (1080p)</option>
            <option value="2560x1440">2560x1440 (1440p)</option>
            <option value="3840x2160">3840x2160 (4K)</option>
            <option value="1280x720">1280x720 (720p)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.defaultQuality')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.recording.defaultQuality}
            onChange={(e) =>
              updateSettings({
                recording: {
                  ...settings.recording,
                  defaultQuality: e.target.value as QualityPreset,
                },
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.defaultCodec')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.recording.defaultCodec}
            onChange={(e) =>
              updateSettings({
                recording: {
                  ...settings.recording,
                  defaultCodec: e.target.value as VideoCodec,
                },
              })
            }
          >
            <option value="h264">H.264</option>
            <option value="h265">H.265</option>
            <option value="av1">AV1</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.defaultFormat')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.recording.defaultFormat}
            onChange={(e) =>
              updateSettings({
                recording: {
                  ...settings.recording,
                  defaultFormat: e.target.value as ContainerFormat,
                },
              })
            }
          >
            <option value="mp4">MP4</option>
            <option value="mkv">MKV</option>
            <option value="webm">WebM</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.countdownSeconds')}
          </label>
          <input
            type="number"
            className="input-field text-sm"
            min={0}
            max={10}
            value={settings.recording.countdownSeconds}
            onChange={(e) =>
              updateSettings({
                recording: {
                  ...settings.recording,
                  countdownSeconds: Number(e.target.value),
                },
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.recording.showCursor}
            onChange={(e) =>
              updateSettings({
                recording: { ...settings.recording, showCursor: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.showCursor')}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.recording.highlightCursor}
            onChange={(e) =>
              updateSettings({
                recording: {
                  ...settings.recording,
                  highlightCursor: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.highlightCursor')}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.recording.clickEffects}
            onChange={(e) =>
              updateSettings({
                recording: {
                  ...settings.recording,
                  clickEffects: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.clickEffects')}
          </span>
        </label>
      </div>
    </div>
  );

  const renderScreenshot = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.screenshotFormat')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.screenshot.defaultFormat}
            onChange={(e) =>
              updateSettings({
                screenshot: {
                  ...settings.screenshot,
                  defaultFormat: e.target.value as ScreenshotFormat,
                },
              })
            }
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.jpegQuality')} ({settings.screenshot.jpegQuality}%)
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={settings.screenshot.jpegQuality}
            onChange={(e) =>
              updateSettings({
                screenshot: {
                  ...settings.screenshot,
                  jpegQuality: Number(e.target.value),
                },
              })
            }
            className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full appearance-none accent-primary-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.screenshot.autoSave}
            onChange={(e) =>
              updateSettings({
                screenshot: {
                  ...settings.screenshot,
                  autoSave: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.autoSave')}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.screenshot.copyToClipboard}
            onChange={(e) =>
              updateSettings({
                screenshot: {
                  ...settings.screenshot,
                  copyToClipboard: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.copyToClipboard')}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.screenshot.showNotification}
            onChange={(e) =>
              updateSettings({
                screenshot: {
                  ...settings.screenshot,
                  showNotification: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            {t('settings.showNotification')}
          </span>
        </label>
      </div>
    </div>
  );

  const renderAudio = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.audioMode')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.audio.defaultMode}
            onChange={(e) =>
              updateSettings({
                audio: {
                  ...settings.audio,
                  defaultMode: e.target.value as AudioMode,
                },
              })
            }
          >
            <option value="none">No Audio</option>
            <option value="systemAudio">System Audio</option>
            <option value="microphone">Microphone</option>
            <option value="both">System + Microphone</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.sampleRate')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.audio.defaultSampleRate}
            onChange={(e) =>
              updateSettings({
                audio: {
                  ...settings.audio,
                  defaultSampleRate: Number(e.target.value),
                },
              })
            }
          >
            <option value={44100}>44,100 Hz</option>
            <option value={48000}>48,000 Hz</option>
            <option value={96000}>96,000 Hz</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.audioBitrate')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.audio.defaultBitrate}
            onChange={(e) =>
              updateSettings({
                audio: {
                  ...settings.audio,
                  defaultBitrate: Number(e.target.value),
                },
              })
            }
          >
            <option value={96}>96 kbps</option>
            <option value={128}>128 kbps</option>
            <option value={192}>192 kbps</option>
            <option value={256}>256 kbps</option>
            <option value={320}>320 kbps</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.channels')}
          </label>
          <select
            className="input-field text-sm"
            value={settings.audio.defaultChannels}
            onChange={(e) =>
              updateSettings({
                audio: {
                  ...settings.audio,
                  defaultChannels: Number(e.target.value),
                },
              })
            }
          >
            <option value={1}>Mono</option>
            <option value={2}>Stereo</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderWebcam = () => (
    <div className="space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.webcam.enabled}
          onChange={(e) =>
            updateSettings({
              webcam: { ...settings.webcam, enabled: e.target.checked },
            })
          }
          className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
          {t('settings.webcamEnabled')}
        </span>
      </label>

      {settings.webcam.enabled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              {t('settings.webcamPosition')}
            </label>
            <select
              className="input-field text-sm"
              value={settings.webcam.defaultPosition}
              onChange={(e) =>
                updateSettings({
                  webcam: {
                    ...settings.webcam,
                    defaultPosition: e.target.value,
                  },
                })
              }
            >
              <option value="topLeft">Top Left</option>
              <option value="topRight">Top Right</option>
              <option value="bottomLeft">Bottom Left</option>
              <option value="bottomRight">Bottom Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              {t('settings.webcamShape')}
            </label>
            <select
              className="input-field text-sm"
              value={settings.webcam.defaultShape}
              onChange={(e) =>
                updateSettings({
                  webcam: {
                    ...settings.webcam,
                    defaultShape: e.target.value as WebcamOverlayShape,
                  },
                })
              }
            >
              <option value="circle">Circle</option>
              <option value="roundedRect">Rounded Rectangle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              {t('settings.webcamOpacity')} ({settings.webcam.defaultOpacity}%)
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={settings.webcam.defaultOpacity}
              onChange={(e) =>
                updateSettings({
                  webcam: {
                    ...settings.webcam,
                    defaultOpacity: Number(e.target.value),
                  },
                })
              }
              className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full appearance-none accent-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              {t('settings.webcamSize')} ({settings.webcam.defaultSizePercent}%)
            </label>
            <input
              type="range"
              min={5}
              max={50}
              value={settings.webcam.defaultSizePercent}
              onChange={(e) =>
                updateSettings({
                  webcam: {
                    ...settings.webcam,
                    defaultSizePercent: Number(e.target.value),
                  },
                })
              }
              className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full appearance-none accent-primary-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderHotkeys = () => {
    const hotkeyLabels: Record<string, string> = {
      startStopRecording: t('settings.hotkeyStartStop'),
      pauseResume: t('settings.hotkeyPauseResume'),
      screenshot: t('settings.hotkeyScreenshot'),
      openApp: t('settings.hotkeyOpenApp'),
    };

    return (
      <div className="space-y-3">
        {settings.hotkeys.map((hk) => (
          <div
            key={hk.action}
            className="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-700"
          >
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {hotkeyLabels[hk.action] ?? hk.action}
            </span>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded text-xs font-mono text-surface-700 dark:text-surface-300">
                {formatHotkey(hk.modifiers, hk.key)}
              </kbd>
            </div>
          </div>
        ))}
        <p className="text-xs text-surface-400 dark:text-surface-500">
          Hotkey editing will be available in a future update.
        </p>
      </div>
    );
  };

  const renderStorage = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {t('settings.recordingsDir')}
        </label>
        <input
          type="text"
          className="input-field text-sm"
          value={settings.storage.recordingsDir}
          onChange={(e) =>
            updateSettings({
              storage: {
                ...settings.storage,
                recordingsDir: e.target.value,
              },
            })
          }
          placeholder="Default system directory"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {t('settings.screenshotsDir')}
        </label>
        <input
          type="text"
          className="input-field text-sm"
          value={settings.storage.screenshotsDir}
          onChange={(e) =>
            updateSettings({
              storage: {
                ...settings.storage,
                screenshotsDir: e.target.value,
              },
            })
          }
          placeholder="Default system directory"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {t('settings.tempDir')}
        </label>
        <input
          type="text"
          className="input-field text-sm"
          value={settings.storage.tempDir}
          onChange={(e) =>
            updateSettings({
              storage: {
                ...settings.storage,
                tempDir: e.target.value,
              },
            })
          }
          placeholder="Default system temp directory"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.filenamePrefix')}
          </label>
          <input
            type="text"
            className="input-field text-sm"
            value={settings.storage.filenamePrefix}
            onChange={(e) =>
              updateSettings({
                storage: {
                  ...settings.storage,
                  filenamePrefix: e.target.value,
                },
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            {t('settings.maxFileSize')}
          </label>
          <input
            type="number"
            className="input-field text-sm"
            min={1}
            max={100}
            value={settings.storage.maxFileSizeGb}
            onChange={(e) =>
              updateSettings({
                storage: {
                  ...settings.storage,
                  maxFileSizeGb: Number(e.target.value),
                },
              })
            }
          />
        </div>
      </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.advanced.hardwareEncoding}
            onChange={(e) =>
              updateSettings({
                advanced: {
                  ...settings.advanced,
                  hardwareEncoding: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {t('settings.hardwareEncoding')}
            </span>
            <p className="text-xs text-surface-400 dark:text-surface-500">
              Use GPU for video encoding when available (NVENC, QuickSync, AMF)
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.advanced.debugLogging}
            onChange={(e) =>
              updateSettings({
                advanced: {
                  ...settings.advanced,
                  debugLogging: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {t('settings.debugLogging')}
            </span>
            <p className="text-xs text-surface-400 dark:text-surface-500">
              Enable verbose logging for troubleshooting
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.advanced.autoRecovery}
            onChange={(e) =>
              updateSettings({
                advanced: {
                  ...settings.advanced,
                  autoRecovery: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {t('settings.autoRecovery')}
            </span>
            <p className="text-xs text-surface-400 dark:text-surface-500">
              Attempt to recover recordings after a crash
            </p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneral();
      case 'recording':
        return renderRecording();
      case 'screenshot':
        return renderScreenshot();
      case 'audio':
        return renderAudio();
      case 'webcam':
        return renderWebcam();
      case 'hotkeys':
        return renderHotkeys();
      case 'storage':
        return renderStorage();
      case 'advanced':
        return renderAdvanced();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-surface-600 dark:text-surface-400" />
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
          {t('settings.title')}
        </h1>
      </div>

      <div className="flex gap-6">
        {/* Tab list */}
        <div className="w-44 flex-shrink-0 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                activeTab === id
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              )}
            >
              <Icon size={16} />
              {t(label)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card p-6">{renderContent()}</div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-4">
            <button onClick={resetDefaults} className="btn-ghost text-sm">
              {t('settings.resetDefaults')}
            </button>
            <button onClick={saveSettings} className="btn-primary text-sm">
              {t('settings.saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
