import { create } from 'zustand';
import type { ScreenshotInfo } from '@/types';
import { api } from '@/services/ipc';

export type ScreenshotSortKey =
  | 'newest'
  | 'oldest'
  | 'largest'
  | 'smallest'
  | 'name';

interface ScreenshotsState {
  screenshots: ScreenshotInfo[];
  loading: boolean;
  error: string | null;
  search: string;
  sortBy: ScreenshotSortKey;

  loadScreenshots: () => Promise<void>;
  deleteScreenshot: (id: string) => Promise<void>;
  setSearch: (query: string) => void;
  setSortBy: (sort: ScreenshotSortKey) => void;
  getFiltered: () => ScreenshotInfo[];
}

function sortScreenshots(
  screenshots: ScreenshotInfo[],
  sortBy: ScreenshotSortKey
): ScreenshotInfo[] {
  const sorted = [...screenshots];
  switch (sortBy) {
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    case 'largest':
      return sorted.sort((a, b) => b.fileSize - a.fileSize);
    case 'smallest':
      return sorted.sort((a, b) => a.fileSize - b.fileSize);
    case 'name':
      return sorted.sort((a, b) =>
        a.filename.localeCompare(b.filename)
      );
    default:
      return sorted;
  }
}

export const useScreenshotsStore = create<ScreenshotsState>((set, get) => ({
  screenshots: [],
  loading: false,
  error: null,
  search: '',
  sortBy: 'newest',

  loadScreenshots: async () => {
    set({ loading: true, error: null });
    try {
      const screenshots = await api.listScreenshots();
      set({ screenshots, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, loading: false });
    }
  },

  deleteScreenshot: async (id) => {
    try {
      await api.deleteScreenshot(id);
      set((s) => ({
        screenshots: s.screenshots.filter((sc) => sc.id !== id),
      }));
    } catch (err) {
      console.error('Failed to delete screenshot:', err);
      throw err;
    }
  },

  setSearch: (query) => set({ search: query }),
  setSortBy: (sort) => set({ sortBy: sort }),

  getFiltered: () => {
    const { screenshots, search, sortBy } = get();
    let filtered = screenshots;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = screenshots.filter(
        (s) =>
          s.filename.toLowerCase().includes(q) ||
          s.format.toLowerCase().includes(q)
      );
    }
    return sortScreenshots(filtered, sortBy);
  },
}));
