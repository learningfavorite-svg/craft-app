import { SAMPLE_DOCTORS, addAppointment, getAppointments } from '../lib/database';

describe('Booking logic', () => {
  beforeEach(() => localStorage.clear());

  test('SAMPLE_DOCTORS has at least 4 doctors', () => {
    expect(SAMPLE_DOCTORS.length).toBeGreaterThanOrEqual(4);
  });

  test('addAppointment saves and getAppointments retrieves it', () => {
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
    expect(all).toHaveLength(1);
    expect(all[0].doctorName).toBe('Dr. Reem Al-Faraj');
  });

  test('getAppointments returns empty array when none saved', () => {
    expect(getAppointments()).toEqual([]);
  });

  test('multiple appointments stack correctly', () => {
    addAppointment({
      id: 'a1',
      doctorId: 'd1',
      doctorName: 'Dr. A',
      specialty: 'Cardiology',
      date: '2026-04-01',
      time: '09:00',
      status: 'upcoming',
    });
    addAppointment({
      id: 'a2',
      doctorId: 'd2',
      doctorName: 'Dr. B',
      specialty: 'Neurology',
      date: '2026-04-02',
      time: '11:00',
      status: 'upcoming',
    });
    expect(getAppointments()).toHaveLength(2);
  });
});
