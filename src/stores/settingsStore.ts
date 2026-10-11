import { create } from 'zustand';
import type { AppSettings } from '@/types';
import { api } from '@/services/ipc';

const defaultSettings: AppSettings = {
  general: {
    theme: 'system',
    language: 'en',
    launchOnStartup: false,
    startMinimized: false,
    showTrayIcon: true,
  },
  recording: {
    defaultFps: 30,
    defaultResolution: '1920x1080',
    defaultQuality: 'high',
    defaultCodec: 'h264',
    defaultFormat: 'mp4',
    showCursor: true,
    highlightCursor: false,
    clickEffects: false,
    countdownSeconds: 3,
  },
  screenshot: {
    defaultFormat: 'png',
    jpegQuality: 90,
    autoSave: true,
    copyToClipboard: true,
    showNotification: true,
  },
  audio: {
    defaultMode: 'none',
    defaultSampleRate: 44100,
    defaultBitrate: 128,
    defaultChannels: 2,
  },
  webcam: {
    enabled: false,
    defaultPosition: 'bottomRight',
    defaultShape: 'circle',
    defaultOpacity: 100,
    defaultSizePercent: 20,
  },
  hotkeys: [
    { action: 'startStopRecording', modifiers: ['Ctrl', 'Shift'], key: 'R' },
    { action: 'pauseResume', modifiers: ['Ctrl', 'Shift'], key: 'P' },
    { action: 'screenshot', modifiers: ['Ctrl', 'Shift'], key: 'S' },
    { action: 'openApp', modifiers: ['Ctrl', 'Shift'], key: 'F' },
  ],
  storage: {
    recordingsDir: '',
    screenshotsDir: '',
    tempDir: '',
    filenamePrefix: 'screenforge',
    maxFileSizeGb: 4,
  },
  advanced: {
    hardwareEncoding: true,
    debugLogging: false,
    autoRecovery: true,
  },
};

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => void;
  saveSettings: () => Promise<void>;
  resetDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  loading: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await api.getSettings();
      set({ settings, loading: false });
    } catch (err) {
      console.warn('Failed to load settings from backend, using defaults:', err);
      set({ loading: false });
    }
  },

  updateSettings: (patch) => {
    const current = get().settings;
    set({
      settings: {
        ...current,
        ...patch,
        general: { ...current.general, ...(patch.general ?? {}) },
        recording: { ...current.recording, ...(patch.recording ?? {}) },
        screenshot: { ...current.screenshot, ...(patch.screenshot ?? {}) },
        audio: { ...current.audio, ...(patch.audio ?? {}) },
        webcam: { ...current.webcam, ...(patch.webcam ?? {}) },
        storage: { ...current.storage, ...(patch.storage ?? {}) },
        advanced: { ...current.advanced, ...(patch.advanced ?? {}) },
        hotkeys: patch.hotkeys ?? current.hotkeys,
      },
    });
  },

  saveSettings: async () => {
    try {
      await api.saveSettings(get().settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
      throw err;
    }
  },

  resetDefaults: () => {
    set({ settings: defaultSettings });
  },
}));
