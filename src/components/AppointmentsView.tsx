'use client';

import type { Appointment } from '@/lib/types';
import styles from './AppointmentsView.module.css';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onBack: () => void;
  onBookNew: () => void;
}

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: '#2D7DD2', bg: 'rgba(45,125,210,0.12)' },
  completed: { label: 'Completed', color: '#0F9B8E', bg: 'rgba(15,155,142,0.12)' },
  cancelled: { label: 'Cancelled', color: '#6B7A99', bg: 'rgba(107,122,153,0.12)' },
  'no-show': { label: 'No Show', color: '#E8335A', bg: 'rgba(232,51,90,0.12)' },
};

export default function AppointmentsView({ appointments, onBack, onBookNew }: AppointmentsViewProps) {
  const upcoming = appointments.filter(a => a.status === 'upcoming');
  const past = appointments.filter(a => a.status !== 'upcoming');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <h1 className={styles.title}>Appointments</h1>
        <button className={styles.newBtn} onClick={onBookNew}>+ Book</button>
      </div>

      <div className={styles.body}>
        {/* Book via AI */}
        <div className={styles.aiBookCta} onClick={onBookNew}>
          <span className={styles.aiCtaIcon}>🤖</span>
          <div>
            <p className={styles.aiCtaTitle}>Book with AI Assistant</p>
            <p className={styles.aiCtaSub}>Describe your symptoms — Claude finds the right specialist</p>
          </div>
          <span>→</span>
        </div>

        {/* Upcoming */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Upcoming ({upcoming.length})</p>
          {upcoming.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyIcon}>📅</p>
              <p className={styles.emptyText}>No upcoming appointments</p>
              <button className={styles.emptyBtn} onClick={onBookNew}>Book Now</button>
            </div>
          ) : (
            upcoming.map(apt => <AppointmentCard key={apt.id} apt={apt} />)
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Past Appointments</p>
            {past.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}

function AppointmentCard({ apt }: { apt: Appointment }) {
  const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.upcoming;
  const date = new Date(apt.date);

  return (
    <div className={styles.aptCard} style={{ borderLeftColor: config.color }}>
      <div className={styles.aptDateBox} style={{ background: `${config.color}18` }}>
        <p className={styles.aptDay} style={{ color: config.color }}>{date.getDate()}</p>
        <p className={styles.aptMonth} style={{ color: config.color }}>{date.toLocaleDateString('en-US', { month: 'short' })}</p>
      </div>
      <div className={styles.aptInfo}>
        <p className={styles.aptDoctor}>{apt.doctorName}</p>
        <p className={styles.aptSpec}>{apt.specialty} · {apt.time}</p>
        {apt.chiefComplaint && <p className={styles.aptComplaint}>{apt.chiefComplaint}</p>}
        {apt.notes && <p className={styles.aptNotes}>{apt.notes}</p>}
      </div>
      <span
        className={styles.aptStatus}
        style={{ background: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    </div>
  );
}
