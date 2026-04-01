export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  available: boolean;
  avatar: string;
  avatarColor: string;
  licenseNo?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
  chiefComplaint?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  mrn: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phone: string;
  email: string;
  bloodType: string;
  allergies: Allergy[];
  insuranceId?: string;
}

export interface Allergy {
  drug: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface LabResult {
  id: string;
  testName: string;
  resultValue: string;
  unit: string;
  referenceLow?: number;
  referenceHigh?: number;
  status: 'normal' | 'low' | 'high' | 'critical';
  orderedBy?: string;
  resultDate: string;
  notes?: string;
  entities?: NEREntity[];
}

export interface NEREntity {
  text: string;
  label: string;
  start: number;
  end: number;
}

export interface Medication {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  prescriber: string;
  indication: string;
  status: 'active' | 'discontinued' | 'completed';
}

export interface ClinicalNote {
  id: string;
  noteType: string;
  content: string;
  aiSummary?: string;
  author: string;
  createdAt: string;
  entities?: NEREntity[];
}

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
}

export interface AgentToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
  status: 'calling' | 'done' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: AgentToolCall[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AppSettings {
  anthropicApiKey: string;
  model: string;
  language: 'en' | 'ar';
  huggingFaceToken: string;
}
