import { useState, useEffect } from 'react';
import { fetchSettings } from './api';

const DEFAULT_SETTINGS = {
  accentColor: '#c0a060',
  animationsEnabled: true,
  smokeEnabled: true,
  siteName: 'VALIO',
  heroTagline: 'Wear the Darkness',
};

let cachedSettings = null;
let fetchPromise = null;

export function useSettings() {
  const [settings, setSettings] = useState(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchSettings();
    }

    fetchPromise
      .then(data => {
        const merged = { ...DEFAULT_SETTINGS, ...data };
        cachedSettings = merged;
        setSettings(merged);
      })
      .catch(() => {
        setSettings(DEFAULT_SETTINGS);
      })
      .finally(() => {
        setLoading(false);
        fetchPromise = null;
      });
  }, []);

  // Apply accent color to CSS variable
  useEffect(() => {
    if (settings.accentColor && typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent', settings.accentColor);
      // Compute dim variant
      document.documentElement.style.setProperty(
        '--accent-dim',
        settings.accentColor + '40'
      );
    }
  }, [settings.accentColor]);

  return { settings, loading };
}
