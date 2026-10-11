import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Circle,
  Camera,
  Film,
  Image,
  HardDrive,
  Cpu,
  Gauge,
} from 'lucide-react';
import type { PlatformInfo, StorageStats } from '@/types';
import { api } from '@/services/ipc';
import { useRecordingsStore } from '@/stores/recordingsStore';
import { useScreenshotsStore } from '@/stores/screenshotsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatBytes, formatDuration, formatDate } from '@/utils/formatters';
import { t } from '@/i18n';

export function HomePage() {
  const navigate = useNavigate();
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);

  const recordings = useRecordingsStore((s) => s.recordings);
  const loadRecordings = useRecordingsStore((s) => s.loadRecordings);
  const screenshots = useScreenshotsStore((s) => s.screenshots);
  const loadScreenshots = useScreenshotsStore((s) => s.loadScreenshots);
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    loadRecordings();
    loadScreenshots();
    api.getPlatformInfo().then(setPlatformInfo).catch(() => {});
    api.getStorageStats().then(setStorageStats).catch(() => {});
  }, [loadRecordings, loadScreenshots]);

  const recentRecordings = [...recordings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentScreenshots = [...screenshots]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalUsed = storageStats
    ? storageStats.recordingsSize + storageStats.screenshotsSize
    : 0;

  const usagePercent = storageStats && storageStats.totalBytes > 0
    ? Math.round((totalUsed / storageStats.totalBytes) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/recorder')}
          className="card p-6 flex items-center gap-4 hover:border-red-300 dark:hover:border-red-700 transition-colors group text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
            <Circle size={24} className="text-red-600 dark:text-red-400" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              {t('home.quickRecord')}
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {t('home.startRecording')}
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/screenshots')}
          className="card p-6 flex items-center gap-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
            <Camera size={24} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              {t('home.quickScreenshot')}
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {t('home.takeScreenshot')}
            </p>
          </div>
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Recordings */}
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <Film size={16} />
              {t('home.recentRecordings')}
            </h3>
            <button
              onClick={() => navigate('/recordings')}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all
            </button>
          </div>

          {recentRecordings.length === 0 ? (
            <p className="text-sm text-surface-400 dark:text-surface-500 py-6 text-center">
              {t('home.noRecentRecordings')}
            </p>
          ) : (
            <div className="space-y-2">
              {recentRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/recordings')}
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                    <Film size={16} className="text-surface-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-900 dark:text-surface-100 truncate">
                      {rec.filename}
                    </p>
                    <p className="text-xs text-surface-400 dark:text-surface-500">
                      {formatDate(rec.date)}
                    </p>
                  </div>
                  <div className="text-xs text-surface-400 dark:text-surface-500 flex-shrink-0">
                    {formatDuration(rec.durationSecs)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferences & Storage */}
        <div className="space-y-4">
          {/* Recording Preferences */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-3">
              <Gauge size={16} />
              {t('home.preferences')}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500 dark:text-surface-400">
                  {t('home.quality')}
                </span>
                <span className="font-medium text-surface-700 dark:text-surface-300 capitalize">
                  {settings.recording.defaultQuality}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500 dark:text-surface-400">
                  {t('home.fps')}
                </span>
                <span className="font-medium text-surface-700 dark:text-surface-300">
                  {settings.recording.defaultFps}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500 dark:text-surface-400">
                  {t('home.codec')}
                </span>
                <span className="font-medium text-surface-700 dark:text-surface-300 uppercase">
                  {settings.recording.defaultCodec}
                </span>
              </div>
            </div>
          </div>

          {/* Storage */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-3">
              <HardDrive size={16} />
              {t('home.storageInfo')}
            </h3>
            {storageStats ? (
              <div className="space-y-2">
                <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500 dark:text-surface-400">
                    {t('home.used')}: {formatBytes(totalUsed)}
                  </span>
                  <span className="text-surface-500 dark:text-surface-400">
                    {t('home.free')}: {formatBytes(storageStats.freeBytes)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-400 dark:text-surface-500">
                    {storageStats.recordingsCount} recordings
                  </span>
                  <span className="text-surface-400 dark:text-surface-500">
                    {storageStats.screenshotsCount} screenshots
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-surface-400 dark:text-surface-500">
                {t('common.loading')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Screenshots */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <Image size={16} />
              {t('home.recentScreenshots')}
            </h3>
            <button
              onClick={() => navigate('/screenshots')}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all
            </button>
          </div>

          {recentScreenshots.length === 0 ? (
            <p className="text-sm text-surface-400 dark:text-surface-500 py-6 text-center">
              {t('home.noRecentScreenshots')}
            </p>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {recentScreenshots.map((ss) => (
                <div
                  key={ss.id}
                  className="aspect-video rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  onClick={() => navigate('/screenshots')}
                  title={ss.filename}
                >
                  <Image size={16} className="text-surface-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-3">
            <Cpu size={16} />
            {t('home.systemInfo')}
          </h3>
          {platformInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500 dark:text-surface-400">
                  {t('home.platform')}
                </span>
                <span className="font-medium text-surface-700 dark:text-surface-300">
                  {platformInfo.os} ({platformInfo.arch})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500 dark:text-surface-400">
                  {t('home.gpu')}
                </span>
                <span className="font-medium text-surface-700 dark:text-surface-300 truncate ml-4 text-right">
                  {platformInfo.hasGpu ? platformInfo.gpuName : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500 dark:text-surface-400">
                  {t('home.hwEncoding')}
                </span>
                <span className="font-medium text-surface-700 dark:text-surface-300">
                  {platformInfo.supportsHwEncoding ? (
                    <span className="badge badge-success">{t('common.available')}</span>
                  ) : (
                    <span className="badge badge-warning">{t('common.unavailable')}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500 dark:text-surface-400">
                  {t('home.captureApi')}
                </span>
                <span className="font-medium text-surface-700 dark:text-surface-300">
                  {platformInfo.captureApi}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-surface-400 dark:text-surface-500">
              {t('common.loading')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
