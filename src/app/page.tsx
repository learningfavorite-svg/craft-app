'use client';

import { useState, useEffect } from 'react';
import type { AppSettings, Patient, Appointment, LabResult, Medication, ClinicalNote } from '@/lib/types';
import {
  getSettings, saveSettings,
  getDoctors, getAppointments, getPatient, getLabResults, getMedications, getClinicalNotes,
} from '@/lib/database';
import { initializeClient } from '@/lib/ai-service';

import Splash from '@/components/Splash';
import Dashboard from '@/components/Dashboard';
import PatientProfile from '@/components/PatientProfile';
import ClinicalAnalysis from '@/components/ClinicalAnalysis';
import MedicationsView from '@/components/MedicationsView';
import AppointmentsView from '@/components/AppointmentsView';
import AIBooking from '@/components/AIBooking';
import Settings from '@/components/Settings';
import NavBar from '@/components/NavBar';

type View = 'splash' | 'dashboard' | 'appointments' | 'booking' | 'clinical' | 'medications' | 'profile' | 'settings' | 'lab';
type NavView = 'dashboard' | 'appointments' | 'booking' | 'clinical' | 'profile';

const NAV_VIEWS: View[] = ['dashboard', 'appointments', 'booking', 'clinical', 'profile'];

export default function App() {
  const [view, setView] = useState<View>('splash');
  const [settings, setSettings] = useState<AppSettings>({
    anthropicApiKey: '',
    model: 'claude-sonnet-4-6',
    language: 'en',
    huggingFaceToken: '',
  });

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);

  useEffect(() => {
    const stored = getSettings();
    setSettings(stored);
    if (stored.anthropicApiKey) {
      initializeClient(stored.anthropicApiKey);
    }
    setPatient(getPatient());
    setAppointments(getAppointments());
    setLabResults(getLabResults());
    setMedications(getMedications());
    setNotes(getClinicalNotes());
    getDoctors();
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    initializeClient(newSettings.anthropicApiKey);
  };

  const navigate = (target: string) => {
    setView(target as View);
  };

  const criticalCount = labResults.filter(l => l.status === 'critical').length;
  const showNav = NAV_VIEWS.includes(view as NavView);

  if (!patient && view !== 'splash') return null;

  return (
    <>
      {view === 'splash' && (
        <Splash
          onGetStarted={() => setView('dashboard')}
          onSignIn={() => setView('dashboard')}
        />
      )}

      {view === 'dashboard' && patient && (
        <Dashboard
          patient={patient}
          appointments={appointments}
          labResults={labResults}
          medications={medications}
          onNavigate={navigate}
        />
      )}

      {view === 'appointments' && (
        <AppointmentsView
          appointments={appointments}
          onBack={() => setView('dashboard')}
          onBookNew={() => setView('booking')}
        />
      )}

      {view === 'booking' && (
        <AIBooking
          onBack={() => setView('dashboard')}
          onOpenSettings={() => setView('settings')}
        />
      )}

      {view === 'clinical' && patient && (
        <ClinicalAnalysis
          patient={patient}
          labResults={labResults}
          notes={notes}
          onBack={() => setView('dashboard')}
          onOpenBooking={() => setView('booking')}
          hfToken={settings.huggingFaceToken}
        />
      )}

      {view === 'lab' && patient && (
        <ClinicalAnalysis
          patient={patient}
          labResults={labResults}
          notes={notes}
          onBack={() => setView('dashboard')}
          onOpenBooking={() => setView('booking')}
          hfToken={settings.huggingFaceToken}
        />
      )}

      {view === 'medications' && (
        <MedicationsView
          medications={medications}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'profile' && patient && (
        <PatientProfile
          patient={patient}
          medications={medications}
          appointments={appointments}
          labResults={labResults}
          onBack={() => setView('dashboard')}
          onNavigate={navigate}
        />
      )}

      {view === 'settings' && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onBack={() => setView('dashboard')}
        />
      )}

      {showNav && (
        <NavBar
          active={view as NavView}
          onNavigate={(v) => setView(v)}
          alertCount={criticalCount}
        />
      )}
    </>
  );
}
