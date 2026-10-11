use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum VideoCodec {
    H264,
    H265,
    #[serde(rename = "AV1")]
    Av1,
}

impl Default for VideoCodec {
    fn default() -> Self {
        VideoCodec::H264
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum AudioCodec {
    #[serde(rename = "AAC")]
    Aac,
    Opus,
}

impl Default for AudioCodec {
    fn default() -> Self {
        AudioCodec::Aac
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum ContainerFormat {
    #[serde(rename = "MP4")]
    Mp4,
    #[serde(rename = "MKV")]
    Mkv,
    WebM,
}

impl Default for ContainerFormat {
    fn default() -> Self {
        ContainerFormat::Mp4
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum QualityPreset {
    Low,
    Medium,
    High,
    Ultra,
    Custom,
}

impl Default for QualityPreset {
    fn default() -> Self {
        QualityPreset::High
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EncoderConfig {
    pub video_codec: VideoCodec,
    pub audio_codec: AudioCodec,
    pub container: ContainerFormat,
    pub quality_preset: QualityPreset,
    pub bitrate: u32,
    pub keyframe_interval: u32,
}

impl Default for EncoderConfig {
    fn default() -> Self {
        get_preset_config(QualityPreset::High, (1920, 1080), 30)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum HardwareEncoder {
    None,
    Nvenc,
    QuickSync,
    Amf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QualityPresetInfo {
    pub name: String,
    pub bitrate: u32,
    pub description: String,
}

pub fn detect_hardware_encoders() -> Vec<HardwareEncoder> {
    // In a real implementation, would probe for GPU encoder support.
    // NVENC: check for NVIDIA GPU via nvml or driver queries.
    // QuickSync: check for Intel integrated GPU.
    // AMF: check for AMD GPU.
    vec![HardwareEncoder::None]
}

pub fn get_preset_config(preset: QualityPreset, resolution: (u32, u32), fps: u32) -> EncoderConfig {
    let pixels = resolution.0 as u64 * resolution.1 as u64;
    let fps_factor = fps as f64 / 30.0;

    let base_bitrate = match preset {
        QualityPreset::Low => (pixels as f64 * 0.05 * fps_factor) as u32,
        QualityPreset::Medium => (pixels as f64 * 0.1 * fps_factor) as u32,
        QualityPreset::High => (pixels as f64 * 0.2 * fps_factor) as u32,
        QualityPreset::Ultra => (pixels as f64 * 0.4 * fps_factor) as u32,
        QualityPreset::Custom => (pixels as f64 * 0.2 * fps_factor) as u32,
    };

    // Clamp bitrate to reasonable range (500 Kbps - 100 Mbps)
    let bitrate = base_bitrate.clamp(500, 100_000);

    let keyframe_interval = fps * 2; // keyframe every 2 seconds

    EncoderConfig {
        video_codec: VideoCodec::H264,
        audio_codec: AudioCodec::Aac,
        container: ContainerFormat::Mp4,
        quality_preset: preset,
        bitrate,
        keyframe_interval,
    }
}

pub fn get_quality_presets() -> Vec<QualityPresetInfo> {
    vec![
        QualityPresetInfo {
            name: "Low".to_string(),
            bitrate: 2500,
            description: "Smaller file size, suitable for sharing".to_string(),
        },
        QualityPresetInfo {
            name: "Medium".to_string(),
            bitrate: 5000,
            description: "Balanced quality and file size".to_string(),
        },
        QualityPresetInfo {
            name: "High".to_string(),
            bitrate: 8000,
            description: "High quality, recommended for most uses".to_string(),
        },
        QualityPresetInfo {
            name: "Ultra".to_string(),
            bitrate: 20000,
            description: "Maximum quality, large file size".to_string(),
        },
    ]
}
