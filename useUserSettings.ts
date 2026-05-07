import { useState, useEffect } from 'react';
import { AlertSettings } from './useAlerts';

const SETTINGS_KEY = 'ecowatt-settings';

export const useUserSettings = () => {
  const [settings, setSettings] = useState<AlertSettings>({
    deficitThreshold: 20,
    lowRenewableThreshold: 50,
    enableAlerts: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AlertSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return { settings, updateSettings };
};
