import { NextResponse } from 'next/server';

const DATABASE_URL = process.env.DATABASE_URL;

// Fallback demo data for when postgres is not available
const DEMO_PATIENT = {
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

async function queryPatients() {
  if (!DATABASE_URL) return null;
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 3000 });
    const result = await pool.query(`
      SELECT id, mrn, full_name as "fullName", date_of_birth as "dateOfBirth",
             gender, nationality, phone, email, blood_type as "bloodType",
             allergies, insurance_id as "insuranceId"
      FROM patients LIMIT 1
    `);
    await pool.end();
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      dateOfBirth: row.dateOfBirth?.toISOString?.()?.split('T')[0] ?? row.dateOfBirth,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const patient = await queryPatients();
  return NextResponse.json(patient ?? DEMO_PATIENT);
}
