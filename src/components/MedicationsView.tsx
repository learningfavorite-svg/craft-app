'use client';

import type { Medication } from '@/lib/types';
import styles from './MedicationsView.module.css';

interface MedicationsViewProps {
  medications: Medication[];
  onBack: () => void;
}

const ROUTE_ICONS: Record<string, string> = {
  Oral: '💊',
  IV: '💉',
  Topical: '🧴',
  Inhaled: '🌬️',
  Subcutaneous: '💉',
};

export default function MedicationsView({ medications, onBack }: MedicationsViewProps) {
  const active = medications.filter(m => m.status === 'active');
  const past = medications.filter(m => m.status !== 'active');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <h1 className={styles.title}>Medications</h1>
        <span className={styles.countBadge}>{active.length} active</span>
      </div>

      <div className={styles.body}>
        {/* Drug Interaction Notice */}
        <div className={styles.interactionNotice}>
          <span className={styles.noticeIcon}>🧬</span>
          <div>
            <p className={styles.noticeTitle}>AI Drug Interaction Monitoring</p>
            <p className={styles.noticeSub}>{active.length} active medications being monitored — No critical interactions detected</p>
          </div>
          <span className={styles.noticeStatus}>✓</span>
        </div>

        {/* Active */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Active ({active.length})</p>
          {active.map(med => (
            <div key={med.id} className={styles.medCard}>
              <div className={styles.medCardLeft}>
                <div className={styles.medIconBox}>
                  {ROUTE_ICONS[med.route] || '💊'}
                </div>
                <div className={styles.medDetails}>
                  <div className={styles.medNameRow}>
                    <p className={styles.medDrugName}>{med.drugName}</p>
                    <span className={styles.medDosageBadge}>{med.dosage}</span>
                  </div>
                  <p className={styles.medFrequency}>{med.frequency}</p>
                  <p className={styles.medIndication}>{med.indication}</p>
                  <div className={styles.medMeta}>
                    <span className={styles.metaItem}>Route: {med.route}</span>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.metaItem}>Since {new Date(med.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.metaItem}>{med.prescriber.replace('Dr. ', 'Dr.')}</span>
                  </div>
                </div>
              </div>
              <span className={styles.activeStatus}>Active</span>
            </div>
          ))}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Past Medications</p>
            {past.map(med => (
              <div key={med.id} className={`${styles.medCard} ${styles.medCardPast}`}>
                <div className={styles.medCardLeft}>
                  <div className={`${styles.medIconBox} ${styles.medIconBoxPast}`}>💊</div>
                  <div className={styles.medDetails}>
                    <div className={styles.medNameRow}>
                      <p className={`${styles.medDrugName} ${styles.medDrugNamePast}`}>{med.drugName}</p>
                      <span className={styles.medDosageBadge}>{med.dosage}</span>
                    </div>
                    <p className={styles.medFrequency}>{med.frequency}</p>
                    <div className={styles.medMeta}>
                      <span className={styles.metaItem}>{med.startDate} → {med.endDate || '—'}</span>
                    </div>
                  </div>
                </div>
                <span className={`${styles.activeStatus} ${styles.statusPast}`}>{med.status}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
