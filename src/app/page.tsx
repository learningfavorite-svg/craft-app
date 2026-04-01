'use client';

import { useState, useEffect } from 'react';
import type { AppSettings } from '@/lib/types';
import { getSettings, saveSettings, getDoctors } from '@/lib/database';
import { initializeClient } from '@/lib/ai-service';
import Splash from '@/components/Splash';
import Home from '@/components/Home';
import AIBooking from '@/components/AIBooking';
import Settings from '@/components/Settings';
import LabReport from '@/components/LabReport';

type View = 'splash' | 'home' | 'booking' | 'settings' | 'lab';

export default function App() {
  const [view, setView] = useState<View>('splash');
  const [settings, setSettings] = useState<AppSettings>({
    anthropicApiKey: '',
    model: 'claude-sonnet-4-6',
    language: 'en',
    huggingFaceToken: '',
  });
  const [doctors, setDoctors] = useState(getDoctors());

  useEffect(() => {
    const stored = getSettings();
    setSettings(stored);
    if (stored.anthropicApiKey) {
      initializeClient(stored.anthropicApiKey);
    }
    setDoctors(getDoctors());
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    initializeClient(newSettings.anthropicApiKey);
  };

  return (
    <>
      {view === 'splash' && (
        <Splash
          onGetStarted={() => setView('home')}
          onSignIn={() => setView('home')}
        />
      )}
      {view === 'home' && (
        <Home
          doctors={doctors}
          onStartBooking={() => setView('booking')}
          onOpenSettings={() => setView('settings')}
          onOpenLabReport={() => setView('lab')}
        />
      )}
      {view === 'booking' && (
        <AIBooking
          onBack={() => setView('home')}
          onOpenSettings={() => setView('settings')}
        />
      )}
      {view === 'settings' && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onBack={() => setView('home')}
        />
      )}
      {view === 'lab' && (
        <LabReport
          onBack={() => setView('home')}
          onOpenSettings={() => setView('settings')}
        />
      )}
    </>
  );
}
