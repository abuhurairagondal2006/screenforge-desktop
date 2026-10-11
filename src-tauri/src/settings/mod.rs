use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::audio::AudioMode;
use crate::encoder::{ContainerFormat, QualityPreset, VideoCodec};
use crate::hotkeys::HotkeyBinding;
use crate::screenshot::ScreenshotFormat;
use crate::webcam::{WebcamOverlayPosition, WebcamOverlayShape};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub general: GeneralSettings,
    pub recording: RecordingSettings,
    pub screenshot: ScreenshotSettings,
    pub audio: AudioSettings,
    pub webcam: WebcamSettings,
    pub hotkeys: Vec<HotkeyBinding>,
    pub storage: StorageSettings,
    pub advanced: AdvancedSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneralSettings {
    pub theme: String,
    pub language: String,
    pub launch_on_startup: bool,
    pub start_minimized: bool,
    pub show_tray_icon: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordingSettings {
    pub default_fps: u32,
    pub default_resolution: Option<(u32, u32)>,
    pub default_quality: QualityPreset,
    pub default_codec: VideoCodec,
    pub default_format: ContainerFormat,
    pub show_cursor: bool,
    pub highlight_cursor: bool,
    pub click_effects: bool,
    pub countdown_seconds: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenshotSettings {
    pub default_format: ScreenshotFormat,
    pub jpeg_quality: u8,
    pub auto_save: bool,
    pub copy_to_clipboard: bool,
    pub show_notification: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioSettings {
    pub default_mode: AudioMode,
    pub default_sample_rate: u32,
    pub default_bitrate: u32,
    pub default_channels: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebcamSettings {
    pub enabled: bool,
    pub default_position: WebcamOverlayPosition,
    pub default_shape: WebcamOverlayShape,
    pub default_opacity: f32,
    pub default_size_percent: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageSettings {
    pub recordings_dir: String,
    pub screenshots_dir: String,
    pub temp_dir: String,
    pub filename_prefix: String,
    pub max_file_size_gb: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdvancedSettings {
    pub hardware_encoding: bool,
    pub debug_logging: bool,
    pub auto_recovery: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        let recordings_dir = crate::storage::get_recordings_dir();
        let screenshots_dir = crate::storage::get_screenshots_dir();
        let temp_dir = crate::storage::get_temp_dir();

        Self {
            general: GeneralSettings {
                theme: "system".to_string(),
                language: "en".to_string(),
                launch_on_startup: false,
                start_minimized: false,
                show_tray_icon: true,
            },
            recording: RecordingSettings {
                default_fps: 30,
                default_resolution: None,
                default_quality: QualityPreset::High,
                default_codec: VideoCodec::H264,
                default_format: ContainerFormat::Mp4,
                show_cursor: true,
                highlight_cursor: false,
                click_effects: false,
                countdown_seconds: 3,
            },
            screenshot: ScreenshotSettings {
                default_format: ScreenshotFormat::Png,
                jpeg_quality: 90,
                auto_save: true,
                copy_to_clipboard: true,
                show_notification: true,
            },
            audio: AudioSettings {
                default_mode: AudioMode::None,
                default_sample_rate: 48000,
                default_bitrate: 192,
                default_channels: 2,
            },
            webcam: WebcamSettings {
                enabled: false,
                default_position: WebcamOverlayPosition::BottomRight,
                default_shape: WebcamOverlayShape::Circle,
                default_opacity: 1.0,
                default_size_percent: 20,
            },
            hotkeys: crate::hotkeys::default_hotkeys(),
            storage: StorageSettings {
                recordings_dir: recordings_dir.to_string_lossy().to_string(),
                screenshots_dir: screenshots_dir.to_string_lossy().to_string(),
                temp_dir: temp_dir.to_string_lossy().to_string(),
                filename_prefix: "screenforge".to_string(),
                max_file_size_gb: 10.0,
            },
            advanced: AdvancedSettings {
                hardware_encoding: true,
                debug_logging: false,
                auto_recovery: true,
            },
        }
    }
}

fn settings_path() -> PathBuf {
    dirs_next::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("ScreenForge")
        .join("settings.json")
}

pub fn load_settings() -> AppSettings {
    let path = settings_path();
    if !path.exists() {
        return AppSettings::default();
    }
    let Ok(data) = fs::read_to_string(&path) else {
        return AppSettings::default();
    };
    serde_json::from_str(&data).unwrap_or_default()
}

pub fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let path = settings_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Cannot create config dir: {}", e))?;
    }
    let json = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Cannot serialize settings: {}", e))?;
    fs::write(&path, json).map_err(|e| format!("Cannot write settings: {}", e))?;
    Ok(())
}
