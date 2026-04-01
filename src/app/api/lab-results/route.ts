import { NextResponse } from 'next/server';

const DATABASE_URL = process.env.DATABASE_URL;

const DEMO_LABS = [
  { id: 'lab-001', testName: 'HbA1c', resultValue: '7.2', unit: '%', referenceLow: 4.0, referenceHigh: 5.6, status: 'high', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-20', notes: 'Elevated — monitor glycemic control' },
  { id: 'lab-002', testName: 'Fasting Glucose', resultValue: '126', unit: 'mg/dL', referenceLow: 70, referenceHigh: 99, status: 'high', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-20' },
  { id: 'lab-003', testName: 'Total Cholesterol', resultValue: '198', unit: 'mg/dL', referenceLow: 0, referenceHigh: 200, status: 'normal', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-20' },
  { id: 'lab-004', testName: 'Hemoglobin', resultValue: '13.1', unit: 'g/dL', referenceLow: 13.5, referenceHigh: 17.5, status: 'low', orderedBy: 'Dr. Khalid Al-Otaibi', resultDate: '2025-03-15' },
  { id: 'lab-005', testName: 'eGFR', resultValue: '72', unit: 'mL/min/1.73m²', referenceLow: 60, referenceHigh: 120, status: 'normal', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-20' },
  { id: 'lab-006', testName: 'Troponin I', resultValue: '0.04', unit: 'ng/mL', referenceLow: 0, referenceHigh: 0.04, status: 'critical', orderedBy: 'Dr. Reem Al-Faraj', resultDate: '2025-03-28', notes: 'Critical — urgent cardiology review required' },
];

async function queryLabResults() {
  if (!DATABASE_URL) return null;
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 3000 });
    const result = await pool.query(`
      SELECT id, test_name as "testName", result_value as "resultValue",
             unit, reference_low as "referenceLow", reference_high as "referenceHigh",
             status, ordered_by as "orderedBy", result_date as "resultDate", notes
      FROM lab_results
      ORDER BY result_date DESC
      LIMIT 20
    `);
    await pool.end();
    return result.rows.map(r => ({
      ...r,
      resultDate: r.resultDate?.toISOString?.()?.split('T')[0] ?? r.resultDate,
    }));
  } catch {
    return null;
  }
}

export async function GET() {
  const labs = await queryLabResults();
  return NextResponse.json(labs ?? DEMO_LABS);
}
