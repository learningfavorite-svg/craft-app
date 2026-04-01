import { getDoctors, getAppointments, addAppointment, saveAppointments } from './database';
import { parseSymptoms, analyzeLabReport as hfAnalyzeLabReport } from './hf-service';
import type { Appointment } from './types';
import { v4 as uuidv4 } from 'uuid';

// ─── Tool input types ─────────────────────────────────────────────────────────

interface SearchDoctorsInput {
  specialty?: string;
  hospital?: string;
  available_only?: boolean;
  min_rating?: number;
}

interface GetAvailabilityInput {
  doctor_id: string;
}

interface BookAppointmentInput {
  doctor_id: string;
  time_slot: string;
  notes?: string;
}

interface GetHistoryInput {
  status?: 'upcoming' | 'completed' | 'cancelled' | 'all';
}

interface CancelAppointmentInput {
  appointment_id: string;
}

interface AnalyzeSymptomsInput {
  symptoms: string;
}

interface AnalyzeLabInput {
  report_text: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSlots(): string[] {
  return [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:30 AM', '02:00 PM', '02:30 PM', '03:30 PM', '04:00 PM',
  ];
}

function tomorrowDate(): string {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0];
}

// Rough symptom → specialty mapping used as hint for Claude
const SYMPTOM_SPECIALTY_HINTS: Array<{ keywords: string[]; specialty: string }> = [
  { keywords: ['chest', 'heart', 'palpitation', 'cardiac', 'blood pressure'], specialty: 'Cardiologist' },
  { keywords: ['headache', 'migraine', 'seizure', 'stroke', 'neuro', 'brain', 'memory'], specialty: 'Neurologist' },
  { keywords: ['bone', 'joint', 'back', 'spine', 'knee', 'shoulder', 'fracture'], specialty: 'Orthopedic Surgeon' },
  { keywords: ['eye', 'vision', 'sight', 'retina', 'glaucoma'], specialty: 'Ophthalmologist' },
  { keywords: ['skin', 'rash', 'acne', 'eczema', 'derma'], specialty: 'Dermatologist' },
  { keywords: ['stomach', 'digestion', 'bowel', 'colon', 'liver', 'gastro'], specialty: 'Gastroenterologist' },
];

function suggestSpecialty(symptoms: string): string | null {
  const lower = symptoms.toLowerCase();
  for (const { keywords, specialty } of SYMPTOM_SPECIALTY_HINTS) {
    if (keywords.some((k) => lower.includes(k))) return specialty;
  }
  return null;
}

// ─── Main executor ────────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  hfToken: string
): Promise<unknown> {
  switch (name) {
    // ── search_doctors ───────────────────────────────────────────────────────
    case 'search_doctors': {
      const inp = input as unknown as SearchDoctorsInput;
      let doctors = getDoctors();

      if (inp.specialty) {
        const spec = inp.specialty.toLowerCase();
        doctors = doctors.filter((d) => d.specialty.toLowerCase().includes(spec));
      }
      if (inp.hospital) {
        const hosp = inp.hospital.toLowerCase();
        doctors = doctors.filter((d) => d.hospital.toLowerCase().includes(hosp));
      }
      if (inp.available_only) {
        doctors = doctors.filter((d) => d.available);
      }
      if (inp.min_rating !== undefined) {
        doctors = doctors.filter((d) => d.rating >= (inp.min_rating ?? 0));
      }

      if (doctors.length === 0) {
        return { found: 0, message: 'No doctors found matching the criteria. Try a broader search.' };
      }

      return {
        found: doctors.length,
        doctors: doctors.map((d) => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty,
          hospital: d.hospital,
          rating: d.rating,
          available: d.available,
          avatar: d.avatar,
        })),
      };
    }

    // ── get_availability ─────────────────────────────────────────────────────
    case 'get_availability': {
      const inp = input as unknown as GetAvailabilityInput;
      const doctor = getDoctors().find((d) => d.id === inp.doctor_id);
      if (!doctor) return { error: `Doctor ${inp.doctor_id} not found` };
      if (!doctor.available) {
        return { available: false, message: `${doctor.name} is currently unavailable. Search for another doctor.` };
      }
      return {
        doctor_id: inp.doctor_id,
        doctor_name: doctor.name,
        date: tomorrowDate(),
        available_slots: generateSlots(),
      };
    }

    // ── book_appointment ─────────────────────────────────────────────────────
    case 'book_appointment': {
      const inp = input as unknown as BookAppointmentInput;
      const doctor = getDoctors().find((d) => d.id === inp.doctor_id);
      if (!doctor) return { error: `Doctor ${inp.doctor_id} not found` };
      if (!doctor.available) return { error: `${doctor.name} is not available for booking` };

      const appointment: Appointment = {
        id: uuidv4(),
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date: tomorrowDate(),
        time: inp.time_slot,
        status: 'upcoming',
        notes: inp.notes,
      };
      addAppointment(appointment);

      return {
        success: true,
        appointment_id: appointment.id,
        doctor_name: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        date: appointment.date,
        time: inp.time_slot,
        message: `Appointment confirmed with ${doctor.name} at ${inp.time_slot} on ${appointment.date}`,
      };
    }

    // ── get_appointment_history ──────────────────────────────────────────────
    case 'get_appointment_history': {
      const inp = input as unknown as GetHistoryInput;
      const all = getAppointments();
      const filtered =
        !inp.status || inp.status === 'all' ? all : all.filter((a) => a.status === inp.status);
      return {
        count: filtered.length,
        appointments: filtered.map((a) => ({
          id: a.id,
          doctor: a.doctorName,
          specialty: a.specialty,
          date: a.date,
          time: a.time,
          status: a.status,
          notes: a.notes,
        })),
      };
    }

    // ── cancel_appointment ───────────────────────────────────────────────────
    case 'cancel_appointment': {
      const inp = input as unknown as CancelAppointmentInput;
      const all = getAppointments();
      const idx = all.findIndex((a) => a.id === inp.appointment_id);
      if (idx === -1) return { error: `Appointment ${inp.appointment_id} not found` };
      all[idx] = { ...all[idx], status: 'cancelled' };
      saveAppointments(all);
      return { success: true, message: `Appointment cancelled: ${all[idx].doctorName} on ${all[idx].date}` };
    }

    // ── analyze_symptoms (Bio_ClinicalBERT) ──────────────────────────────────
    case 'analyze_symptoms': {
      const inp = input as unknown as AnalyzeSymptomsInput;
      const hintSpecialty = suggestSpecialty(inp.symptoms);
      const base = {
        input_symptoms: inp.symptoms,
        suggested_specialty: hintSpecialty ?? 'General Practitioner',
        entities: [] as unknown[],
      };

      if (!hfToken) {
        return { ...base, note: 'HF token not configured — using keyword matching only' };
      }

      try {
        const entities = await parseSymptoms(inp.symptoms, hfToken);
        return {
          ...base,
          entities,
          entity_count: entities.length,
          entity_summary: entities.length
            ? entities.map((e) => `${e.word} [${e.entity}]`).join(', ')
            : 'No specific entities detected',
        };
      } catch (e) {
        return { ...base, hf_error: e instanceof Error ? e.message : 'Bio_ClinicalBERT unavailable' };
      }
    }

    // ── analyze_lab_report (BiomedBERT) ──────────────────────────────────────
    case 'analyze_lab_report': {
      const inp = input as unknown as AnalyzeLabInput;
      if (!hfToken) {
        return { entities: [], note: 'HF token not configured — cannot analyze lab report' };
      }
      try {
        const entities = await hfAnalyzeLabReport(inp.report_text, hfToken);
        return {
          entity_count: entities.length,
          entities,
          findings: entities.map(
            (e) => `${e.word} (${e.entity}, ${(e.score * 100).toFixed(0)}%)`
          ),
        };
      } catch (e) {
        return { entities: [], error: e instanceof Error ? e.message : 'BiomedBERT unavailable' };
      }
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
