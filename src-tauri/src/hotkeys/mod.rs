use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum HotkeyAction {
    StartStopRecording,
    PauseResume,
    Screenshot,
    OpenApp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HotkeyBinding {
    pub action: HotkeyAction,
    pub modifiers: Vec<String>,
    pub key: String,
}

pub fn default_hotkeys() -> Vec<HotkeyBinding> {
    vec![
        HotkeyBinding {
            action: HotkeyAction::StartStopRecording,
            modifiers: vec!["Ctrl".to_string(), "Shift".to_string()],
            key: "R".to_string(),
        },
        HotkeyBinding {
            action: HotkeyAction::PauseResume,
            modifiers: vec!["Ctrl".to_string(), "Shift".to_string()],
            key: "P".to_string(),
        },
        HotkeyBinding {
            action: HotkeyAction::Screenshot,
            modifiers: vec!["Ctrl".to_string(), "Shift".to_string()],
            key: "S".to_string(),
        },
        HotkeyBinding {
            action: HotkeyAction::OpenApp,
            modifiers: vec!["Ctrl".to_string(), "Shift".to_string()],
            key: "O".to_string(),
        },
    ]
}
