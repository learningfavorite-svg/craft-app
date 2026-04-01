import type { AppSettings, Doctor, Appointment } from './types';

export const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: 'doc-001',
    name: 'Dr. Reem Al-Faraj',
    specialty: 'Cardiologist',
    hospital: 'HMG Hospital Riyadh',
    rating: 4.9,
    available: true,
    avatar: 'RF',
    avatarColor: '#2D7DD2',
  },
  {
    id: 'doc-002',
    name: 'Dr. Khalid Al-Otaibi',
    specialty: 'Neurologist',
    hospital: 'HMG Hospital Jeddah',
    rating: 4.8,
    available: true,
    avatar: 'KO',
    avatarColor: '#0F9B8E',
  },
  {
    id: 'doc-003',
    name: 'Dr. Noura Al-Qahtani',
    specialty: 'Orthopedic Surgeon',
    hospital: 'HMG Hospital Riyadh',
    rating: 4.7,
    available: false,
    avatar: 'NQ',
    avatarColor: '#C9954A',
  },
  {
    id: 'doc-004',
    name: 'Dr. Faisal Al-Harbi',
    specialty: 'Ophthalmologist',
    hospital: 'HMG Hospital Dammam',
    rating: 4.9,
    available: true,
    avatar: 'FH',
    avatarColor: '#1A3A6B',
  },
  {
    id: 'doc-005',
    name: 'Dr. Samar Al-Zahrani',
    specialty: 'Dermatologist',
    hospital: 'HMG Hospital Jeddah',
    rating: 4.6,
    available: true,
    avatar: 'SZ',
    avatarColor: '#E8335A',
  },
  {
    id: 'doc-006',
    name: 'Dr. Abdulrahman Al-Shammari',
    specialty: 'Gastroenterologist',
    hospital: 'HMG Hospital Riyadh',
    rating: 4.8,
    available: true,
    avatar: 'AS',
    avatarColor: '#0F9B8E',
  },
];

const KEYS = {
  settings: 'hmg_settings',
  doctors: 'hmg_doctors',
  appointments: 'hmg_appointments',
};

const DEFAULT_SETTINGS: AppSettings = {
  anthropicApiKey: '',
  model: 'claude-sonnet-4-6',
  language: 'en',
  huggingFaceToken: '',
};

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveDoctors(doctors: Doctor[]): void {
  localStorage.setItem(KEYS.doctors, JSON.stringify(doctors));
}

export function getDoctors(): Doctor[] {
  try {
    const raw = localStorage.getItem(KEYS.doctors);
    if (!raw) return SAMPLE_DOCTORS;
    return JSON.parse(raw);
  } catch {
    return SAMPLE_DOCTORS;
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  localStorage.setItem(KEYS.appointments, JSON.stringify(appointments));
}

export function getAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(KEYS.appointments);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addAppointment(appointment: Appointment): void {
  const existing = getAppointments();
  saveAppointments([...existing, appointment]);
}
