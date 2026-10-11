import { invoke } from '@tauri-apps/api/core';
import type {
  PlatformInfo,
  MonitorInfo,
  AudioDevice,
  WebcamDevice,
  AppSettings,
  RecorderState,
  StartRecordingParams,
  RecordingInfo,
  ScreenshotInfo,
  TakeScreenshotParams,
  StorageStats,
  HotkeyBinding,
  QualityPresetInfo,
} from '@/types';

export const api = {
  getPlatformInfo: () => invoke<PlatformInfo>('get_platform_info'),

  getMonitors: () => invoke<MonitorInfo[]>('get_monitors'),

  getAudioDevices: () => invoke<AudioDevice[]>('get_audio_devices'),

  getWebcams: () => invoke<WebcamDevice[]>('get_webcams'),

  getHardwareEncoders: () => invoke<string[]>('get_hardware_encoders'),

  getSettings: () => invoke<AppSettings>('get_settings'),

  saveSettings: (settings: AppSettings) =>
    invoke<void>('save_settings', { settings }),

  getRecorderState: () => invoke<RecorderState>('get_recorder_state'),

  startRecording: (params: StartRecordingParams) =>
    invoke<string>('start_recording', {
      source: params.source,
      audio_mode: params.audioMode,
      fps: params.fps,
      quality: params.quality,
      codec: params.codec,
      format: params.format,
      webcam_config: params.webcam ?? null,
    }),

  pauseRecording: () => invoke<void>('pause_recording'),

  resumeRecording: () => invoke<void>('resume_recording'),

  stopRecording: () => invoke<RecordingInfo>('stop_recording'),

  takeScreenshot: (params: TakeScreenshotParams) =>
    invoke<ScreenshotInfo>('take_screenshot', {
      source: params.source,
      format: params.format,
      quality: params.quality,
    }),

  listRecordings: () => invoke<RecordingInfo[]>('list_recordings'),

  listScreenshots: () => invoke<ScreenshotInfo[]>('list_screenshots'),

  getStorageStats: () => invoke<StorageStats>('get_storage_stats'),

  deleteRecording: (id: string) =>
    invoke<void>('delete_recording', { id }),

  deleteScreenshot: (id: string) =>
    invoke<void>('delete_screenshot', { id }),

  openFileLocation: (path: string) =>
    invoke<void>('open_file_location', { path }),

  getHotkeys: () => invoke<HotkeyBinding[]>('get_hotkeys'),

  saveHotkeys: (hotkeys: HotkeyBinding[]) =>
    invoke<void>('save_hotkeys', { hotkeys }),

  getQualityPresets: () =>
    invoke<QualityPresetInfo[]>('get_quality_presets'),

  renameFile: (oldPath: string, newName: string) =>
    invoke<string>('rename_file', { oldPath, newName }),

  getDefaultDirs: () =>
    invoke<{ recordings: string; screenshots: string }>('get_default_dirs'),
};
