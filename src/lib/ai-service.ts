import Anthropic from '@anthropic-ai/sdk';
import type { Doctor, TimeSlot } from './types';

let client: Anthropic | null = null;

export function initializeClient(apiKey: string): void {
  if (!apiKey) {
    client = null;
    return;
  }
  client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export function isReady(): boolean {
  return client !== null;
}

function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: false },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '11:30 AM', available: true },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
    { time: '03:00 PM', available: false },
    { time: '03:30 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '04:30 PM', available: false },
  ];
  return slots;
}

function buildSystemPrompt(doctors: Doctor[]): string {
  const doctorList = doctors
    .map(
      (d) =>
        `- ${d.name} | ${d.specialty} | ${d.hospital} | Rating: ${d.rating}/5 | ${d.available ? 'Available' : 'Unavailable'}`
    )
    .join('\n');

  return `You are HMG AI Assistant, a helpful and professional medical appointment booking assistant for HMG Healthcare Group in Saudi Arabia.

Your role is to help patients book doctor appointments. You are warm, empathetic, and professional.

Available doctors:
${doctorList}

Guidelines:
- Help patients identify the right specialist for their health concern
- Recommend available doctors from the list above
- If a patient describes symptoms, suggest the appropriate specialty
- Keep responses concise and friendly (2-4 sentences max)
- When you recommend a specific doctor, format their name exactly as shown above
- Always suggest booking an appointment
- Do not provide medical diagnoses - only help with appointment booking
- Respond in the same language the patient uses (Arabic or English)

When recommending a doctor, always mention their name, specialty, hospital, and rating.`;
}

export async function bookingChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string,
  availableDoctors: Doctor[]
): Promise<{ content: string; suggestedDoctor?: Doctor; slots?: TimeSlot[] }> {
  if (!client) {
    return {
      content:
        'AI assistant is not configured. Please add your Anthropic API key in Settings to use the AI booking assistant.',
    };
  }

  const history = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  history.push({ role: 'user', content: userMessage });

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: buildSystemPrompt(availableDoctors),
      messages: history,
    });

    const content =
      response.content[0].type === 'text' ? response.content[0].text : '';

    let suggestedDoctor: Doctor | undefined;
    let slots: TimeSlot[] | undefined;

    for (const doctor of availableDoctors) {
      if (content.includes(doctor.name) && doctor.available) {
        suggestedDoctor = doctor;
        slots = generateTimeSlots();
        break;
      }
    }

    return { content, suggestedDoctor, slots };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: `I apologize, I encountered an error: ${message}. Please check your API key in Settings.`,
    };
  }
}
