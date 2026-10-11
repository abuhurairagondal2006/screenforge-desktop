import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import type { AppSettings } from '@/types';
import { useToastStore } from '@/stores/toastStore';
import { t } from '@/i18n';

export function useSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const loading = useSettingsStore((s) => s.loading);
  const error = useSettingsStore((s) => s.error);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const saveSettings = useSettingsStore((s) => s.saveSettings);
  const resetDefaults = useSettingsStore((s) => s.resetDefaults);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const save = useCallback(async () => {
    try {
      await saveSettings();
      addToast('success', t('settings.saved'));
    } catch {
      addToast('error', 'Failed to save settings');
    }
  }, [saveSettings, addToast]);

  const update = useCallback(
    (patch: Partial<AppSettings>) => {
      updateSettings(patch);
    },
    [updateSettings]
  );

  return {
    settings,
    loading,
    error,
    updateSettings: update,
    saveSettings: save,
    resetDefaults,
  };
}
