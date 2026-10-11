use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformInfo {
    pub os: String,
    pub arch: String,
    pub has_gpu: bool,
    pub gpu_name: Option<String>,
    pub capture_api: String,
    pub supports_hw_encoding: bool,
}

pub fn get_platform_info() -> PlatformInfo {
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();

    let (capture_api, supports_hw_encoding, has_gpu, gpu_name) = get_platform_capabilities();

    PlatformInfo {
        os,
        arch,
        has_gpu,
        gpu_name,
        capture_api,
        supports_hw_encoding,
    }
}

#[cfg(target_os = "windows")]
fn get_platform_capabilities() -> (String, bool, bool, Option<String>) {
    // On Windows, would query DXGI adapters for GPU info.
    (
        "DXGI Desktop Duplication".to_string(),
        true,
        true,
        Some("Unknown GPU".to_string()),
    )
}

#[cfg(target_os = "macos")]
fn get_platform_capabilities() -> (String, bool, bool, Option<String>) {
    (
        "ScreenCaptureKit".to_string(),
        false,
        true,
        Some("Apple GPU".to_string()),
    )
}

#[cfg(target_os = "linux")]
fn get_platform_capabilities() -> (String, bool, bool, Option<String>) {
    (
        "PipeWire/X11".to_string(),
        false,
        false,
        None,
    )
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
fn get_platform_capabilities() -> (String, bool, bool, Option<String>) {
    (
        "Unsupported".to_string(),
        false,
        false,
        None,
    )
}

pub fn is_windows() -> bool {
    cfg!(target_os = "windows")
}
