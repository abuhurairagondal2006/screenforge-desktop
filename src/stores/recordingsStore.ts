import { create } from 'zustand';
import type { RecordingInfo } from '@/types';
import { api } from '@/services/ipc';

export type RecordingSortKey =
  | 'newest'
  | 'oldest'
  | 'largest'
  | 'smallest'
  | 'longest'
  | 'shortest'
  | 'name';

interface RecordingsState {
  recordings: RecordingInfo[];
  loading: boolean;
  error: string | null;
  search: string;
  sortBy: RecordingSortKey;

  loadRecordings: () => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  renameRecording: (path: string, newName: string) => Promise<void>;
  setSearch: (query: string) => void;
  setSortBy: (sort: RecordingSortKey) => void;
  getFiltered: () => RecordingInfo[];
}

function sortRecordings(
  recordings: RecordingInfo[],
  sortBy: RecordingSortKey
): RecordingInfo[] {
  const sorted = [...recordings];
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
    case 'longest':
      return sorted.sort((a, b) => b.durationSecs - a.durationSecs);
    case 'shortest':
      return sorted.sort((a, b) => a.durationSecs - b.durationSecs);
    case 'name':
      return sorted.sort((a, b) =>
        a.filename.localeCompare(b.filename)
      );
    default:
      return sorted;
  }
}

export const useRecordingsStore = create<RecordingsState>((set, get) => ({
  recordings: [],
  loading: false,
  error: null,
  search: '',
  sortBy: 'newest',

  loadRecordings: async () => {
    set({ loading: true, error: null });
    try {
      const recordings = await api.listRecordings();
      set({ recordings, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, loading: false });
    }
  },

  deleteRecording: async (id) => {
    try {
      await api.deleteRecording(id);
      set((s) => ({
        recordings: s.recordings.filter((r) => r.id !== id),
      }));
    } catch (err) {
      console.error('Failed to delete recording:', err);
      throw err;
    }
  },

  renameRecording: async (path, newName) => {
    try {
      const newPath = await api.renameFile(path, newName);
      set((s) => ({
        recordings: s.recordings.map((r) =>
          r.path === path
            ? { ...r, filename: newName, path: newPath }
            : r
        ),
      }));
    } catch (err) {
      console.error('Failed to rename recording:', err);
      throw err;
    }
  },

  setSearch: (query) => set({ search: query }),
  setSortBy: (sort) => set({ sortBy: sort }),

  getFiltered: () => {
    const { recordings, search, sortBy } = get();
    let filtered = recordings;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = recordings.filter(
        (r) =>
          r.filename.toLowerCase().includes(q) ||
          r.format.toLowerCase().includes(q)
      );
    }
    return sortRecordings(filtered, sortBy);
  },
}));
