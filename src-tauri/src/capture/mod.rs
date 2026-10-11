use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum CaptureSource {
    FullScreen,
    Monitor { id: u32 },
    Window { title: String },
    Region { x: i32, y: i32, width: u32, height: u32 },
}

impl Default for CaptureSource {
    fn default() -> Self {
        CaptureSource::FullScreen
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorInfo {
    pub id: u32,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub is_primary: bool,
    pub refresh_rate: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CaptureConfig {
    pub source: CaptureSource,
    pub fps: u32,
    pub resolution: Option<(u32, u32)>,
}

#[derive(Debug, Clone)]
pub struct CaptureFrame {
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub timestamp_ms: u64,
}

#[derive(Debug, Error)]
pub enum CaptureError {
    #[error("Screen capture is not supported on this platform")]
    PlatformNotSupported,
    #[error("Monitor not found: {0}")]
    MonitorNotFound(u32),
    #[error("Window not found: {0}")]
    WindowNotFound(String),
    #[error("Capture failed: {0}")]
    CaptureFailed(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}

#[cfg(target_os = "windows")]
pub fn list_monitors() -> Vec<MonitorInfo> {
    // On Windows, would use win32 APIs (EnumDisplayMonitors) to enumerate monitors.
    // For now, return a primary monitor placeholder.
    vec![MonitorInfo {
        id: 0,
        name: "Primary Monitor".to_string(),
        width: 1920,
        height: 1080,
        is_primary: true,
        refresh_rate: 60,
    }]
}

#[cfg(not(target_os = "windows"))]
pub fn list_monitors() -> Vec<MonitorInfo> {
    vec![MonitorInfo {
        id: 0,
        name: "Primary Monitor (stub)".to_string(),
        width: 1920,
        height: 1080,
        is_primary: true,
        refresh_rate: 60,
    }]
}

#[cfg(target_os = "windows")]
pub fn capture_frame(source: &CaptureSource) -> Result<CaptureFrame, CaptureError> {
    // On Windows, would use DXGI Desktop Duplication or Windows.Graphics.Capture.
    // Placeholder implementation.
    let (width, height) = match source {
        CaptureSource::FullScreen | CaptureSource::Monitor { .. } => (1920u32, 1080u32),
        CaptureSource::Window { .. } => (800, 600),
        CaptureSource::Region { width, height, .. } => (*width, *height),
    };

    let data = vec![0u8; (width * height * 4) as usize];

    Ok(CaptureFrame {
        data,
        width,
        height,
        timestamp_ms: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64,
    })
}

#[cfg(not(target_os = "windows"))]
pub fn capture_frame(_source: &CaptureSource) -> Result<CaptureFrame, CaptureError> {
    Err(CaptureError::PlatformNotSupported)
}
