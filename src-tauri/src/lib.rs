pub mod audio;
pub mod capture;
pub mod commands;
pub mod encoder;
pub mod hotkeys;
pub mod platform;
pub mod recorder;
pub mod screenshot;
pub mod security;
pub mod settings;
pub mod storage;
pub mod webcam;

use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use recorder::RecorderState;
use settings::AppSettings;

pub struct AppState {
    pub settings: Arc<Mutex<AppSettings>>,
    pub recorder_state: Arc<Mutex<RecorderState>>,
    pub recordings_dir: PathBuf,
    pub screenshots_dir: PathBuf,
}

pub fn run() {
    env_logger::init();

    let settings = settings::load_settings();

    let recordings_dir = PathBuf::from(&settings.storage.recordings_dir);
    let screenshots_dir = PathBuf::from(&settings.storage.screenshots_dir);
    let temp_dir = PathBuf::from(&settings.storage.temp_dir);

    storage::ensure_directories(&recordings_dir, &screenshots_dir, &temp_dir);

    let state = AppState {
        settings: Arc::new(Mutex::new(settings)),
        recorder_state: Arc::new(Mutex::new(RecorderState::default())),
        recordings_dir,
        screenshots_dir,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::get_platform_info,
            commands::get_monitors,
            commands::get_audio_devices,
            commands::get_webcams,
            commands::get_hardware_encoders,
            commands::get_settings,
            commands::save_settings,
            commands::get_recorder_state,
            commands::start_recording,
            commands::pause_recording,
            commands::resume_recording,
            commands::stop_recording,
            commands::take_screenshot,
            commands::list_recordings,
            commands::list_screenshots,
            commands::get_storage_stats,
            commands::delete_recording,
            commands::delete_screenshot,
            commands::open_file_location,
            commands::get_hotkeys,
            commands::save_hotkeys,
            commands::get_quality_presets,
            commands::rename_file,
            commands::get_default_dirs,
        ])
        .run(tauri::generate_context!())
        .expect("error running ScreenForge");
}
