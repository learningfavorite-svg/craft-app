'use client';

import { useState, useCallback } from 'react';
import { analyzeLabReport } from '@/lib/hf-service';
import type { MedicalEntity } from '@/lib/hf-service';
import { getSettings } from '@/lib/database';
import styles from './LabReport.module.css';

interface LabReportProps {
  onBack: () => void;
  onOpenSettings: () => void;
}

const ENTITY_COLORS: Record<string, string> = {
  Disease:     '#e8335a',
  Chemical:    '#2D7DD2',
  Gene:        '#0F9B8E',
  Protein:     '#C9954A',
  Organism:    '#7c3aed',
  CellLine:    '#0F9B8E',
  CellType:    '#059669',
  DNAMutation: '#dc2626',
  default:     '#6B7A99',
};

const SAMPLE_REPORT = `Patient: Ahmed Al-Rashid, 42M
CBC Results:
- Hemoglobin: 10.2 g/dL (Low)
- WBC: 11,500/μL (Elevated)
- Platelets: 145,000/μL (Normal)
- Glucose: 7.8 mmol/L (Elevated)
Impression: Mild anemia, leukocytosis noted. Consider iron deficiency.
Elevated glucose consistent with diabetes mellitus type 2.
Recommend: Ferritin, serum iron, HbA1c follow-up.`;

export default function LabReport({ onBack, onOpenSettings }: LabReportProps) {
  const [text, setText] = useState('');
  const [entities, setEntities] = useState<MedicalEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const getToken = useCallback((): string => {
    try { return getSettings().huggingFaceToken || ''; } catch { return ''; }
  }, []);

  const handleAnalyze = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Add your Hugging Face token in Settings to enable lab report analysis.');
      return;
    }
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setEntities([]);
    setAnalyzed(false);

    try {
      const results = await analyzeLabReport(text, token);
      setEntities(results);
      setAnalyzed(true);
      if (results.length === 0) {
        setError('No medical entities detected. Try a more detailed report.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. The model may be loading — try again in 20s.');
    } finally {
      setLoading(false);
    }
  }, [text, getToken]);

  const handleSample = () => {
    setText(SAMPLE_REPORT);
    setEntities([]);
    setAnalyzed(false);
    setError(null);
  };

  const handleClear = () => {
    setText('');
    setEntities([]);
    setAnalyzed(false);
    setError(null);
  };

  const token = getToken();

  // Group entities by type
  const grouped = entities.reduce<Record<string, MedicalEntity[]>>((acc, e) => {
    const key = e.entity;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">←</button>
        <div className={styles.headerIcon}>🔬</div>
        <div className={styles.headerText}>
          <p className={styles.headerTitle}>Lab Report Analyzer</p>
          <p className={styles.headerSub}>Powered by microsoft/BiomedBERT</p>
        </div>
        <button className={styles.settingsBtn} onClick={onOpenSettings} aria-label="Settings">⚙</button>
      </div>

      {!token && (
        <div className={styles.tokenBanner}>
          <span>🤗</span>
          <span>Add your Hugging Face token in Settings to enable AI analysis</span>
          <button className={styles.tokenBannerBtn} onClick={onOpenSettings}>Settings →</button>
        </div>
      )}

      <div className={styles.body}>
        {/* Input section */}
        <div className={styles.inputSection}>
          <div className={styles.inputHeader}>
            <p className={styles.inputLabel}>Paste Lab Report Text</p>
            <div className={styles.inputActions}>
              <button className={styles.actionBtn} onClick={handleSample}>Load Sample</button>
              {text && <button className={styles.actionBtn} onClick={handleClear}>Clear</button>}
            </div>
          </div>
          <textarea
            className={styles.textarea}
            placeholder="Paste CBC, metabolic panel, or any lab report here…"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setAnalyzed(false);
              setEntities([]);
              setError(null);
            }}
            rows={8}
          />
          <button
            className={`${styles.analyzeBtn} ${!text.trim() || loading ? styles.analyzeBtnDisabled : ''}`}
            onClick={handleAnalyze}
            disabled={!text.trim() || loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Analyzing with BiomedBERT…
              </>
            ) : (
              '🔬 Analyze Medical Entities'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {analyzed && entities.length > 0 && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <p className={styles.resultsTitle}>
                🧬 Detected {entities.length} medical entit{entities.length === 1 ? 'y' : 'ies'}
              </p>
              <p className={styles.resultsModel}>microsoft/BiomedNLP-BiomedBERT</p>
            </div>

            {Object.entries(grouped).map(([type, items]) => (
              <div key={type} className={styles.entityGroup}>
                <p
                  className={styles.entityGroupLabel}
                  style={{ color: ENTITY_COLORS[type] ?? ENTITY_COLORS.default }}
                >
                  {type} ({items.length})
                </p>
                <div className={styles.entityChips}>
                  {items.map((e, i) => (
                    <div
                      key={i}
                      className={styles.entityChip}
                      style={{
                        borderColor: ENTITY_COLORS[type] ?? ENTITY_COLORS.default,
                        background: `${ENTITY_COLORS[type] ?? ENTITY_COLORS.default}12`,
                      }}
                    >
                      <span
                        className={styles.entityWord}
                        style={{ color: ENTITY_COLORS[type] ?? ENTITY_COLORS.default }}
                      >
                        {e.word}
                      </span>
                      <span className={styles.entityScore}>
                        {(e.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className={styles.disclaimer}>
              <span>ℹ</span>
              AI-extracted entities are for informational purposes only.
              Always consult a qualified healthcare provider.
            </div>
          </div>
        )}

        {analyzed && entities.length === 0 && !error && (
          <div className={styles.emptyResult}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>No entities above confidence threshold detected.</p>
            <p className={styles.emptyHint}>Try a more detailed clinical report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
