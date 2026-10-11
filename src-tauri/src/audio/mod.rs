use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum AudioMode {
    None,
    SystemAudio,
    Microphone,
    Both,
}

impl Default for AudioMode {
    fn default() -> Self {
        AudioMode::None
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum AudioDeviceType {
    Input,
    Output,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
    pub device_type: AudioDeviceType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioConfig {
    pub sample_rate: u32,
    pub channels: u16,
    pub bitrate: u32,
}

impl Default for AudioConfig {
    fn default() -> Self {
        AudioConfig {
            sample_rate: 48000,
            channels: 2,
            bitrate: 192,
        }
    }
}

#[cfg(target_os = "windows")]
pub fn list_audio_devices() -> Vec<AudioDevice> {
    // On Windows, would use WASAPI to enumerate audio devices.
    vec![
        AudioDevice {
            id: "default-output".to_string(),
            name: "Default Output Device".to_string(),
            is_default: true,
            device_type: AudioDeviceType::Output,
        },
        AudioDevice {
            id: "default-input".to_string(),
            name: "Default Input Device".to_string(),
            is_default: true,
            device_type: AudioDeviceType::Input,
        },
    ]
}

#[cfg(not(target_os = "windows"))]
pub fn list_audio_devices() -> Vec<AudioDevice> {
    vec![
        AudioDevice {
            id: "stub-output".to_string(),
            name: "System Audio (stub)".to_string(),
            is_default: true,
            device_type: AudioDeviceType::Output,
        },
        AudioDevice {
            id: "stub-input".to_string(),
            name: "Microphone (stub)".to_string(),
            is_default: true,
            device_type: AudioDeviceType::Input,
        },
    ]
}
