import { useEffect, useState } from 'react';
import {
  Film,
  Search,
  ArrowDownAZ,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useRecordingsStore } from '@/stores/recordingsStore';
import type { RecordingSortKey } from '@/stores/recordingsStore';
import { useToastStore } from '@/stores/toastStore';
import { RecordingCard } from '@/components/recordings/RecordingCard';
import { VideoPlayer } from '@/components/recordings/VideoPlayer';
import { api } from '@/services/ipc';
import type { RecordingInfo } from '@/types';
import { t } from '@/i18n';
import { clsx } from 'clsx';

const SORT_OPTIONS: { value: RecordingSortKey; label: string }[] = [
  { value: 'newest', label: 'recordings.sortNewest' },
  { value: 'oldest', label: 'recordings.sortOldest' },
  { value: 'largest', label: 'recordings.sortLargest' },
  { value: 'smallest', label: 'recordings.sortSmallest' },
  { value: 'longest', label: 'recordings.sortLongest' },
  { value: 'shortest', label: 'recordings.sortShortest' },
  { value: 'name', label: 'recordings.sortName' },
];

export function RecordingsPage() {
  const loadRecordings = useRecordingsStore((s) => s.loadRecordings);
  const deleteRecording = useRecordingsStore((s) => s.deleteRecording);
  const renameRecording = useRecordingsStore((s) => s.renameRecording);
  const search = useRecordingsStore((s) => s.search);
  const setSearch = useRecordingsStore((s) => s.setSearch);
  const sortBy = useRecordingsStore((s) => s.sortBy);
  const setSortBy = useRecordingsStore((s) => s.setSortBy);
  const getFiltered = useRecordingsStore((s) => s.getFiltered);
  const loading = useRecordingsStore((s) => s.loading);

  const addToast = useToastStore((s) => s.addToast);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingRecording, setPlayingRecording] = useState<RecordingInfo | null>(null);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const filtered = getFiltered();

  const handleDelete = async (id: string) => {
    try {
      await deleteRecording(id);
      addToast('success', t('recordings.deleted'));
    } catch {
      addToast('error', 'Failed to delete recording');
    }
  };

  const handleRename = async (path: string, newName: string) => {
    try {
      await renameRecording(path, newName);
      addToast('success', t('recordings.renamed'));
    } catch {
      addToast('error', 'Failed to rename recording');
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
      <div className="flex items-center gap-3">
        <Film size={24} className="text-surface-600 dark:text-surface-400" />
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
          {t('recordings.title')}
        </h1>
      </div>

      {/* Search and controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            className="input-field pl-9 text-sm"
            placeholder={t('recordings.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowDownAZ size={16} className="text-surface-400" />
          <select
            className="input-field text-sm w-36"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as RecordingSortKey)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
            title={t('recordings.gridView')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
            title={t('recordings.listView')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Recordings */}
      {loading ? (
        <div className="text-center py-12 text-surface-400 dark:text-surface-500">
          {t('common.loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Film
            size={48}
            className="mx-auto text-surface-300 dark:text-surface-600 mb-3"
          />
          <p className="text-surface-500 dark:text-surface-400">
            {t('recordings.noRecordings')}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((rec) => (
            <RecordingCard
              key={rec.id}
              recording={rec}
              onPlay={setPlayingRecording}
              onDelete={handleDelete}
              onOpenFolder={handleOpenFolder}
              onRename={handleRename}
              onCopyPath={handleCopyPath}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((rec) => (
            <RecordingCard
              key={rec.id}
              recording={rec}
              onPlay={setPlayingRecording}
              onDelete={handleDelete}
              onOpenFolder={handleOpenFolder}
              onRename={handleRename}
              onCopyPath={handleCopyPath}
              viewMode="list"
            />
          ))}
        </div>
      )}

      {/* Video player modal */}
      {playingRecording && (
        <VideoPlayer
          recording={playingRecording}
          onClose={() => setPlayingRecording(null)}
        />
      )}
    </div>
  );
}
