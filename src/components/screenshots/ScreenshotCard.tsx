import { useState } from 'react';
import {
  Eye,
  Trash2,
  FolderOpen,
  Copy,
  Image,
} from 'lucide-react';
import type { ScreenshotInfo } from '@/types';
import {
  formatBytes,
  formatDate,
  formatResolution,
  truncateFilename,
} from '@/utils/formatters';
import { t } from '@/i18n';

interface ScreenshotCardProps {
  screenshot: ScreenshotInfo;
  onView: (screenshot: ScreenshotInfo) => void;
  onDelete: (id: string) => void;
  onOpenFolder: (path: string) => void;
  onCopyPath: (path: string) => void;
}

export function ScreenshotCard({
  screenshot,
  onView,
  onDelete,
  onOpenFolder,
  onCopyPath,
}: ScreenshotCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(screenshot.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="card overflow-hidden group">
      <button
        onClick={() => onView(screenshot)}
        className="w-full aspect-video bg-surface-100 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
      >
        <Image size={32} className="text-surface-400" />
      </button>

      <div className="p-3">
        <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
          {truncateFilename(screenshot.filename)}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
          {formatDate(screenshot.date)}
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-surface-400 dark:text-surface-500">
          <span>{formatResolution(screenshot.width, screenshot.height)}</span>
          <span>-</span>
          <span>{formatBytes(screenshot.fileSize)}</span>
          <span>-</span>
          <span className="uppercase">{screenshot.format}</span>
        </div>

        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(screenshot)}
            className="btn-ghost p-1.5 rounded"
            title={t('screenshots.view')}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onOpenFolder(screenshot.path)}
            className="btn-ghost p-1.5 rounded"
            title={t('screenshots.openFolder')}
          >
            <FolderOpen size={14} />
          </button>
          <button
            onClick={() => onCopyPath(screenshot.path)}
            className="btn-ghost p-1.5 rounded"
            title={t('screenshots.copyPath')}
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="btn-ghost p-1.5 rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            title={
              confirmDelete
                ? t('screenshots.confirmDelete')
                : t('screenshots.delete')
            }
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
