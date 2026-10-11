import { useEffect, useState, useCallback } from 'react';
import {
  Camera,
  Maximize,
  AppWindow,
  Crop,
  Search,
  ArrowDownAZ,
  Image,
  X,
} from 'lucide-react';
import { useScreenshotsStore } from '@/stores/screenshotsStore';
import type { ScreenshotSortKey } from '@/stores/screenshotsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';
import { ScreenshotCard } from '@/components/screenshots/ScreenshotCard';
import { api } from '@/services/ipc';
import type { ScreenshotInfo, CaptureSource } from '@/types';
import { t } from '@/i18n';
import { convertFileSrc } from '@tauri-apps/api/core';

const SORT_OPTIONS: { value: ScreenshotSortKey; label: string }[] = [
  { value: 'newest', label: 'screenshots.sortNewest' },
  { value: 'oldest', label: 'screenshots.sortOldest' },
  { value: 'largest', label: 'screenshots.sortLargest' },
  { value: 'smallest', label: 'screenshots.sortSmallest' },
  { value: 'name', label: 'screenshots.sortName' },
];

export function ScreenshotsPage() {
  const loadScreenshots = useScreenshotsStore((s) => s.loadScreenshots);
  const deleteScreenshot = useScreenshotsStore((s) => s.deleteScreenshot);
  const search = useScreenshotsStore((s) => s.search);
  const setSearch = useScreenshotsStore((s) => s.setSearch);
  const sortBy = useScreenshotsStore((s) => s.sortBy);
  const setSortBy = useScreenshotsStore((s) => s.setSortBy);
  const getFiltered = useScreenshotsStore((s) => s.getFiltered);
  const loading = useScreenshotsStore((s) => s.loading);

  const settings = useSettingsStore((s) => s.settings);
  const addToast = useToastStore((s) => s.addToast);

  const [viewingScreenshot, setViewingScreenshot] = useState<ScreenshotInfo | null>(null);

  useEffect(() => {
    loadScreenshots();
  }, [loadScreenshots]);

  const filtered = getFiltered();

  const takeScreenshot = useCallback(
    async (source: CaptureSource) => {
      try {
        const info = await api.takeScreenshot({
          source,
          format: settings.screenshot.defaultFormat,
          quality: settings.screenshot.jpegQuality,
          copyToClipboard: settings.screenshot.copyToClipboard,
        });
        addToast('success', `Screenshot saved: ${info.filename}`);
        loadScreenshots();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        addToast('error', `Screenshot failed: ${message}`);
      }
    },
    [settings.screenshot, addToast, loadScreenshots]
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteScreenshot(id);
      addToast('success', t('screenshots.deleted'));
    } catch {
      addToast('error', 'Failed to delete screenshot');
    }
  };

  const handleOpenFolder = (path: string) => {
    api.openFileLocation(path).catch(() => {
      addToast('error', 'Failed to open folder');
    });
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      addToast('info', t('common.copied'));
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera size={24} className="text-surface-600 dark:text-surface-400" />
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            {t('screenshots.title')}
          </h1>
        </div>
      </div>

      {/* Capture buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => takeScreenshot({ type: 'fullScreen' })}
          className="btn-primary flex items-center gap-2"
        >
          <Maximize size={16} />
          {t('screenshots.captureFullScreen')}
        </button>
        <button
          onClick={() => takeScreenshot({ type: 'window', title: '' })}
          className="btn-secondary flex items-center gap-2"
        >
          <AppWindow size={16} />
          {t('screenshots.captureWindow')}
        </button>
        <button
          onClick={() =>
            takeScreenshot({
              type: 'region',
              x: 0,
              y: 0,
              width: 800,
              height: 600,
            })
          }
          className="btn-secondary flex items-center gap-2"
        >
          <Crop size={16} />
          {t('screenshots.captureRegion')}
        </button>
      </div>

      {/* Search and sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            className="input-field pl-9 text-sm"
            placeholder={t('screenshots.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowDownAZ size={16} className="text-surface-400" />
          <select
            className="input-field text-sm w-36"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ScreenshotSortKey)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Screenshots grid */}
      {loading ? (
        <div className="text-center py-12 text-surface-400 dark:text-surface-500">
          {t('common.loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Image
            size={48}
            className="mx-auto text-surface-300 dark:text-surface-600 mb-3"
          />
          <p className="text-surface-500 dark:text-surface-400">
            {t('screenshots.noScreenshots')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((ss) => (
            <ScreenshotCard
              key={ss.id}
              screenshot={ss}
              onView={setViewingScreenshot}
              onDelete={handleDelete}
              onOpenFolder={handleOpenFolder}
              onCopyPath={handleCopyPath}
            />
          ))}
        </div>
      )}

      {/* Screenshot viewer modal */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white truncate mr-4">
                {viewingScreenshot.filename}
              </h3>
              <button
                onClick={() => setViewingScreenshot(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={convertFileSrc(viewingScreenshot.path)}
              alt={viewingScreenshot.filename}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
