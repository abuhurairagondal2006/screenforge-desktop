import { useEffect, useCallback } from 'react';
import { useRecorderStore } from '@/stores/recorderStore';
import { useRecordingsStore } from '@/stores/recordingsStore';
import { useToastStore } from '@/stores/toastStore';
import type {
  CaptureSource,
  AudioMode,
  VideoCodec,
  ContainerFormat,
  QualityPreset,
  WebcamConfig,
} from '@/types';

export function useRecorder() {
  const store = useRecorderStore();
  const loadRecordings = useRecordingsStore((s) => s.loadRecordings);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    store.syncState();
  }, []);

  const start = useCallback(async () => {
    await store.startRecording();
  }, [store]);

  const stop = useCallback(async () => {
    const info = await store.stopRecording();
    if (info) {
      addToast('success', `Recording saved: ${info.filename}`);
      loadRecordings();
    }
  }, [store, addToast, loadRecordings]);

  const pause = useCallback(async () => {
    await store.pauseRecording();
  }, [store]);

  const resume = useCallback(async () => {
    await store.resumeRecording();
  }, [store]);

  const setCaptureSource = useCallback(
    (source: CaptureSource) => store.setCaptureSource(source),
    [store]
  );

  const setAudioMode = useCallback(
    (mode: AudioMode) => store.setAudioMode(mode),
    [store]
  );

  const setFps = useCallback(
    (fps: number) => store.setFps(fps),
    [store]
  );

  const setQuality = useCallback(
    (quality: QualityPreset) => store.setQuality(quality),
    [store]
  );

  const setCodec = useCallback(
    (codec: VideoCodec) => store.setCodec(codec),
    [store]
  );

  const setFormat = useCallback(
    (format: ContainerFormat) => store.setFormat(format),
    [store]
  );

  const setShowCursor = useCallback(
    (show: boolean) => store.setShowCursor(show),
    [store]
  );

  const setHighlightCursor = useCallback(
    (highlight: boolean) => store.setHighlightCursor(highlight),
    [store]
  );

  const setClickEffects = useCallback(
    (effects: boolean) => store.setClickEffects(effects),
    [store]
  );

  const setCountdownSeconds = useCallback(
    (seconds: number) => store.setCountdownSeconds(seconds),
    [store]
  );

  const setWebcamConfig = useCallback(
    (config: WebcamConfig | null) => store.setWebcamConfig(config),
    [store]
  );

  const isRecording =
    store.recordingState === 'recording' || store.recordingState === 'paused';
  const isIdle = store.recordingState === 'idle';
  const isPaused = store.recordingState === 'paused';
  const isStopping = store.recordingState === 'stopping';
  const isCountdown = store.recordingState === 'countdown';

  return {
    // State
    recordingState: store.recordingState,
    elapsedSecs: store.elapsedSecs,
    framesCaptured: store.framesCaptured,
    fileSizeEstimate: store.fileSizeEstimate,
    currentFile: store.currentFile,
    lastError: store.lastError,

    // Config
    captureSource: store.captureSource,
    audioMode: store.audioMode,
    fps: store.fps,
    quality: store.quality,
    codec: store.codec,
    format: store.format,
    showCursor: store.showCursor,
    highlightCursor: store.highlightCursor,
    clickEffects: store.clickEffects,
    countdownSeconds: store.countdownSeconds,
    webcamConfig: store.webcamConfig,

    // Derived
    isRecording,
    isIdle,
    isPaused,
    isStopping,
    isCountdown,

    // Actions
    start,
    stop,
    pause,
    resume,
    setCaptureSource,
    setAudioMode,
    setFps,
    setQuality,
    setCodec,
    setFormat,
    setShowCursor,
    setHighlightCursor,
    setClickEffects,
    setCountdownSeconds,
    setWebcamConfig,
  };
}
