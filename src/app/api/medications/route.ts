import { NextResponse } from 'next/server';

const DATABASE_URL = process.env.DATABASE_URL;

const DEMO_MEDS = [
  { id: 'med-001', drugName: 'Metformin', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', startDate: '2024-06-01', prescriber: 'Dr. Reem Al-Faraj', indication: 'Type 2 Diabetes', status: 'active' },
  { id: 'med-002', drugName: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at bedtime', route: 'Oral', startDate: '2024-06-01', prescriber: 'Dr. Reem Al-Faraj', indication: 'Dyslipidemia', status: 'active' },
  { id: 'med-003', drugName: 'Ramipril', dosage: '5mg', frequency: 'Once daily', route: 'Oral', startDate: '2024-09-15', prescriber: 'Dr. Reem Al-Faraj', indication: 'Hypertension', status: 'active' },
  { id: 'med-004', drugName: 'Aspirin', dosage: '81mg', frequency: 'Once daily', route: 'Oral', startDate: '2024-06-01', prescriber: 'Dr. Reem Al-Faraj', indication: 'Cardiovascular prophylaxis', status: 'active' },
  { id: 'med-005', drugName: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', route: 'Oral', startDate: '2025-01-10', endDate: '2025-01-20', prescriber: 'Dr. Samar Al-Zahrani', indication: 'Skin infection', status: 'completed' },
];

async function queryMedications() {
  if (!DATABASE_URL) return null;
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 3000 });
    const result = await pool.query(`
      SELECT id, drug_name as "drugName", dosage, frequency, route,
             start_date as "startDate", end_date as "endDate",
             prescriber, indication, status
      FROM medications
      ORDER BY status, start_date DESC
      LIMIT 30
    `);
    await pool.end();
    return result.rows.map(r => ({
      ...r,
      startDate: r.startDate?.toISOString?.()?.split('T')[0] ?? r.startDate,
      endDate: r.endDate?.toISOString?.()?.split('T')[0] ?? r.endDate,
    }));
  } catch {
    return null;
  }
}

export async function GET() {
  const meds = await queryMedications();
  return NextResponse.json(meds ?? DEMO_MEDS);
}
