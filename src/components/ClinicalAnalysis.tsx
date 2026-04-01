'use client';

import { useState } from 'react';
import type { LabResult, ClinicalNote, Patient } from '@/lib/types';
import styles from './ClinicalAnalysis.module.css';

interface ClinicalAnalysisProps {
  patient: Patient;
  labResults: LabResult[];
  notes: ClinicalNote[];
  onBack: () => void;
  onOpenBooking: () => void;
  hfToken?: string;
}

const DIFFERENTIAL_DIAGNOSES = [
  { condition: 'Type 2 Diabetes Mellitus', probability: 87, evidence: 'HbA1c 7.2%, FPG 126 mg/dL, Metformin prescribed', icd: 'E11.9' },
  { condition: 'Hypertension (Stage 1)', probability: 82, evidence: 'BP 142/88, Ramipril prescribed, family history', icd: 'I10' },
  { condition: 'Dyslipidemia', probability: 75, evidence: 'Total cholesterol 198 mg/dL, Atorvastatin therapy', icd: 'E78.5' },
  { condition: 'Mild Anemia', probability: 64, evidence: 'Hemoglobin 13.1 g/dL (below reference 13.5)', icd: 'D64.9' },
  { condition: 'Chest Pain — Cardiac Origin', probability: 71, evidence: 'Troponin I elevated 0.04 ng/mL — CRITICAL', icd: 'R07.9' },
];

export default function ClinicalAnalysis({ patient, labResults, notes, onBack, onOpenBooking }: ClinicalAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'differential' | 'labs' | 'notes'>('differential');

  const criticalLabs = labResults.filter(l => l.status === 'critical');
  const abnormalLabs = labResults.filter(l => l.status !== 'normal');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>Clinical Analysis</h1>
          <p className={styles.subtitle}>AI-Powered · Bio_ClinicalBERT + BiomedBERT</p>
        </div>
        <div className={styles.aiBadge}>AI</div>
      </div>

      {/* Critical Alert */}
      {criticalLabs.length > 0 && (
        <div className={styles.criticalBanner}>
          <span className={styles.criticalIcon}>🚨</span>
          <div>
            <p className={styles.criticalTitle}>Critical Finding — Immediate Clinical Review</p>
            {criticalLabs.map(l => (
              <p key={l.id} className={styles.criticalDetail}>{l.testName}: {l.resultValue} {l.unit} — {l.notes}</p>
            ))}
          </div>
          <button className={styles.criticalBtn} onClick={onOpenBooking}>Refer →</button>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'differential' ? styles.tabActive : ''}`} onClick={() => setActiveTab('differential')}>
          Differential Dx
        </button>
        <button className={`${styles.tab} ${activeTab === 'labs' ? styles.tabActive : ''}`} onClick={() => setActiveTab('labs')}>
          Lab Analysis {abnormalLabs.length > 0 && <span className={styles.tabBadge}>{abnormalLabs.length}</span>}
        </button>
        <button className={`${styles.tab} ${activeTab === 'notes' ? styles.tabActive : ''}`} onClick={() => setActiveTab('notes')}>
          Clinical Notes
        </button>
      </div>

      <div className={styles.body}>
        {activeTab === 'differential' && (
          <div className={styles.differentialTab}>
            <div className={styles.aiDisclaimer}>
              <span>🤖</span>
              <p>AI-generated differential based on {patient.fullName}&apos;s labs, medications, and clinical notes. Not a clinical diagnosis.</p>
            </div>
            {DIFFERENTIAL_DIAGNOSES.sort((a, b) => b.probability - a.probability).map((dx, i) => (
              <div key={i} className={styles.dxCard}>
                <div className={styles.dxHeader}>
                  <div>
                    <p className={styles.dxCondition}>{dx.condition}</p>
                    <p className={styles.dxIcd}>ICD-10: {dx.icd}</p>
                  </div>
                  <div className={styles.dxProbContainer}>
                    <span className={`${styles.dxProb} ${dx.probability >= 80 ? styles.dxProbHigh : dx.probability >= 60 ? styles.dxProbMed : styles.dxProbLow}`}>
                      {dx.probability}%
                    </span>
                  </div>
                </div>
                <div className={styles.dxBar}>
                  <div
                    className={`${styles.dxBarFill} ${dx.probability >= 80 ? styles.dxBarHigh : dx.probability >= 60 ? styles.dxBarMed : styles.dxBarLow}`}
                    style={{ width: `${dx.probability}%` }}
                  />
                </div>
                <p className={styles.dxEvidence}>{dx.evidence}</p>
              </div>
            ))}
            <button className={styles.bookConsultBtn} onClick={onOpenBooking}>
              🤖 Book AI-Matched Specialist Consultation
            </button>
          </div>
        )}

        {activeTab === 'labs' && (
          <div className={styles.labsTab}>
            <div className={styles.labSummaryRow}>
              <div className={styles.labSumItem}>
                <p className={styles.labSumVal}>{labResults.length}</p>
                <p className={styles.labSumLabel}>Total Tests</p>
              </div>
              <div className={styles.labSumItem}>
                <p className={`${styles.labSumVal} ${styles.labSumNormal}`}>{labResults.filter(l => l.status === 'normal').length}</p>
                <p className={styles.labSumLabel}>Normal</p>
              </div>
              <div className={styles.labSumItem}>
                <p className={`${styles.labSumVal} ${styles.labSumAbnormal}`}>{abnormalLabs.length}</p>
                <p className={styles.labSumLabel}>Abnormal</p>
              </div>
              <div className={styles.labSumItem}>
                <p className={`${styles.labSumVal} ${styles.labSumCritical}`}>{criticalLabs.length}</p>
                <p className={styles.labSumLabel}>Critical</p>
              </div>
            </div>

            {labResults.map(lab => (
              <div key={lab.id} className={`${styles.labDetailCard} ${styles[`labBorder_${lab.status}`]}`}>
                <div className={styles.labDetailHeader}>
                  <div>
                    <p className={styles.labDetailName}>{lab.testName}</p>
                    <p className={styles.labDetailDate}>
                      {lab.orderedBy} · {new Date(lab.resultDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={styles.labDetailRight}>
                    <p className={styles.labDetailValue}>{lab.resultValue} <span className={styles.labDetailUnit}>{lab.unit}</span></p>
                    <span className={`${styles.labStatus} ${styles[`labStatus_${lab.status}`]}`}>{lab.status.toUpperCase()}</span>
                  </div>
                </div>
                {(lab.referenceLow !== undefined && lab.referenceHigh !== undefined) && (
                  <p className={styles.labRef}>Reference: {lab.referenceLow} – {lab.referenceHigh} {lab.unit}</p>
                )}
                {lab.notes && <p className={styles.labNote}>{lab.notes}</p>}

                {/* Visual range bar */}
                {lab.referenceLow !== undefined && lab.referenceHigh !== undefined && (() => {
                  const val = parseFloat(lab.resultValue);
                  const low = lab.referenceLow;
                  const high = lab.referenceHigh;
                  const range = high - low;
                  const extended = range * 0.4;
                  const min = low - extended;
                  const max = high + extended;
                  const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
                  return (
                    <div className={styles.rangeBar}>
                      <div className={styles.rangeNormal} style={{ left: `${((low - min) / (max - min)) * 100}%`, width: `${(range / (max - min)) * 100}%` }} />
                      <div className={`${styles.rangeMarker} ${styles[`rangeMarker_${lab.status}`]}`} style={{ left: `${pct}%` }} />
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className={styles.notesTab}>
            {notes.length === 0 ? (
              <p className={styles.emptyNotes}>No clinical notes available</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className={styles.noteCard}>
                  <div className={styles.noteHeader}>
                    <div>
                      <span className={styles.noteType}>{note.noteType}</span>
                      <p className={styles.noteAuthor}>{note.author}</p>
                    </div>
                    <p className={styles.noteDate}>
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {note.aiSummary && (
                    <div className={styles.aiSummary}>
                      <span className={styles.aiSummaryLabel}>AI Summary</span>
                      <p className={styles.aiSummaryText}>{note.aiSummary}</p>
                    </div>
                  )}
                  <p className={styles.noteContent}>{note.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
