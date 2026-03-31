import { SAMPLE_DOCTORS } from '../lib/database';

describe('Doctor data', () => {
  test('all doctors have required fields', () => {
    SAMPLE_DOCTORS.forEach((doc) => {
      expect(doc.id).toBeTruthy();
      expect(doc.name).toMatch(/^Dr\./);
      expect(doc.specialty).toBeTruthy();
      expect(doc.hospital).toBeTruthy();
      expect(typeof doc.rating).toBe('number');
      expect(doc.rating).toBeGreaterThanOrEqual(1);
      expect(doc.rating).toBeLessThanOrEqual(5);
    });
  });

  test('has cardiologist in sample doctors', () => {
    const cardio = SAMPLE_DOCTORS.filter((d) =>
      d.specialty.toLowerCase().includes('cardio')
    );
    expect(cardio.length).toBeGreaterThan(0);
  });

  test('doctor avatars are 2-char initials', () => {
    SAMPLE_DOCTORS.forEach((doc) => {
      expect(doc.avatar).toHaveLength(2);
    });
  });
});
