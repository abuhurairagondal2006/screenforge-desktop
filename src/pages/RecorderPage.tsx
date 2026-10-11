import { useState, useEffect } from 'react';
import {
  Video,
  Eye,
  EyeOff,
  MousePointer2,
  Timer,
  Webcam,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRecorder } from '@/hooks/useRecorder';
import { SourceSelector } from '@/components/recorder/SourceSelector';
import { AudioSelector } from '@/components/recorder/AudioSelector';
import { RecordingControls } from '@/components/recorder/RecordingControls';
import type { QualityPreset, VideoCodec, ContainerFormat, WebcamDevice } from '@/types';
import { api } from '@/services/ipc';
import { t } from '@/i18n';

const FPS_OPTIONS = [15, 24, 30, 60];
const QUALITY_OPTIONS: QualityPreset[] = ['low', 'medium', 'high', 'ultra'];
const CODEC_OPTIONS: VideoCodec[] = ['h264', 'h265', 'av1'];
const FORMAT_OPTIONS: ContainerFormat[] = ['mp4', 'mkv', 'webm'];

export function RecorderPage() {
  const recorder = useRecorder();
  const [webcams, setWebcams] = useState<WebcamDevice[]>([]);
  const [webcamEnabled, setWebcamEnabled] = useState(false);

  useEffect(() => {
    api.getWebcams().then(setWebcams).catch(() => setWebcams([]));
  }, []);

  const isActive = recorder.isRecording || recorder.isPaused || recorder.isCountdown || recorder.isStopping;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Video size={24} className="text-surface-600 dark:text-surface-400" />
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
          {t('recorder.title')}
        </h1>
      </div>

      {/* Recording Controls - always visible */}
      <RecordingControls
        recordingState={recorder.recordingState}
        elapsedSecs={recorder.elapsedSecs}
        framesCaptured={recorder.framesCaptured}
        fileSizeEstimate={recorder.fileSizeEstimate}
        onStart={recorder.start}
        onStop={recorder.stop}
        onPause={recorder.pause}
        onResume={recorder.resume}
      />

      {/* Error display */}
      {recorder.lastError && (
        <div className="card p-4 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-400">
            {recorder.lastError}
          </p>
        </div>
      )}

      {/* Settings - disabled while recording */}
      <div className={clsx('space-y-4', isActive && 'opacity-60 pointer-events-none')}>
        <div className="grid grid-cols-2 gap-4">
          {/* Left column: Source and Audio */}
          <div className="space-y-4">
            <div className="card p-4">
              <SourceSelector
                value={recorder.captureSource}
                onChange={recorder.setCaptureSource}
                disabled={isActive}
              />
            </div>

            <div className="card p-4">
              <AudioSelector
                value={recorder.audioMode}
                onChange={recorder.setAudioMode}
                disabled={isActive}
              />
            </div>
          </div>

          {/* Right column: Quality, Codec, Format, Cursor */}
          <div className="space-y-4">
            {/* Resolution and FPS */}
            <div className="card p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  {t('recorder.fps')}
                </label>
                <div className="flex gap-2">
                  {FPS_OPTIONS.map((fps) => (
                    <button
                      key={fps}
                      onClick={() => recorder.setFps(fps)}
                      disabled={isActive}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-sm font-medium transition-colors border',
                        recorder.fps === fps
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                          : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300'
                      )}
                    >
                      {fps}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  {t('recorder.quality')}
                </label>
                <div className="flex gap-2">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => recorder.setQuality(q)}
                      disabled={isActive}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-sm font-medium transition-colors border capitalize',
                        recorder.quality === q
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                          : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300'
                      )}
                    >
                      {t(`recorder.${q}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Codec and Format */}
            <div className="card p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  {t('recorder.codec')}
                </label>
                <select
                  className="input-field text-sm"
                  value={recorder.codec}
                  onChange={(e) => recorder.setCodec(e.target.value as VideoCodec)}
                  disabled={isActive}
                >
                  {CODEC_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  {t('recorder.format')}
                </label>
                <select
                  className="input-field text-sm"
                  value={recorder.format}
                  onChange={(e) => recorder.setFormat(e.target.value as ContainerFormat)}
                  disabled={isActive}
                >
                  {FORMAT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cursor Options */}
            <div className="card p-4 space-y-3">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                {t('recorder.cursorOptions')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recorder.showCursor}
                    onChange={(e) => recorder.setShowCursor(e.target.checked)}
                    disabled={isActive}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                    {recorder.showCursor ? <Eye size={14} /> : <EyeOff size={14} />}
                    {t('recorder.showCursor')}
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recorder.highlightCursor}
                    onChange={(e) => recorder.setHighlightCursor(e.target.checked)}
                    disabled={isActive || !recorder.showCursor}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                    <MousePointer2 size={14} />
                    {t('recorder.highlightCursor')}
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recorder.clickEffects}
                    onChange={(e) => recorder.setClickEffects(e.target.checked)}
                    disabled={isActive || !recorder.showCursor}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                    <MousePointer2 size={14} />
                    {t('recorder.clickEffects')}
                  </span>
                </label>
              </div>
            </div>

            {/* Countdown */}
            <div className="card p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                <Timer size={14} />
                {t('recorder.countdown')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={recorder.countdownSeconds}
                  onChange={(e) => recorder.setCountdownSeconds(Number(e.target.value))}
                  disabled={isActive}
                  className="flex-1 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full appearance-none accent-primary-500"
                />
                <span className="text-sm font-mono text-surface-600 dark:text-surface-400 w-16 text-right">
                  {recorder.countdownSeconds} {t('recorder.seconds')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Webcam Section */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300">
              <Webcam size={16} />
              {t('recorder.webcam')}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={webcamEnabled}
                onChange={(e) => {
                  setWebcamEnabled(e.target.checked);
                  if (!e.target.checked) {
                    recorder.setWebcamConfig(null);
                  } else if (webcams.length > 0) {
                    recorder.setWebcamConfig({
                      deviceId: webcams[0].id,
                      resolution: webcams[0].resolutions[0] ?? [640, 480],
                      position: 'bottomRight',
                      shape: 'circle',
                      opacity: 100,
                      sizePercent: 20,
                    });
                  }
                }}
                disabled={isActive || webcams.length === 0}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-600 dark:text-surface-400">
                {t('recorder.webcamEnabled')}
              </span>
            </label>
          </div>

          {webcamEnabled && recorder.webcamConfig && (
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
                  Device
                </label>
                <select
                  className="input-field text-sm"
                  value={recorder.webcamConfig.deviceId}
                  onChange={(e) =>
                    recorder.setWebcamConfig({
                      ...recorder.webcamConfig!,
                      deviceId: e.target.value,
                    })
                  }
                  disabled={isActive}
                >
                  {webcams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
                  {t('recorder.webcamPosition')}
                </label>
                <select
                  className="input-field text-sm"
                  value={
                    typeof recorder.webcamConfig.position === 'string'
                      ? recorder.webcamConfig.position
                      : 'bottomRight'
                  }
                  onChange={(e) =>
                    recorder.setWebcamConfig({
                      ...recorder.webcamConfig!,
                      position: e.target.value as 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
                    })
                  }
                  disabled={isActive}
                >
                  <option value="topLeft">{t('recorder.topLeft')}</option>
                  <option value="topRight">{t('recorder.topRight')}</option>
                  <option value="bottomLeft">{t('recorder.bottomLeft')}</option>
                  <option value="bottomRight">{t('recorder.bottomRight')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
                  {t('recorder.webcamShape')}
                </label>
                <select
                  className="input-field text-sm"
                  value={recorder.webcamConfig.shape}
                  onChange={(e) =>
                    recorder.setWebcamConfig({
                      ...recorder.webcamConfig!,
                      shape: e.target.value as 'circle' | 'roundedRect',
                    })
                  }
                  disabled={isActive}
                >
                  <option value="circle">{t('recorder.circle')}</option>
                  <option value="roundedRect">{t('recorder.roundedRect')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">
                  {t('recorder.webcamSize')} ({recorder.webcamConfig.sizePercent}%)
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={recorder.webcamConfig.sizePercent}
                  onChange={(e) =>
                    recorder.setWebcamConfig({
                      ...recorder.webcamConfig!,
                      sizePercent: Number(e.target.value),
                    })
                  }
                  disabled={isActive}
                  className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full appearance-none accent-primary-500 mt-2"
                />
              </div>
            </div>
          )}

          {webcams.length === 0 && (
            <p className="text-xs text-surface-400 dark:text-surface-500">
              No webcam devices detected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
