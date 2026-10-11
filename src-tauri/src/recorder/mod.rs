use serde::{Deserialize, Serialize};

use crate::audio::AudioMode;
use crate::capture::CaptureSource;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "status")]
pub enum RecordingState {
    Idle,
    Countdown { remaining: u32 },
    Recording,
    Paused,
    Stopping,
    Error { message: String },
}

impl Default for RecordingState {
    fn default() -> Self {
        RecordingState::Idle
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecorderState {
    pub state: RecordingState,
    pub start_time: Option<String>,
    pub elapsed_secs: f64,
    pub pause_time: Option<String>,
    pub current_file: Option<String>,
    pub capture_source: Option<CaptureSource>,
    pub audio_mode: AudioMode,
    pub fps: u32,
    pub frames_captured: u64,
    pub file_size_estimate: u64,
}

impl Default for RecorderState {
    fn default() -> Self {
        RecorderState {
            state: RecordingState::Idle,
            start_time: None,
            elapsed_secs: 0.0,
            pause_time: None,
            current_file: None,
            capture_source: None,
            audio_mode: AudioMode::None,
            fps: 30,
            frames_captured: 0,
            file_size_estimate: 0,
        }
    }
}

impl RecorderState {
    pub fn start(
        &mut self,
        source: CaptureSource,
        audio_mode: AudioMode,
        fps: u32,
        file_path: String,
    ) -> Result<(), String> {
        match &self.state {
            RecordingState::Idle | RecordingState::Error { .. } => {
                self.state = RecordingState::Recording;
                self.start_time = Some(chrono::Local::now().to_rfc3339());
                self.elapsed_secs = 0.0;
                self.pause_time = None;
                self.current_file = Some(file_path);
                self.capture_source = Some(source);
                self.audio_mode = audio_mode;
                self.fps = fps;
                self.frames_captured = 0;
                self.file_size_estimate = 0;
                Ok(())
            }
            _ => Err(format!(
                "Cannot start recording: currently in {:?} state",
                self.state
            )),
        }
    }

    pub fn pause(&mut self) -> Result<(), String> {
        match &self.state {
            RecordingState::Recording => {
                self.state = RecordingState::Paused;
                self.pause_time = Some(chrono::Local::now().to_rfc3339());
                Ok(())
            }
            _ => Err(format!(
                "Cannot pause: currently in {:?} state",
                self.state
            )),
        }
    }

    pub fn resume(&mut self) -> Result<(), String> {
        match &self.state {
            RecordingState::Paused => {
                self.state = RecordingState::Recording;
                self.pause_time = None;
                Ok(())
            }
            _ => Err(format!(
                "Cannot resume: currently in {:?} state",
                self.state
            )),
        }
    }

    pub fn stop(&mut self) -> Result<String, String> {
        match &self.state {
            RecordingState::Recording | RecordingState::Paused => {
                self.state = RecordingState::Stopping;
                let file = self.current_file.clone().unwrap_or_default();

                // Calculate elapsed time
                if let Some(start) = &self.start_time {
                    if let Ok(start_dt) = chrono::DateTime::parse_from_rfc3339(start) {
                        let now = chrono::Local::now();
                        self.elapsed_secs =
                            (now - start_dt.with_timezone(&chrono::Local)).num_milliseconds()
                                as f64
                                / 1000.0;
                    }
                }

                // Transition to idle
                let elapsed = self.elapsed_secs;
                self.reset();
                self.elapsed_secs = elapsed;

                Ok(file)
            }
            _ => Err(format!(
                "Cannot stop: currently in {:?} state",
                self.state
            )),
        }
    }

    pub fn set_error(&mut self, message: String) {
        self.state = RecordingState::Error { message };
    }

    fn reset(&mut self) {
        self.state = RecordingState::Idle;
        self.start_time = None;
        self.pause_time = None;
        self.current_file = None;
        self.capture_source = None;
        self.audio_mode = AudioMode::None;
        self.frames_captured = 0;
        self.file_size_estimate = 0;
    }
}
