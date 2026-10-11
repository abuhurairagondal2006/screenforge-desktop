import { create } from 'zustand';
import type {
  RecordingState,
  CaptureSource,
  AudioMode,
  VideoCodec,
  ContainerFormat,
  QualityPreset,
  WebcamConfig,
  RecordingInfo,
} from '@/types';
import { api } from '@/services/ipc';

interface RecorderStoreState {
  // Recording state
  recordingState: RecordingState;
  elapsedSecs: number;
  framesCaptured: number;
  fileSizeEstimate: number;
  currentFile: string | null;
  lastError: string | null;

  // Configuration for next recording
  captureSource: CaptureSource;
  audioMode: AudioMode;
  fps: number;
  quality: QualityPreset;
  codec: VideoCodec;
  format: ContainerFormat;
  showCursor: boolean;
  highlightCursor: boolean;
  clickEffects: boolean;
  countdownSeconds: number;
  webcamConfig: WebcamConfig | null;

  // Timer
  _timerId: ReturnType<typeof setInterval> | null;

  // Actions
  setCaptureSource: (source: CaptureSource) => void;
  setAudioMode: (mode: AudioMode) => void;
  setFps: (fps: number) => void;
  setQuality: (quality: QualityPreset) => void;
  setCodec: (codec: VideoCodec) => void;
  setFormat: (format: ContainerFormat) => void;
  setShowCursor: (show: boolean) => void;
  setHighlightCursor: (highlight: boolean) => void;
  setClickEffects: (effects: boolean) => void;
  setCountdownSeconds: (seconds: number) => void;
  setWebcamConfig: (config: WebcamConfig | null) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordingInfo | null>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  syncState: () => Promise<void>;
  _startTimer: () => void;
  _stopTimer: () => void;
}

export const useRecorderStore = create<RecorderStoreState>((set, get) => ({
  recordingState: 'idle',
  elapsedSecs: 0,
  framesCaptured: 0,
  fileSizeEstimate: 0,
  currentFile: null,
  lastError: null,

  captureSource: { type: 'fullScreen' },
  audioMode: 'none',
  fps: 30,
  quality: 'high',
  codec: 'h264',
  format: 'mp4',
  showCursor: true,
  highlightCursor: false,
  clickEffects: false,
  countdownSeconds: 3,
  webcamConfig: null,

  _timerId: null,

  setCaptureSource: (source) => set({ captureSource: source }),
  setAudioMode: (mode) => set({ audioMode: mode }),
  setFps: (fps) => set({ fps }),
  setQuality: (quality) => set({ quality }),
  setCodec: (codec) => set({ codec }),
  setFormat: (format) => set({ format }),
  setShowCursor: (show) => set({ showCursor: show }),
  setHighlightCursor: (highlight) => set({ highlightCursor: highlight }),
  setClickEffects: (effects) => set({ clickEffects: effects }),
  setCountdownSeconds: (seconds) => set({ countdownSeconds: seconds }),
  setWebcamConfig: (config) => set({ webcamConfig: config }),

  startRecording: async () => {
    const state = get();
    if (state.recordingState !== 'idle') return;

    set({ recordingState: 'countdown', lastError: null, elapsedSecs: 0, framesCaptured: 0, fileSizeEstimate: 0 });

    try {
      const file = await api.startRecording({
        source: state.captureSource,
        audioMode: state.audioMode,
        fps: state.fps,
        quality: state.quality,
        codec: state.codec,
        format: state.format,
        showCursor: state.showCursor,
        highlightCursor: state.highlightCursor,
        clickEffects: state.clickEffects,
        countdownSeconds: state.countdownSeconds,
        webcam: state.webcamConfig,
      });
      set({ recordingState: 'recording', currentFile: file });
      get()._startTimer();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ recordingState: 'error', lastError: message });
    }
  },

  stopRecording: async () => {
    const state = get();
    if (state.recordingState !== 'recording' && state.recordingState !== 'paused') {
      return null;
    }

    set({ recordingState: 'stopping' });
    get()._stopTimer();

    try {
      const info = await api.stopRecording();
      set({
        recordingState: 'idle',
        currentFile: null,
        elapsedSecs: 0,
        framesCaptured: 0,
        fileSizeEstimate: 0,
      });
      return info;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ recordingState: 'error', lastError: message });
      return null;
    }
  },

  pauseRecording: async () => {
    if (get().recordingState !== 'recording') return;
    try {
      await api.pauseRecording();
      set({ recordingState: 'paused' });
      get()._stopTimer();
    } catch (err) {
      console.error('Failed to pause recording:', err);
    }
  },

  resumeRecording: async () => {
    if (get().recordingState !== 'paused') return;
    try {
      await api.resumeRecording();
      set({ recordingState: 'recording' });
      get()._startTimer();
    } catch (err) {
      console.error('Failed to resume recording:', err);
    }
  },

  syncState: async () => {
    try {
      const backendState = await api.getRecorderState();
      set({
        recordingState: backendState.state,
        elapsedSecs: backendState.elapsedSecs,
        framesCaptured: backendState.framesCaptured,
        fileSizeEstimate: backendState.fileSizeEstimate,
        currentFile: backendState.currentFile,
      });
      if (backendState.state === 'recording' && !get()._timerId) {
        get()._startTimer();
      } else if (backendState.state !== 'recording' && get()._timerId) {
        get()._stopTimer();
      }
    } catch {
      // Backend not available, keep current state
    }
  },

  _startTimer: () => {
    const existing = get()._timerId;
    if (existing) clearInterval(existing);
    const timerId = setInterval(() => {
      set((s) => ({ elapsedSecs: s.elapsedSecs + 1 }));
    }, 1000);
    set({ _timerId: timerId });
  },

  _stopTimer: () => {
    const timerId = get()._timerId;
    if (timerId) {
      clearInterval(timerId);
      set({ _timerId: null });
    }
  },
}));
