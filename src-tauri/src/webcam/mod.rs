use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebcamDevice {
    pub id: String,
    pub name: String,
    pub resolutions: Vec<(u32, u32)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum WebcamOverlayPosition {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
    Custom { x: i32, y: i32 },
}

impl Default for WebcamOverlayPosition {
    fn default() -> Self {
        WebcamOverlayPosition::BottomRight
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum WebcamOverlayShape {
    Circle,
    RoundedRect,
}

impl Default for WebcamOverlayShape {
    fn default() -> Self {
        WebcamOverlayShape::Circle
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebcamConfig {
    pub device_id: Option<String>,
    pub resolution: Option<(u32, u32)>,
    pub position: WebcamOverlayPosition,
    pub shape: WebcamOverlayShape,
    pub opacity: f32,
    pub size_percent: u32,
}

impl Default for WebcamConfig {
    fn default() -> Self {
        WebcamConfig {
            device_id: None,
            resolution: Some((640, 480)),
            position: WebcamOverlayPosition::BottomRight,
            shape: WebcamOverlayShape::Circle,
            opacity: 1.0,
            size_percent: 20,
        }
    }
}

#[cfg(target_os = "windows")]
pub fn list_webcams() -> Vec<WebcamDevice> {
    // On Windows, would use MediaFoundation or DirectShow to enumerate cameras.
    vec![WebcamDevice {
        id: "default-webcam".to_string(),
        name: "Default Webcam".to_string(),
        resolutions: vec![(640, 480), (1280, 720), (1920, 1080)],
    }]
}

#[cfg(not(target_os = "windows"))]
pub fn list_webcams() -> Vec<WebcamDevice> {
    vec![WebcamDevice {
        id: "stub-webcam".to_string(),
        name: "Webcam (stub)".to_string(),
        resolutions: vec![(640, 480), (1280, 720), (1920, 1080)],
    }]
}
