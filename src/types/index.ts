// Capture
export type CaptureSource =
  | { type: 'fullScreen' }
  | { type: 'monitor'; id: number }
  | { type: 'window'; title: string }
  | { type: 'region'; x: number; y: number; width: number; height: number };

export interface MonitorInfo {
  id: number;
  name: string;
  width: number;
  height: number;
  isPrimary: boolean;
  refreshRate: number;
}

// Audio
export type AudioMode = 'none' | 'systemAudio' | 'microphone' | 'both';

export interface AudioDevice {
  id: string;
  name: string;
  isDefault: boolean;
  deviceType: 'input' | 'output';
}

// Encoder
export type VideoCodec = 'h264' | 'h265' | 'av1';
export type AudioCodec = 'aac' | 'opus';
export type ContainerFormat = 'mp4' | 'mkv' | 'webm';
export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra' | 'custom';
export type HardwareEncoder = 'none' | 'nvenc' | 'quickSync' | 'amf';

// Screenshot
export type ScreenshotFormat = 'png' | 'jpeg' | 'webp';

// Webcam
export interface WebcamDevice {
  id: string;
  name: string;
  resolutions: [number, number][];
}

export type WebcamOverlayPosition =
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | { custom: { x: number; y: number } };

export type WebcamOverlayShape = 'circle' | 'roundedRect';

export interface WebcamConfig {
  deviceId: string;
  resolution: [number, number];
  position: WebcamOverlayPosition;
  shape: WebcamOverlayShape;
  opacity: number;
  sizePercent: number;
}

// Recording
export type RecordingState =
  | 'idle'
  | 'countdown'
  | 'recording'
  | 'paused'
  | 'stopping'
  | 'error';

export interface RecorderState {
  state: RecordingState;
  startTime: string | null;
  elapsedSecs: number;
  currentFile: string | null;
  captureSource: CaptureSource | null;
  audioMode: AudioMode;
  fps: number;
  framesCaptured: number;
  fileSizeEstimate: number;
}

export interface RecordingInfo {
  id: string;
  filename: string;
  path: string;
  date: string;
  durationSecs: number;
  resolution: string;
  fps: number;
  fileSize: number;
  format: string;
  thumbnailPath: string | null;
}

export interface ScreenshotInfo {
  id: string;
  filename: string;
  path: string;
  date: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

// Storage
export interface StorageStats {
  totalBytes: number;
  freeBytes: number;
  recordingsCount: number;
  screenshotsCount: number;
  recordingsSize: number;
  screenshotsSize: number;
}

// Hotkeys
export type HotkeyAction =
  | 'startStopRecording'
  | 'pauseResume'
  | 'screenshot'
  | 'openApp';

export interface HotkeyBinding {
  action: HotkeyAction;
  modifiers: string[];
  key: string;
}

// Quality preset info
export interface QualityPresetInfo {
  name: string;
  bitrate: number;
  description: string;
}

// Platform
export interface PlatformInfo {
  os: string;
  arch: string;
  hasGpu: boolean;
  gpuName: string;
  captureApi: string;
  supportsHwEncoding: boolean;
}

// Settings
export interface GeneralSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  launchOnStartup: boolean;
  startMinimized: boolean;
  showTrayIcon: boolean;
}

export interface RecordingSettings {
  defaultFps: number;
  defaultResolution: string;
  defaultQuality: QualityPreset;
  defaultCodec: VideoCodec;
  defaultFormat: ContainerFormat;
  showCursor: boolean;
  highlightCursor: boolean;
  clickEffects: boolean;
  countdownSeconds: number;
}

export interface ScreenshotSettings {
  defaultFormat: ScreenshotFormat;
  jpegQuality: number;
  autoSave: boolean;
  copyToClipboard: boolean;
  showNotification: boolean;
}

export interface AudioSettings {
  defaultMode: AudioMode;
  defaultSampleRate: number;
  defaultBitrate: number;
  defaultChannels: number;
}

export interface WebcamSettings {
  enabled: boolean;
  defaultPosition: string;
  defaultShape: WebcamOverlayShape;
  defaultOpacity: number;
  defaultSizePercent: number;
}

export interface StorageSettings {
  recordingsDir: string;
  screenshotsDir: string;
  tempDir: string;
  filenamePrefix: string;
  maxFileSizeGb: number;
}

export interface AdvancedSettings {
  hardwareEncoding: boolean;
  debugLogging: boolean;
  autoRecovery: boolean;
}

export interface AppSettings {
  general: GeneralSettings;
  recording: RecordingSettings;
  screenshot: ScreenshotSettings;
  audio: AudioSettings;
  webcam: WebcamSettings;
  hotkeys: HotkeyBinding[];
  storage: StorageSettings;
  advanced: AdvancedSettings;
}

// IPC Params
export interface StartRecordingParams {
  source: CaptureSource;
  audioMode: AudioMode;
  fps: number;
  quality: QualityPreset;
  codec: VideoCodec;
  format: ContainerFormat;
  showCursor: boolean;
  highlightCursor: boolean;
  clickEffects: boolean;
  countdownSeconds: number;
  webcam: WebcamConfig | null;
}

export interface TakeScreenshotParams {
  source: CaptureSource;
  format: ScreenshotFormat;
  quality: number;
  copyToClipboard: boolean;
}
