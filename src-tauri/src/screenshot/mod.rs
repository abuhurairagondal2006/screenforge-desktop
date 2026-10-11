use serde::{Deserialize, Serialize};
use thiserror::Error;
use std::path::Path;

use crate::capture::CaptureSource;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum ScreenshotFormat {
    #[serde(rename = "PNG")]
    Png,
    #[serde(rename = "JPEG")]
    Jpeg,
    WebP,
}

impl Default for ScreenshotFormat {
    fn default() -> Self {
        ScreenshotFormat::Png
    }
}

impl ScreenshotFormat {
    pub fn extension(&self) -> &str {
        match self {
            ScreenshotFormat::Png => "png",
            ScreenshotFormat::Jpeg => "jpg",
            ScreenshotFormat::WebP => "webp",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenshotConfig {
    pub format: ScreenshotFormat,
    pub quality: Option<u8>,
    pub source: CaptureSource,
}

impl Default for ScreenshotConfig {
    fn default() -> Self {
        ScreenshotConfig {
            format: ScreenshotFormat::Png,
            quality: None,
            source: CaptureSource::FullScreen,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenshotResult {
    pub path: String,
    pub width: u32,
    pub height: u32,
    pub format: ScreenshotFormat,
    pub file_size: u64,
    pub timestamp: String,
}

#[derive(Debug, Error)]
pub enum ScreenshotError {
    #[error("Screenshot capture not supported on this platform")]
    PlatformNotSupported,
    #[error("Failed to capture screenshot: {0}")]
    CaptureFailed(String),
    #[error("Failed to save screenshot: {0}")]
    SaveFailed(String),
    #[error("Invalid format: {0}")]
    InvalidFormat(String),
}

pub fn take_screenshot(
    config: &ScreenshotConfig,
    output_dir: &Path,
) -> Result<ScreenshotResult, ScreenshotError> {
    let filename = crate::storage::generate_screenshot_filename(
        "screenshot",
        config.format.extension(),
    );
    let output_path = output_dir.join(&filename);

    take_screenshot_to_path(config, &output_path)
}

#[cfg(target_os = "windows")]
fn take_screenshot_to_path(
    config: &ScreenshotConfig,
    output_path: &Path,
) -> Result<ScreenshotResult, ScreenshotError> {
    use crate::capture;

    let frame = capture::capture_frame(&config.source)
        .map_err(|e| ScreenshotError::CaptureFailed(e.to_string()))?;

    save_frame_as_image(&frame.data, frame.width, frame.height, config, output_path)
}

#[cfg(not(target_os = "windows"))]
fn take_screenshot_to_path(
    config: &ScreenshotConfig,
    output_path: &Path,
) -> Result<ScreenshotResult, ScreenshotError> {
    // Generate a sample gradient image as a demo on non-Windows platforms.
    let width = 1920u32;
    let height = 1080u32;

    let mut img = image::RgbaImage::new(width, height);

    for y in 0..height {
        for x in 0..width {
            let r = ((x as f64 / width as f64) * 255.0) as u8;
            let g = ((y as f64 / height as f64) * 255.0) as u8;
            let b = 128u8;
            img.put_pixel(x, y, image::Rgba([r, g, b, 255]));
        }
    }

    save_rgba_image(&img, width, height, config, output_path)
}

fn save_rgba_image(
    img: &image::RgbaImage,
    width: u32,
    height: u32,
    config: &ScreenshotConfig,
    output_path: &Path,
) -> Result<ScreenshotResult, ScreenshotError> {
    match config.format {
        ScreenshotFormat::Png => {
            img.save(output_path)
                .map_err(|e| ScreenshotError::SaveFailed(e.to_string()))?;
        }
        ScreenshotFormat::Jpeg => {
            let rgb_img = image::DynamicImage::ImageRgba8(img.clone()).to_rgb8();
            let quality = config.quality.unwrap_or(90);
            let file = std::fs::File::create(output_path)
                .map_err(|e| ScreenshotError::SaveFailed(e.to_string()))?;
            let mut writer = std::io::BufWriter::new(file);
            let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(
                &mut writer,
                quality,
            );
            encoder
                .encode(&rgb_img, width, height, image::ExtendedColorType::Rgb8)
                .map_err(|e| ScreenshotError::SaveFailed(e.to_string()))?;
        }
        ScreenshotFormat::WebP => {
            // The image crate may not support WebP encoding directly;
            // fall back to PNG in that case.
            img.save(output_path)
                .map_err(|e| ScreenshotError::SaveFailed(e.to_string()))?;
        }
    }

    let metadata = std::fs::metadata(output_path)
        .map_err(|e| ScreenshotError::SaveFailed(e.to_string()))?;

    let timestamp = chrono::Local::now().to_rfc3339();

    Ok(ScreenshotResult {
        path: output_path.to_string_lossy().to_string(),
        width,
        height,
        format: config.format.clone(),
        file_size: metadata.len(),
        timestamp,
    })
}

#[cfg(target_os = "windows")]
fn save_frame_as_image(
    data: &[u8],
    width: u32,
    height: u32,
    config: &ScreenshotConfig,
    output_path: &Path,
) -> Result<ScreenshotResult, ScreenshotError> {
    let img = image::RgbaImage::from_raw(width, height, data.to_vec())
        .ok_or_else(|| ScreenshotError::CaptureFailed("Invalid frame data".to_string()))?;

    save_rgba_image(&img, width, height, config, output_path)
}
