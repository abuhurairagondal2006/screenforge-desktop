/**
 * Format bytes into a human-readable string (e.g., "1.5 GB").
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format a duration in seconds to HH:MM:SS or MM:SS.
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format an ISO date string or timestamp to a localized date/time string.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a short date (no time).
 */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format resolution string like "1920x1080".
 */
export function formatResolution(width: number, height: number): string {
  return `${width}x${height}`;
}

/**
 * Format FPS value.
 */
export function formatFps(fps: number): string {
  return `${fps} fps`;
}

/**
 * Truncate a filename if too long, keeping the extension.
 */
export function truncateFilename(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) return name;
  const ext = name.lastIndexOf('.');
  if (ext === -1) return name.slice(0, maxLength - 3) + '...';
  const extension = name.slice(ext);
  const base = name.slice(0, ext);
  const maxBase = maxLength - extension.length - 3;
  if (maxBase <= 0) return name.slice(0, maxLength - 3) + '...';
  return base.slice(0, maxBase) + '...' + extension;
}

/**
 * Format a hotkey binding for display.
 */
export function formatHotkey(modifiers: string[], key: string): string {
  const parts = [...modifiers, key];
  return parts
    .map((p) => {
      switch (p.toLowerCase()) {
        case 'ctrl':
        case 'control':
          return 'Ctrl';
        case 'alt':
          return 'Alt';
        case 'shift':
          return 'Shift';
        case 'meta':
        case 'super':
          return 'Super';
        default:
          return p.length === 1 ? p.toUpperCase() : p;
      }
    })
    .join(' + ');
}
