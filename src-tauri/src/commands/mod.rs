use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::State;

use crate::audio::{AudioDevice, AudioMode};
use crate::capture::{CaptureSource, MonitorInfo};
use crate::encoder::{
    ContainerFormat, HardwareEncoder, QualityPreset, QualityPresetInfo, VideoCodec,
};
use crate::hotkeys::HotkeyBinding;
use crate::platform::PlatformInfo;
use crate::recorder::RecorderState;
use crate::screenshot::{ScreenshotConfig, ScreenshotFormat};
use crate::settings::AppSettings;
use crate::storage::{RecordingInfo, ScreenshotInfo, StorageStats};
use crate::webcam::{WebcamConfig, WebcamDevice};
use crate::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DefaultDirs {
    pub recordings: String,
    pub screenshots: String,
}

// ──────────────────────────── Platform ────────────────────────────

#[tauri::command]
pub fn get_platform_info() -> PlatformInfo {
    crate::platform::get_platform_info()
}

// ──────────────────────────── Monitors ────────────────────────────

#[tauri::command]
pub fn get_monitors() -> Vec<MonitorInfo> {
    crate::capture::list_monitors()
}

// ──────────────────────────── Audio ───────────────────────────────

#[tauri::command]
pub fn get_audio_devices() -> Vec<AudioDevice> {
    crate::audio::list_audio_devices()
}

// ──────────────────────────── Webcam ──────────────────────────────

#[tauri::command]
pub fn get_webcams() -> Vec<WebcamDevice> {
    crate::webcam::list_webcams()
}

// ──────────────────────────── Encoders ────────────────────────────

#[tauri::command]
pub fn get_hardware_encoders() -> Vec<String> {
    crate::encoder::detect_hardware_encoders()
        .into_iter()
        .map(|e| match e {
            HardwareEncoder::None => "None".to_string(),
            HardwareEncoder::Nvenc => "NVENC".to_string(),
            HardwareEncoder::QuickSync => "QuickSync".to_string(),
            HardwareEncoder::Amf => "AMF".to_string(),
        })
        .collect()
}

#[tauri::command]
pub fn get_quality_presets() -> Vec<QualityPresetInfo> {
    crate::encoder::get_quality_presets()
}

// ──────────────────────────── Settings ────────────────────────────

#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> AppSettings {
    let settings = state.settings.lock().unwrap();
    settings.clone()
}

#[tauri::command]
pub fn save_settings(
    settings: AppSettings,
    state: State<'_, AppState>,
) -> Result<(), String> {
    crate::settings::save_settings(&settings)?;
    let mut current = state.settings.lock().unwrap();
    *current = settings;
    Ok(())
}

// ──────────────────────────── Recorder State ──────────────────────

#[tauri::command]
pub fn get_recorder_state(state: State<'_, AppState>) -> RecorderState {
    let recorder = state.recorder_state.lock().unwrap();
    recorder.clone()
}

// ──────────────────────────── Recording ──────────────────────────

#[tauri::command]
pub fn start_recording(
    source: CaptureSource,
    audio_mode: AudioMode,
    fps: u32,
    quality: QualityPreset,
    codec: VideoCodec,
    format: ContainerFormat,
    webcam_config: Option<WebcamConfig>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let settings = state.settings.lock().unwrap();
    let recordings_dir = PathBuf::from(&settings.storage.recordings_dir);
    drop(settings);

    let container_ext = match &format {
        ContainerFormat::Mp4 => "mp4",
        ContainerFormat::Mkv => "mkv",
        ContainerFormat::WebM => "webm",
    };

    let filename = crate::storage::generate_recording_filename("screenforge", container_ext);
    let file_path = recordings_dir.join(&filename);

    // Ensure the recordings directory exists
    let _ = std::fs::create_dir_all(&recordings_dir);

    // Create the output file so the recording workflow produces a real file
    std::fs::File::create(&file_path)
        .map_err(|e| format!("Failed to create recording file: {}", e))?;

    let mut recorder = state.recorder_state.lock().unwrap();
    recorder.start(
        source,
        audio_mode,
        fps,
        file_path.to_string_lossy().to_string(),
    )?;

    log::info!(
        "Recording started: codec={:?}, quality={:?}, format={:?}, webcam={:?}, file={:?}",
        codec,
        quality,
        format,
        webcam_config.is_some(),
        file_path.display()
    );

    if !crate::platform::is_windows() {
        log::warn!("Actual screen capture requires Windows. Recording state is being tracked but no frames are captured on this platform.");
    }

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn pause_recording(state: State<'_, AppState>) -> Result<(), String> {
    let mut recorder = state.recorder_state.lock().unwrap();
    recorder.pause()
}

#[tauri::command]
pub fn resume_recording(state: State<'_, AppState>) -> Result<(), String> {
    let mut recorder = state.recorder_state.lock().unwrap();
    recorder.resume()
}

#[tauri::command]
pub fn stop_recording(state: State<'_, AppState>) -> Result<RecordingInfo, String> {
    let mut recorder = state.recorder_state.lock().unwrap();
    let elapsed = recorder.elapsed_secs;
    let file_path = recorder.stop()?;

    let path = PathBuf::from(&file_path);
    let filename = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let ext = path
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let file_size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);

    Ok(RecordingInfo {
        id: crate::storage::stable_id(&path),
        filename,
        path: file_path,
        date: chrono::Local::now().to_rfc3339(),
        duration_secs: elapsed,
        resolution: None,
        fps: None,
        file_size,
        format: ext,
        thumbnail_path: None,
    })
}

// ──────────────────────────── Screenshot ─────────────────────────

#[tauri::command]
pub fn take_screenshot(
    source: CaptureSource,
    format: ScreenshotFormat,
    quality: Option<u8>,
    state: State<'_, AppState>,
) -> Result<ScreenshotInfo, String> {
    let settings = state.settings.lock().unwrap();
    let screenshots_dir = PathBuf::from(&settings.storage.screenshots_dir);
    drop(settings);

    let _ = std::fs::create_dir_all(&screenshots_dir);

    let config = ScreenshotConfig {
        format: format.clone(),
        quality,
        source,
    };

    let result = crate::screenshot::take_screenshot(&config, &screenshots_dir)
        .map_err(|e| e.to_string())?;

    Ok(ScreenshotInfo {
        id: crate::storage::stable_id(&PathBuf::from(&result.path)),
        filename: PathBuf::from(&result.path)
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string(),
        path: result.path,
        date: result.timestamp,
        width: result.width,
        height: result.height,
        file_size: result.file_size,
        format: format.extension().to_string(),
    })
}

// ──────────────────────────── File Listings ───────────────────────

#[tauri::command]
pub fn list_recordings(state: State<'_, AppState>) -> Vec<RecordingInfo> {
    crate::storage::list_recordings(&state.recordings_dir)
}

#[tauri::command]
pub fn list_screenshots(state: State<'_, AppState>) -> Vec<ScreenshotInfo> {
    crate::storage::list_screenshots(&state.screenshots_dir)
}

// ──────────────────────────── Storage ─────────────────────────────

#[tauri::command]
pub fn get_storage_stats(state: State<'_, AppState>) -> StorageStats {
    crate::storage::get_storage_stats(&state.recordings_dir, &state.screenshots_dir)
}

// ──────────────────────────── File Operations ────────────────────

#[tauri::command]
pub fn delete_recording(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let recordings = crate::storage::list_recordings(&state.recordings_dir);
    let recording = recordings
        .iter()
        .find(|r| r.id == id || r.filename == id || r.path == id)
        .ok_or_else(|| format!("Recording not found: {}", id))?;

    let path = Path::new(&recording.path);
    if path.exists() {
        std::fs::remove_file(path).map_err(|e| format!("Failed to delete recording: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn delete_screenshot(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let screenshots = crate::storage::list_screenshots(&state.screenshots_dir);
    let screenshot = screenshots
        .iter()
        .find(|s| s.id == id || s.filename == id || s.path == id)
        .ok_or_else(|| format!("Screenshot not found: {}", id))?;

    let path = Path::new(&screenshot.path);
    if path.exists() {
        std::fs::remove_file(path).map_err(|e| format!("Failed to delete screenshot: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn open_file_location(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    let target = if p.is_file() {
        p.parent().unwrap_or(p)
    } else {
        p
    };

    open::that(target).map_err(|e| format!("Cannot open folder: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn rename_file(old_path: String, new_name: String) -> Result<String, String> {
    let old = PathBuf::from(&old_path);
    if !old.exists() {
        return Err(format!("File not found: {}", old_path));
    }

    let sanitized_name = crate::security::sanitize_filename(&new_name);
    if sanitized_name.is_empty() {
        return Err("Invalid filename".to_string());
    }

    let parent = old
        .parent()
        .ok_or_else(|| "Cannot determine parent directory".to_string())?;
    let new_path = parent.join(&sanitized_name);

    if new_path.exists() {
        return Err(format!("File already exists: {}", new_path.display()));
    }

    std::fs::rename(&old, &new_path)
        .map_err(|e| format!("Failed to rename file: {}", e))?;

    Ok(new_path.to_string_lossy().to_string())
}

// ──────────────────────────── Hotkeys ─────────────────────────────

#[tauri::command]
pub fn get_hotkeys(state: State<'_, AppState>) -> Vec<HotkeyBinding> {
    let settings = state.settings.lock().unwrap();
    settings.hotkeys.clone()
}

#[tauri::command]
pub fn save_hotkeys(
    hotkeys: Vec<HotkeyBinding>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut settings = state.settings.lock().unwrap();
    settings.hotkeys = hotkeys;
    let settings_clone = settings.clone();
    drop(settings);
    crate::settings::save_settings(&settings_clone)
}

// ──────────────────────────── Default Dirs ────────────────────────

#[tauri::command]
pub fn get_default_dirs() -> DefaultDirs {
    DefaultDirs {
        recordings: crate::storage::get_recordings_dir()
            .to_string_lossy()
            .to_string(),
        screenshots: crate::storage::get_screenshots_dir()
            .to_string_lossy()
            .to_string(),
    }
}
