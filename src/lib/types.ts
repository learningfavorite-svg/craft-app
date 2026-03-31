export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  available: boolean;
  avatar: string;
  avatarColor: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  slots?: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AppSettings {
  anthropicApiKey: string;
  model: string;
  language: 'en' | 'ar';
}
