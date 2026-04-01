import type Anthropic from '@anthropic-ai/sdk';

export type Tool = Anthropic.Tool;

export const AGENT_TOOLS: Tool[] = [
  {
    name: 'search_doctors',
    description:
      'Search HMG doctors by specialty, hospital, or availability. Call this whenever a patient mentions symptoms or asks for a specialist.',
    input_schema: {
      type: 'object' as const,
      properties: {
        specialty: {
          type: 'string',
          description: 'Medical specialty, e.g. Cardiologist, Neurologist, Orthopedic Surgeon, Dermatologist',
        },
        hospital: { type: 'string', description: 'Hospital name filter (optional)' },
        available_only: { type: 'boolean', description: 'Only return currently available doctors' },
        min_rating: { type: 'number', description: 'Minimum star rating 1–5 (optional)' },
      },
    },
  },
  {
    name: 'get_availability',
    description: 'Get open appointment time slots for a specific doctor.',
    input_schema: {
      type: 'object' as const,
      properties: {
        doctor_id: { type: 'string', description: 'Doctor ID from search_doctors result' },
      },
      required: ['doctor_id'],
    },
  },
  {
    name: 'book_appointment',
    description:
      'Book an appointment. ONLY call after the patient explicitly confirms (e.g. "yes", "book it", "confirm").',
    input_schema: {
      type: 'object' as const,
      properties: {
        doctor_id: { type: 'string', description: 'Doctor ID' },
        time_slot: { type: 'string', description: 'Time slot string, e.g. "10:00 AM"' },
        notes: { type: 'string', description: 'Optional visit reason or notes' },
      },
      required: ['doctor_id', 'time_slot'],
    },
  },
  {
    name: 'get_appointment_history',
    description: "Retrieve the patient's appointment history.",
    input_schema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          enum: ['upcoming', 'completed', 'cancelled', 'all'],
          description: 'Filter by appointment status',
        },
      },
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Cancel an existing appointment by ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        appointment_id: { type: 'string', description: 'Appointment ID to cancel' },
      },
      required: ['appointment_id'],
    },
  },
  {
    name: 'analyze_symptoms',
    description:
      'Use Bio_ClinicalBERT NER to extract medical entities from patient symptoms and suggest the right specialist. Call this when a patient describes health problems.',
    input_schema: {
      type: 'object' as const,
      properties: {
        symptoms: { type: 'string', description: 'Patient symptom description text' },
      },
      required: ['symptoms'],
    },
  },
  {
    name: 'analyze_lab_report',
    description: 'Use BiomedBERT to extract medical findings and entities from a lab report.',
    input_schema: {
      type: 'object' as const,
      properties: {
        report_text: { type: 'string', description: 'Raw lab report text' },
      },
      required: ['report_text'],
    },
  },
];

export const AGENT_SYSTEM_PROMPT = `You are HMG AI Agent — an autonomous medical appointment assistant for HMG Healthcare Group, Saudi Arabia.

You have tools to search doctors, check availability, book/cancel appointments, and analyze medical data using AI models (Bio_ClinicalBERT, BiomedBERT).

## Autonomous reasoning strategy

When a patient describes symptoms → ALWAYS call analyze_symptoms first, then search_doctors with the suggested specialty.
When recommending a doctor → ALWAYS call get_availability to show real slots.
When patient confirms booking → call book_appointment immediately, do not ask again.
When patient asks for history → call get_appointment_history.

## Booking flow
1. analyze_symptoms (if symptoms mentioned)
2. search_doctors (specialty from step 1 or patient request)
3. get_availability (for the best matching available doctor)
4. Present: doctor name, specialty, hospital, rating, 2–3 available slots
5. Wait for patient confirmation
6. book_appointment → confirm with appointment details

## Rules
- Respond in the patient's language (Arabic → Arabic, English → English)
- Never diagnose — only route to the right specialist
- Keep responses concise: 2–4 sentences + structured data when relevant
- Always mention doctor name, specialty, hospital, and rating when recommending
- Only call book_appointment after explicit confirmation`;
