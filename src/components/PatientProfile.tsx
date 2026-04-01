'use client';

import type { Patient, Medication, Appointment, LabResult } from '@/lib/types';
import styles from './PatientProfile.module.css';

interface PatientProfileProps {
  patient: Patient;
  medications: Medication[];
  appointments: Appointment[];
  labResults: LabResult[];
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export default function PatientProfile({ patient, medications, appointments, labResults, onBack, onNavigate }: PatientProfileProps) {
  const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  const activeMeds = medications.filter(m => m.status === 'active');
  const completedApts = appointments.filter(a => a.status === 'completed');
  const abnormalLabs = labResults.filter(l => l.status !== 'normal');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <h1 className={styles.title}>Patient Profile</h1>
        <div className={styles.mrnBadge}>MRN: {patient.mrn}</div>
      </div>

      <div className={styles.body}>
        {/* Identity Card */}
        <div className={styles.identityCard}>
          <div className={styles.avatarLarge}>
            {patient.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className={styles.identityInfo}>
            <h2 className={styles.fullName}>{patient.fullName}</h2>
            <p className={styles.demographics}>{age} years · {patient.gender} · {patient.nationality}</p>
            <div className={styles.bloodTypeBadge}>{patient.bloodType}</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={styles.summaryRow}>
          <div className={styles.summaryItem}>
            <p className={styles.summaryVal}>{completedApts.length}</p>
            <p className={styles.summaryLabel}>Visits</p>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <p className={styles.summaryVal}>{activeMeds.length}</p>
            <p className={styles.summaryLabel}>Active Meds</p>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <p className={`${styles.summaryVal} ${abnormalLabs.length > 0 ? styles.summaryValAlert : ''}`}>{abnormalLabs.length}</p>
            <p className={styles.summaryLabel}>Abnormal Labs</p>
          </div>
        </div>

        {/* Contact & Personal */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Personal Information</p>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Date of Birth</span>
              <span className={styles.infoValue}>{new Date(patient.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Gender</span>
              <span className={styles.infoValue}>{patient.gender}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nationality</span>
              <span className={styles.infoValue}>{patient.nationality}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Blood Type</span>
              <span className={styles.infoValue}>{patient.bloodType}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{patient.phone}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{patient.email}</span>
            </div>
            {patient.insuranceId && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Insurance ID</span>
                <span className={styles.infoValue}>{patient.insuranceId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Allergies & Adverse Reactions</p>
          {patient.allergies.length === 0 ? (
            <p className={styles.emptyText}>No known allergies</p>
          ) : (
            <div className={styles.allergiesList}>
              {patient.allergies.map((allergy, i) => (
                <div key={i} className={`${styles.allergyRow} ${styles[`severity_${allergy.severity}`]}`}>
                  <div className={styles.allergyLeft}>
                    <span className={styles.allergyIcon}>⚠️</span>
                    <div>
                      <p className={styles.allergyDrug}>{allergy.drug}</p>
                      <p className={styles.allergyReaction}>{allergy.reaction}</p>
                    </div>
                  </div>
                  <span className={`${styles.severityBadge} ${styles[`sev_${allergy.severity}`]}`}>
                    {allergy.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Medications Summary */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Current Medications</p>
            <button className={styles.cardLink} onClick={() => onNavigate('medications')}>See all</button>
          </div>
          {activeMeds.length === 0 ? (
            <p className={styles.emptyText}>No active medications</p>
          ) : (
            <div className={styles.medSummaryList}>
              {activeMeds.map(med => (
                <div key={med.id} className={styles.medSummaryRow}>
                  <div className={styles.medDot} />
                  <div>
                    <span className={styles.medSumName}>{med.drugName}</span>
                    <span className={styles.medSumDosage}> {med.dosage} · {med.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Visit History */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Visit History</p>
            <button className={styles.cardLink} onClick={() => onNavigate('appointments')}>See all</button>
          </div>
          {completedApts.length === 0 ? (
            <p className={styles.emptyText}>No completed appointments</p>
          ) : (
            <div className={styles.visitList}>
              {completedApts.slice(0, 3).map(apt => (
                <div key={apt.id} className={styles.visitRow}>
                  <div className={styles.visitDate}>
                    <p className={styles.visitDay}>{new Date(apt.date).toLocaleDateString('en-US', { day: 'numeric' })}</p>
                    <p className={styles.visitMonth}>{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                  </div>
                  <div className={styles.visitInfo}>
                    <p className={styles.visitDoc}>{apt.doctorName}</p>
                    <p className={styles.visitSpec}>{apt.specialty}</p>
                    {apt.notes && <p className={styles.visitNotes}>{apt.notes}</p>}
                  </div>
                  <span className={styles.visitBadge}>Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
