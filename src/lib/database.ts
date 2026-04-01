import type { AppSettings, Doctor, Appointment, Patient, LabResult, Medication, ClinicalNote } from './types';

export const SAMPLE_DOCTORS: Doctor[] = [
  { id: 'doc-001', name: 'Dr. Reem Al-Faraj', specialty: 'Cardiologist', hospital: 'HMG Hospital Riyadh', rating: 4.9, available: true, avatar: 'RF', avatarColor: '#2D7DD2', licenseNo: 'SA-MED-001' },
  { id: 'doc-002', name: 'Dr. Khalid Al-Otaibi', specialty: 'Neurologist', hospital: 'HMG Hospital Jeddah', rating: 4.8, available: true, avatar: 'KO', avatarColor: '#0F9B8E', licenseNo: 'SA-MED-002' },
  { id: 'doc-003', name: 'Dr. Noura Al-Qahtani', specialty: 'Orthopedic Surgeon', hospital: 'HMG Hospital Riyadh', rating: 4.7, available: false, avatar: 'NQ', avatarColor: '#C9954A', licenseNo: 'SA-MED-003' },
  { id: 'doc-004', name: 'Dr. Faisal Al-Harbi', specialty: 'Ophthalmologist', hospital: 'HMG Hospital Dammam', rating: 4.9, available: true, avatar: 'FH', avatarColor: '#1A3A6B', licenseNo: 'SA-MED-004' },
  { id: 'doc-005', name: 'Dr. Samar Al-Zahrani', specialty: 'Dermatologist', hospital: 'HMG Hospital Jeddah', rating: 4.6, available: true, avatar: 'SZ', avatarColor: '#E8335A', licenseNo: 'SA-MED-005' },
  { id: 'doc-006', name: 'Dr. Abdulrahman Al-Shammari', specialty: 'Gastroenterologist', hospital: 'HMG Hospital Riyadh', rating: 4.8, available: true, avatar: 'AS', avatarColor: '#0F9B8E', licenseNo: 'SA-MED-006' },
];

export const DEMO_PATIENT: Patient = {
  id: 'pat-001',
  mrn: 'HMG-001',
  fullName: 'Ahmed Al-Rashid',
  dateOfBirth: '1983-06-15',
  gender: 'Male',
  nationality: 'Saudi',
  phone: '+966-50-000-0001',
  email: 'ahmed.alrashid@hmg.com',
  bloodType: 'O+',
  allergies: [{ drug: 'Penicillin', reaction: 'Rash', severity: 'moderate' }],
  insuranceId: 'INS-SA-220847',
};

export const SAMPLE_LAB_RESULTS: LabResult[] = [
  { id: 'lab-001', testName: 'HbA1c', resultValue: '7.2', unit: '%', referenceLow: 4.0, referenceHigh: 5.6, status: 'high', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-20', notes: 'Elevated — monitor glycemic control' },
  { id: 'lab-002', testName: 'Fasting Glucose', resultValue: '126', unit: 'mg/dL', referenceLow: 70, referenceHigh: 99, status: 'high', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-20' },
  { id: 'lab-003', testName: 'Total Cholesterol', resultValue: '198', unit: 'mg/dL', referenceLow: 0, referenceHigh: 200, status: 'normal', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-20' },
  { id: 'lab-004', testName: 'Hemoglobin', resultValue: '13.1', unit: 'g/dL', referenceLow: 13.5, referenceHigh: 17.5, status: 'low', orderedBy: 'Dr. Khalid Al-Otaibi', resultDate: '2025-03-15' },
  { id: 'lab-005', testName: 'eGFR', resultValue: '72', unit: 'mL/min/1.73m²', referenceLow: 60, referenceHigh: 120, status: 'normal', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-20' },
  { id: 'lab-006', testName: 'Troponin I', resultValue: '0.04', unit: 'ng/mL', referenceLow: 0, referenceHigh: 0.04, status: 'critical', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-28', notes: 'Critical — urgent cardiology review required' },
];

export const SAMPLE_MEDICATIONS: Medication[] = [
  { id: 'med-001', drugName: 'Metformin', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', startDate: '2024-06-01', prescriber: 'Dr. Reem Al-Faraj', indication: 'Type 2 Diabetes', status: 'active' },
  { id: 'med-002', drugName: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at bedtime', route: 'Oral', startDate: '2024-06-01', prescriber: 'Dr. Reem Al-Faraj', indication: 'Dyslipidemia', status: 'active' },
  { id: 'med-003', drugName: 'Ramipril', dosage: '5mg', frequency: 'Once daily', route: 'Oral', startDate: '2024-09-15', prescriber: 'Dr. Reem Al-Faraj', indication: 'Hypertension', status: 'active' },
  { id: 'med-004', drugName: 'Aspirin', dosage: '81mg', frequency: 'Once daily', route: 'Oral', startDate: '2024-06-01', prescriber: 'Dr. Reem Al-Faraj', indication: 'Cardiovascular prophylaxis', status: 'active' },
  { id: 'med-005', drugName: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', route: 'Oral', startDate: '2025-01-10', endDate: '2025-01-20', prescriber: 'Dr. Samar Al-Zahrani', indication: 'Skin infection', status: 'completed' },
];

export const SAMPLE_APPOINTMENTS: Appointment[] = [
  { id: 'apt-001', doctorId: 'doc-001', doctorName: 'Dr. Reem Al-Faraj', specialty: 'Cardiologist', date: '2025-04-08', time: '10:00 AM', status: 'upcoming', chiefComplaint: 'Follow-up: Hypertension & HbA1c review' },
  { id: 'apt-002', doctorId: 'doc-002', doctorName: 'Dr. Khalid Al-Otaibi', specialty: 'Neurologist', date: '2025-04-15', time: '02:30 PM', status: 'upcoming', chiefComplaint: 'Headache evaluation' },
  { id: 'apt-003', doctorId: 'doc-001', doctorName: 'Dr. Reem Al-Faraj', specialty: 'Cardiologist', date: '2025-03-10', time: '11:00 AM', status: 'completed', notes: 'BP controlled 130/80. Continue Ramipril. Labs ordered.' },
  { id: 'apt-004', doctorId: 'doc-005', doctorName: 'Dr. Samar Al-Zahrani', specialty: 'Dermatologist', date: '2025-01-08', time: '09:00 AM', status: 'completed', notes: 'Eczema — topical steroids prescribed.' },
];

export const SAMPLE_NOTES: ClinicalNote[] = [
  {
    id: 'note-001',
    noteType: 'SOAP',
    content: 'S: Patient reports chest tightness on exertion for 3 days. No radiation. O: HR 82 RR BP 142/88. A: Probable angina vs GERD. P: ECG, Troponin, cardiology consult.',
    aiSummary: 'Chest tightness on exertion. Vitals stable with mild HTN. Cardiac workup ordered.',
    author: 'Dr. Reem Al-Faraj',
    createdAt: '2025-03-28T09:30:00Z',
  },
  {
    id: 'note-002',
    noteType: 'Progress',
    content: 'Patient doing well on Metformin + Atorvastatin. HbA1c improved from 8.1 to 7.2. Compliance good. Weight stable at 84kg.',
    aiSummary: 'Metabolic improvement noted. HbA1c down to 7.2%. Medications well tolerated.',
    author: 'Dr. Reem Al-Faraj',
    createdAt: '2025-03-10T11:15:00Z',
  },
];

const KEYS = {
  settings: 'hmg_settings',
  doctors: 'hmg_doctors',
  appointments: 'hmg_appointments',
  patient: 'hmg_patient',
  labResults: 'hmg_lab_results',
  medications: 'hmg_medications',
  notes: 'hmg_notes',
};

const DEFAULT_SETTINGS: AppSettings = {
  anthropicApiKey: '',
  model: 'claude-sonnet-4-6',
  language: 'en',
  huggingFaceToken: '',
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function getSettings(): AppSettings {
  if (!isBrowser()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveDoctors(doctors: Doctor[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.doctors, JSON.stringify(doctors));
}

export function getDoctors(): Doctor[] {
  if (!isBrowser()) return SAMPLE_DOCTORS;
  try {
    const raw = localStorage.getItem(KEYS.doctors);
    if (!raw) return SAMPLE_DOCTORS;
    return JSON.parse(raw);
  } catch {
    return SAMPLE_DOCTORS;
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.appointments, JSON.stringify(appointments));
}

export function getAppointments(): Appointment[] {
  if (!isBrowser()) return SAMPLE_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(KEYS.appointments);
    if (!raw) return SAMPLE_APPOINTMENTS;
    return JSON.parse(raw);
  } catch {
    return SAMPLE_APPOINTMENTS;
  }
}

export function addAppointment(appointment: Appointment): void {
  const existing = getAppointments();
  saveAppointments([...existing, appointment]);
}

export function getPatient(): Patient {
  if (!isBrowser()) return DEMO_PATIENT;
  try {
    const raw = localStorage.getItem(KEYS.patient);
    if (!raw) return DEMO_PATIENT;
    return JSON.parse(raw);
  } catch {
    return DEMO_PATIENT;
  }
}

export function savePatient(patient: Patient): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.patient, JSON.stringify(patient));
}

export function getLabResults(): LabResult[] {
  if (!isBrowser()) return SAMPLE_LAB_RESULTS;
  try {
    const raw = localStorage.getItem(KEYS.labResults);
    if (!raw) return SAMPLE_LAB_RESULTS;
    return JSON.parse(raw);
  } catch {
    return SAMPLE_LAB_RESULTS;
  }
}

export function saveLabResults(results: LabResult[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.labResults, JSON.stringify(results));
}

export function getMedications(): Medication[] {
  if (!isBrowser()) return SAMPLE_MEDICATIONS;
  try {
    const raw = localStorage.getItem(KEYS.medications);
    if (!raw) return SAMPLE_MEDICATIONS;
    return JSON.parse(raw);
  } catch {
    return SAMPLE_MEDICATIONS;
  }
}

export function saveMedications(meds: Medication[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.medications, JSON.stringify(meds));
}

export function getClinicalNotes(): ClinicalNote[] {
  if (!isBrowser()) return SAMPLE_NOTES;
  try {
    const raw = localStorage.getItem(KEYS.notes);
    if (!raw) return SAMPLE_NOTES;
    return JSON.parse(raw);
  } catch {
    return SAMPLE_NOTES;
  }
}
