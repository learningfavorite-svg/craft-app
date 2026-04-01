import { NextResponse } from 'next/server';

const DATABASE_URL = process.env.DATABASE_URL;

const DEMO_APPOINTMENTS = [
  { id: 'apt-001', doctorId: 'doc-001', doctorName: 'Dr. Reem Al-Faraj', specialty: 'Cardiologist', date: '2025-04-08', time: '10:00 AM', status: 'upcoming', chiefComplaint: 'Follow-up: Hypertension & HbA1c review' },
  { id: 'apt-002', doctorId: 'doc-002', doctorName: 'Dr. Khalid Al-Otaibi', specialty: 'Neurologist', date: '2025-04-15', time: '02:30 PM', status: 'upcoming', chiefComplaint: 'Headache evaluation' },
  { id: 'apt-003', doctorId: 'doc-001', doctorName: 'Dr. Reem Al-Faraj', specialty: 'Cardiologist', date: '2025-03-10', time: '11:00 AM', status: 'completed', notes: 'BP controlled 130/80. Continue Ramipril. Labs ordered.' },
];

async function queryAppointments() {
  if (!DATABASE_URL) return null;
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 3000 });
    const result = await pool.query(`
      SELECT a.id, a.doctor_id as "doctorId", a.doctor_name as "doctorName",
             a.specialty, a.appointment_date as date,
             TO_CHAR(a.appointment_time, 'HH12:MI AM') as time,
             a.status, a.chief_complaint as "chiefComplaint", a.notes
      FROM appointments a
      ORDER BY a.appointment_date DESC
      LIMIT 20
    `);
    await pool.end();
    return result.rows.map(r => ({
      ...r,
      date: r.date?.toISOString?.()?.split('T')[0] ?? r.date,
    }));
  } catch {
    return null;
  }
}

export async function GET() {
  const apts = await queryAppointments();
  return NextResponse.json(apts ?? DEMO_APPOINTMENTS);
}
