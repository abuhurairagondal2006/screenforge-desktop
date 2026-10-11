import { useState } from 'react';
import {
  Play,
  Trash2,
  FolderOpen,
  Pencil,
  Copy,
  Film,
  MoreVertical,
} from 'lucide-react';
import type { RecordingInfo } from '@/types';
import { formatDuration, formatBytes, formatDate, truncateFilename } from '@/utils/formatters';
import { t } from '@/i18n';

interface RecordingCardProps {
  recording: RecordingInfo;
  onPlay: (recording: RecordingInfo) => void;
  onDelete: (id: string) => void;
  onOpenFolder: (path: string) => void;
  onRename: (path: string, newName: string) => void;
  onCopyPath: (path: string) => void;
  viewMode?: 'grid' | 'list';
}

export function RecordingCard({
  recording,
  onPlay,
  onDelete,
  onOpenFolder,
  onRename,
  onCopyPath,
  viewMode = 'grid',
}: RecordingCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(recording.filename);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRename = () => {
    if (newName.trim() && newName !== recording.filename) {
      onRename(recording.path, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(recording.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="card p-3 flex items-center gap-4 group">
        <button
          onClick={() => onPlay(recording)}
          className="w-20 h-14 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors flex-shrink-0"
        >
          <Play size={20} className="text-surface-500" />
        </button>

        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              className="input-field text-sm py-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              autoFocus
            />
          ) : (
            <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
              {recording.filename}
            </p>
          )}
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            {formatDate(recording.date)}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400 flex-shrink-0">
          <span>{formatDuration(recording.durationSecs)}</span>
          <span>{recording.resolution}</span>
          <span>{recording.fps} fps</span>
          <span>{formatBytes(recording.fileSize)}</span>
          <span className="uppercase">{recording.format}</span>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 card py-1 z-10 shadow-lg">
              <button
                onClick={() => { onPlay(recording); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <Play size={14} />
                {t('recordings.play')}
              </button>
              <button
                onClick={() => { setIsRenaming(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <Pencil size={14} />
                {t('recordings.rename')}
              </button>
              <button
                onClick={() => { onOpenFolder(recording.path); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <FolderOpen size={14} />
                {t('recordings.openFolder')}
              </button>
              <button
                onClick={() => { onCopyPath(recording.path); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <Copy size={14} />
                {t('recordings.copyPath')}
              </button>
              <hr className="my-1 border-surface-200 dark:border-surface-700" />
              <button
                onClick={() => { handleDelete(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 size={14} />
                {t('recordings.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden group">
      <button
        onClick={() => onPlay(recording)}
        className="w-full aspect-video bg-surface-100 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors relative"
      >
        <Film size={32} className="text-surface-400" />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(recording.durationSecs)}
        </div>
      </button>

      <div className="p-3">
        {isRenaming ? (
          <input
            type="text"
            className="input-field text-sm py-1 mb-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            autoFocus
          />
        ) : (
          <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
            {truncateFilename(recording.filename)}
          </p>
        )}
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
          {formatDate(recording.date)}
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-surface-400 dark:text-surface-500">
          <span>{recording.resolution}</span>
          <span>-</span>
          <span>{recording.fps} fps</span>
          <span>-</span>
          <span>{formatBytes(recording.fileSize)}</span>
        </div>

        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPlay(recording)}
            className="btn-ghost p-1.5 rounded"
            title={t('recordings.play')}
          >
            <Play size={14} />
          </button>
          <button
            onClick={() => setIsRenaming(true)}
            className="btn-ghost p-1.5 rounded"
            title={t('recordings.rename')}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onOpenFolder(recording.path)}
            className="btn-ghost p-1.5 rounded"
            title={t('recordings.openFolder')}
          >
            <FolderOpen size={14} />
          </button>
          <button
            onClick={() => onCopyPath(recording.path)}
            className="btn-ghost p-1.5 rounded"
            title={t('recordings.copyPath')}
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="btn-ghost p-1.5 rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            title={confirmDelete ? t('recordings.confirmDelete') : t('recordings.delete')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
