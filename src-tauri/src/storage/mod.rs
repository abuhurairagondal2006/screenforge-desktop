use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordingInfo {
    pub id: String,
    pub filename: String,
    pub path: String,
    pub date: String,
    pub duration_secs: f64,
    pub resolution: Option<String>,
    pub fps: Option<u32>,
    pub file_size: u64,
    pub format: String,
    pub thumbnail_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenshotInfo {
    pub id: String,
    pub filename: String,
    pub path: String,
    pub date: String,
    pub width: u32,
    pub height: u32,
    pub file_size: u64,
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageStats {
    pub total_bytes: u64,
    pub free_bytes: u64,
    pub recordings_count: usize,
    pub screenshots_count: usize,
    pub recordings_size: u64,
    pub screenshots_size: u64,
}

pub fn get_recordings_dir() -> PathBuf {
    dirs_next::video_dir()
        .unwrap_or_else(|| dirs_next::home_dir().unwrap_or_else(|| PathBuf::from(".")))
        .join("ScreenForge")
        .join("Recordings")
}

pub fn get_screenshots_dir() -> PathBuf {
    dirs_next::picture_dir()
        .unwrap_or_else(|| dirs_next::home_dir().unwrap_or_else(|| PathBuf::from(".")))
        .join("ScreenForge")
        .join("Screenshots")
}

pub fn get_temp_dir() -> PathBuf {
    std::env::temp_dir().join("ScreenForge")
}

pub fn generate_recording_filename(prefix: &str, format: &str) -> String {
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    format!("{}_{}.{}", prefix, timestamp, format)
}

pub fn generate_screenshot_filename(prefix: &str, format: &str) -> String {
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S_%3f");
    format!("{}_{}.{}", prefix, timestamp, format)
}

pub fn list_recordings(dir: &Path) -> Vec<RecordingInfo> {
    let video_extensions = ["mp4", "mkv", "webm", "avi", "mov"];
    list_files_with_extensions(dir, &video_extensions)
        .into_iter()
        .map(|(path, metadata)| {
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
            let modified = metadata
                .modified()
                .ok()
                .and_then(|t| {
                    let datetime: chrono::DateTime<chrono::Local> = t.into();
                    Some(datetime.to_rfc3339())
                })
                .unwrap_or_default();

            RecordingInfo {
                id: stable_id(&path),
                filename,
                path: path.to_string_lossy().to_string(),
                date: modified,
                duration_secs: 0.0,
                resolution: None,
                fps: None,
                file_size: metadata.len(),
                format: ext,
                thumbnail_path: None,
            }
        })
        .collect()
}

pub fn list_screenshots(dir: &Path) -> Vec<ScreenshotInfo> {
    let image_extensions = ["png", "jpg", "jpeg", "webp", "bmp"];
    list_files_with_extensions(dir, &image_extensions)
        .into_iter()
        .filter_map(|(path, metadata)| {
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
            let modified = metadata
                .modified()
                .ok()
                .and_then(|t| {
                    let datetime: chrono::DateTime<chrono::Local> = t.into();
                    Some(datetime.to_rfc3339())
                })
                .unwrap_or_default();

            // Try to read image dimensions
            let (width, height) = image::image_dimensions(&path)
                .unwrap_or((0, 0));

            Some(ScreenshotInfo {
                id: stable_id(&path),
                filename,
                path: path.to_string_lossy().to_string(),
                date: modified,
                width,
                height,
                file_size: metadata.len(),
                format: ext,
            })
        })
        .collect()
}

pub fn get_storage_stats(recordings_dir: &Path, screenshots_dir: &Path) -> StorageStats {
    let recordings = list_recordings(recordings_dir);
    let screenshots = list_screenshots(screenshots_dir);

    let recordings_size: u64 = recordings.iter().map(|r| r.file_size).sum();
    let screenshots_size: u64 = screenshots.iter().map(|s| s.file_size).sum();

    // Try to get disk space info from the recordings directory
    let (total_bytes, free_bytes) = get_disk_space(recordings_dir);

    StorageStats {
        total_bytes,
        free_bytes,
        recordings_count: recordings.len(),
        screenshots_count: screenshots.len(),
        recordings_size,
        screenshots_size,
    }
}

pub fn ensure_directories(recordings: &Path, screenshots: &Path, temp: &Path) {
    let _ = std::fs::create_dir_all(recordings);
    let _ = std::fs::create_dir_all(screenshots);
    let _ = std::fs::create_dir_all(temp);
}

fn list_files_with_extensions(
    dir: &Path,
    extensions: &[&str],
) -> Vec<(PathBuf, std::fs::Metadata)> {
    let mut results = Vec::new();

    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return results,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        if let Some(ext) = path.extension() {
            let ext_lower = ext.to_string_lossy().to_lowercase();
            if extensions.contains(&ext_lower.as_str()) {
                if let Ok(metadata) = entry.metadata() {
                    results.push((path, metadata));
                }
            }
        }
    }

    // Sort by modification time, most recent first
    results.sort_by(|a, b| {
        let time_a = a.1.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH);
        let time_b = b.1.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH);
        time_b.cmp(&time_a)
    });

    results
}

pub fn stable_id(path: &Path) -> String {
    let mut hasher = DefaultHasher::new();
    path.to_string_lossy().as_ref().hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

fn get_disk_space(_path: &Path) -> (u64, u64) {
    // Platform-specific disk space detection would go here.
    // For now, return zeros to indicate unknown.
    (0, 0)
}
