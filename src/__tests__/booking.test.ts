import { SAMPLE_DOCTORS, SAMPLE_APPOINTMENTS, addAppointment, getAppointments } from '../lib/database';

describe('Booking logic', () => {
  beforeEach(() => localStorage.clear());

  test('SAMPLE_DOCTORS has at least 4 doctors', () => {
    expect(SAMPLE_DOCTORS.length).toBeGreaterThanOrEqual(4);
  });

  test('SAMPLE_APPOINTMENTS has seed data', () => {
    expect(SAMPLE_APPOINTMENTS.length).toBeGreaterThanOrEqual(1);
  });

  test('getAppointments returns sample data when nothing saved', () => {
    const all = getAppointments();
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all[0]).toHaveProperty('doctorName');
  });

  test('addAppointment appends to existing appointments', () => {
    const baseline = getAppointments().length;
    const appt = {
      id: 'test-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Reem Al-Faraj',
      specialty: 'Cardiologist',
      date: '2026-04-01',
      time: '10:30',
      status: 'upcoming' as const,
    };
    addAppointment(appt);
    const all = getAppointments();
    expect(all).toHaveLength(baseline + 1);
    const added = all.find(a => a.id === 'test-1');
    expect(added?.doctorName).toBe('Dr. Reem Al-Faraj');
  });

  test('multiple appointments stack correctly', () => {
    const baseline = getAppointments().length;
    addAppointment({ id: 'a1', doctorId: 'd1', doctorName: 'Dr. A', specialty: 'Cardiology', date: '2026-04-01', time: '09:00', status: 'upcoming' });
    addAppointment({ id: 'a2', doctorId: 'd2', doctorName: 'Dr. B', specialty: 'Neurology', date: '2026-04-02', time: '11:00', status: 'upcoming' });
    expect(getAppointments()).toHaveLength(baseline + 2);
  });
});
