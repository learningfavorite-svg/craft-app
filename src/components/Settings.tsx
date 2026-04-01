'use client';

import { useState } from 'react';
import type { AppSettings } from '@/lib/types';
import { initializeClient, isReady } from '@/lib/ai-service';
import styles from './Settings.module.css';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onBack: () => void;
}

const MODELS = [
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 — Most capable' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 — Balanced' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 — Fastest' },
];

export default function Settings({ settings, onSave, onBack }: SettingsProps) {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [showKey, setShowKey] = useState(false);
  const [showHfKey, setShowHfKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const connected = isReady();
  const hfConnected = !!form.huggingFaceToken;

  const handleSave = () => {
    onSave(form);
    initializeClient(form.anthropicApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className={styles.headerIcon}>⚙</div>
        <div className={styles.headerText}>
          <p className={styles.headerTitle}>Settings</p>
          <p className={styles.headerSub}>Configure HMG AI Platform</p>
        </div>
      </div>

      <div className={styles.body}>
        {/* Anthropic AI */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>🤖</div>
            <span className={styles.sectionTitle}>Anthropic AI</span>
            <div
              className={`${styles.statusBadge} ${
                connected ? styles.statusConnected : styles.statusDisconnected
              }`}
            >
              <span className={styles.statusDot} />
              {connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.field}>
              <label className={styles.label}>API Key</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk-ant-api03-..."
                  value={form.anthropicApiKey}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, anthropicApiKey: e.target.value }))
                  }
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  className={styles.eyeBtn}
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  type="button"
                >
                  {showKey ? '🙈' : '👁'}
                </button>
              </div>
              <p className={styles.hint}>
                Get your key at{' '}
                <span className={styles.hintLink}>console.anthropic.com</span>
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Model</label>
              <select
                className={styles.select}
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hugging Face */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>🤗</div>
            <span className={styles.sectionTitle}>Hugging Face</span>
            <div
              className={`${styles.statusBadge} ${
                hfConnected ? styles.statusConnected : styles.statusDisconnected
              }`}
            >
              <span className={styles.statusDot} />
              {hfConnected ? 'Token set' : 'Not set'}
            </div>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.field}>
              <label className={styles.label}>Access Token</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type={showHfKey ? 'text' : 'password'}
                  placeholder="hf_..."
                  value={form.huggingFaceToken}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, huggingFaceToken: e.target.value }))
                  }
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  className={styles.eyeBtn}
                  onClick={() => setShowHfKey((v) => !v)}
                  aria-label={showHfKey ? 'Hide token' : 'Show token'}
                  type="button"
                >
                  {showHfKey ? '🙈' : '👁'}
                </button>
              </div>
              <p className={styles.hint}>
                Enables voice input (Whisper), symptom NER (Bio_ClinicalBERT),
                Arabic NLP (AraBERT), and lab report analysis (BiomedBERT).
                Get token at{' '}
                <span className={styles.hintLink}>huggingface.co/settings/tokens</span>
              </p>
            </div>
            <div className={styles.hfModels}>
              {[
                { icon: '🎙', name: 'Whisper-large-v3', desc: 'Voice to text' },
                { icon: '🧬', name: 'Bio_ClinicalBERT', desc: 'Symptom NER' },
                { icon: '🌐', name: 'AraBERT', desc: 'Arabic NLP' },
                { icon: '🔬', name: 'BiomedBERT', desc: 'Lab reports' },
              ].map((m) => (
                <div key={m.name} className={styles.hfModelChip}>
                  <span>{m.icon}</span>
                  <span className={styles.hfModelName}>{m.name}</span>
                  <span className={styles.hfModelDesc}>{m.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Language */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>🌐</div>
            <span className={styles.sectionTitle}>Language</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.field}>
              <div className={styles.langToggle}>
                <button
                  className={`${styles.langBtn} ${
                    form.language === 'en' ? styles.langBtnActive : ''
                  }`}
                  onClick={() => setForm((f) => ({ ...f, language: 'en' }))}
                  type="button"
                >
                  EN — English
                </button>
                <button
                  className={`${styles.langBtn} ${
                    form.language === 'ar' ? styles.langBtnActive : ''
                  }`}
                  onClick={() => setForm((f) => ({ ...f, language: 'ar' }))}
                  type="button"
                >
                  AR — العربية
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>ℹ</div>
            <span className={styles.sectionTitle}>App Info</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.appInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Version</span>
                <span className={styles.infoValue}>1.1.0</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Platform</span>
                <span className={styles.infoValue}>Windows Desktop</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Provider</span>
                <span className={styles.infoValue}>HMG Healthcare Group</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>AI Models</span>
                <span className={styles.infoValue}>Claude + HF Inference</span>
              </div>
            </div>
          </div>
        </div>

        {saved ? (
          <div className={styles.saveSuccess}>✓ Settings saved successfully</div>
        ) : (
          <button className={`btn-primary ${styles.saveBtn}`} onClick={handleSave}>
            Save Settings
          </button>
        )}
      </div>
    </div>
  );
}
