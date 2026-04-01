'use client';

import { useMemo } from 'react';
import type { Patient, Appointment, LabResult, Medication } from '@/lib/types';
import styles from './Dashboard.module.css';

interface DashboardProps {
  patient: Patient;
  appointments: Appointment[];
  labResults: LabResult[];
  medications: Medication[];
  onNavigate: (view: string) => void;
}

export default function Dashboard({ patient, appointments, labResults, medications, onNavigate }: DashboardProps) {
  const hour = new Date().getHours();
  const greeting = useMemo(() => {
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, [hour]);

  const upcomingApts = appointments.filter(a => a.status === 'upcoming');
  const activeMeds = medications.filter(m => m.status === 'active');
  const criticalLabs = labResults.filter(l => l.status === 'critical');
  const abnormalLabs = labResults.filter(l => l.status === 'high' || l.status === 'low' || l.status === 'critical');
  const nextApt = upcomingApts[0];

  const age = useMemo(() => {
    const dob = new Date(patient.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }, [patient.dateOfBirth]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerBg} />
        <div className={styles.topBar}>
          <div className={styles.greetingBlock}>
            <p className={styles.greetSmall}>{greeting},</p>
            <p className={styles.greetName}>{patient.fullName.split(' ')[0]}</p>
          </div>
          <div className={styles.topActions}>
            {criticalLabs.length > 0 && (
              <button className={styles.alertBtn} onClick={() => onNavigate('lab')} aria-label="Critical alerts">
                <span className={styles.alertIcon}>⚠</span>
                <span className={styles.alertBadge}>{criticalLabs.length}</span>
              </button>
            )}
            <button className={styles.avatarBtn} onClick={() => onNavigate('profile')} aria-label="Patient profile">
              {patient.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </button>
          </div>
        </div>

        {/* Patient Summary Card */}
        <div className={styles.patientCard}>
          <div className={styles.patientCardLeft}>
            <div className={styles.patientAvatar}>
              {patient.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className={styles.patientName}>{patient.fullName}</p>
              <p className={styles.patientMeta}>{age}y · {patient.gender} · {patient.bloodType} · MRN: {patient.mrn}</p>
            </div>
          </div>
          <button className={styles.profileBtn} onClick={() => onNavigate('profile')}>View Profile →</button>
        </div>
      </div>

      <div className={styles.body}>
        {/* Critical Alert Banner */}
        {criticalLabs.length > 0 && (
          <div className={styles.alertBanner} onClick={() => onNavigate('lab')}>
            <span className={styles.alertBannerIcon}>🚨</span>
            <div>
              <p className={styles.alertBannerTitle}>Critical Lab Result — Immediate Review Required</p>
              <p className={styles.alertBannerSub}>{criticalLabs[0].testName}: {criticalLabs[0].resultValue} {criticalLabs[0].unit}</p>
            </div>
            <span className={styles.alertBannerArrow}>→</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} onClick={() => onNavigate('appointments')}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>📅</div>
            <p className={styles.statValue}>{upcomingApts.length}</p>
            <p className={styles.statLabel}>Upcoming Appts</p>
          </div>
          <div className={styles.statCard} onClick={() => onNavigate('medications')}>
            <div className={`${styles.statIcon} ${styles.statIconTeal}`}>💊</div>
            <p className={styles.statValue}>{activeMeds.length}</p>
            <p className={styles.statLabel}>Active Meds</p>
          </div>
          <div className={styles.statCard} onClick={() => onNavigate('lab')}>
            <div className={`${styles.statIcon} ${abnormalLabs.length > 0 ? styles.statIconRed : styles.statIconGold}`}>🔬</div>
            <p className={styles.statValue}>{abnormalLabs.length}</p>
            <p className={styles.statLabel}>Abnormal Labs</p>
          </div>
          <div className={styles.statCard} onClick={() => onNavigate('clinical')}>
            <div className={`${styles.statIcon} ${styles.statIconNavy}`}>🧠</div>
            <p className={styles.statValue}>AI</p>
            <p className={styles.statLabel}>Analysis</p>
          </div>
        </div>

        {/* AI Booking CTA */}
        <div className={styles.aiCta} onClick={() => onNavigate('booking')}>
          <div className={styles.aiCtaLeft}>
            <div className={styles.aiPulse}>✦</div>
            <div>
              <p className={styles.aiCtaTitle}>AI Smart Booking</p>
              <p className={styles.aiCtaSub}>Describe symptoms — Claude finds the right doctor</p>
            </div>
          </div>
          <span className={styles.aiCtaArrow}>→</span>
        </div>

        {/* Next Appointment */}
        {nextApt && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Next Appointment</p>
            <div className={styles.nextAptCard}>
              <div className={styles.nextAptDate}>
                <p className={styles.nextAptDay}>{new Date(nextApt.date).toLocaleDateString('en-US', { day: 'numeric' })}</p>
                <p className={styles.nextAptMonth}>{new Date(nextApt.date).toLocaleDateString('en-US', { month: 'short' })}</p>
              </div>
              <div className={styles.nextAptInfo}>
                <p className={styles.nextAptDoctor}>{nextApt.doctorName}</p>
                <p className={styles.nextAptSpec}>{nextApt.specialty} · {nextApt.time}</p>
                {nextApt.chiefComplaint && <p className={styles.nextAptComplaint}>{nextApt.chiefComplaint}</p>}
              </div>
              <span className={styles.statusBadgeUpcoming}>Upcoming</span>
            </div>
          </div>
        )}

        {/* Recent Lab Results */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionTitle}>Recent Lab Results</p>
            <button className={styles.seeAll} onClick={() => onNavigate('lab')}>See all</button>
          </div>
          <div className={styles.labList}>
            {labResults.slice(0, 4).map(lab => (
              <div key={lab.id} className={styles.labRow}>
                <div className={styles.labName}>
                  <p className={styles.labTestName}>{lab.testName}</p>
                  <p className={styles.labDate}>{new Date(lab.resultDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className={styles.labValue}>
                  <span className={styles.labResult}>{lab.resultValue} <span className={styles.labUnit}>{lab.unit}</span></span>
                  <span className={`${styles.labBadge} ${styles[`labBadge_${lab.status}`]}`}>{lab.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Medications */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionTitle}>Active Medications</p>
            <button className={styles.seeAll} onClick={() => onNavigate('medications')}>See all</button>
          </div>
          <div className={styles.medsList}>
            {activeMeds.slice(0, 3).map(med => (
              <div key={med.id} className={styles.medRow}>
                <div className={styles.medIcon}>💊</div>
                <div className={styles.medInfo}>
                  <p className={styles.medName}>{med.drugName} <span className={styles.medDosage}>{med.dosage}</span></p>
                  <p className={styles.medFreq}>{med.frequency} · {med.route}</p>
                </div>
                <span className={styles.medStatus}>Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Quick Actions</p>
          <div className={styles.quickGrid}>
            <button className={styles.quickBtn} onClick={() => onNavigate('clinical')}>
              <span className={styles.quickBtnIcon}>🧠</span>
              <span>AI Analysis</span>
            </button>
            <button className={styles.quickBtn} onClick={() => onNavigate('lab')}>
              <span className={styles.quickBtnIcon}>🔬</span>
              <span>Lab Reports</span>
            </button>
            <button className={styles.quickBtn} onClick={() => onNavigate('appointments')}>
              <span className={styles.quickBtnIcon}>📋</span>
              <span>Appointments</span>
            </button>
            <button className={styles.quickBtn} onClick={() => onNavigate('profile')}>
              <span className={styles.quickBtnIcon}>👤</span>
              <span>My Profile</span>
            </button>
          </div>
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
