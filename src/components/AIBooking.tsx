'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, Doctor, TimeSlot, Appointment } from '@/lib/types';
import { bookingChat, isReady } from '@/lib/ai-service';
import { addAppointment, getDoctors, getSettings } from '@/lib/database';
import {
  parseSymptoms,
  transcribeAudio,
  isArabicText,
  processArabicText,
} from '@/lib/hf-service';
import type { MedicalEntity } from '@/lib/hf-service';
import { v4 as uuidv4 } from 'uuid';
import styles from './AIBooking.module.css';

interface AIBookingProps {
  onBack: () => void;
  onOpenSettings: () => void;
}

const SUGGESTIONS = [
  { label: 'Cardiologist', emoji: '🫀' },
  { label: 'Neurologist', emoji: '🧠' },
  { label: 'Orthopedic', emoji: '🦴' },
  { label: 'Ophthalmologist', emoji: '👁️' },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-1',
  role: 'assistant',
  content:
    "Hello! I'm HMG AI Assistant, here to help you book the right doctor. Could you tell me about your health concern or which specialist you're looking for?",
  timestamp: new Date(),
};

export default function AIBooking({ onBack, onOpenSettings }: AIBookingProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hfStatus, setHfStatus] = useState<string | null>(null);
  const [detectedEntities, setDetectedEntities] = useState<MedicalEntity[]>([]);
  const [isRTL, setIsRTL] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Detect RTL based on input text
  useEffect(() => {
    setIsRTL(isArabicText(input));
  }, [input]);

  const getHfToken = useCallback((): string => {
    try {
      return getSettings().huggingFaceToken || '';
    } catch {
      return '';
    }
  }, []);

  // ── Voice recording (Whisper) ───────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    const token = getHfToken();
    if (!token) {
      setHfStatus('Add Hugging Face token in Settings to use voice input');
      setTimeout(() => setHfStatus(null), 3000);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setHfStatus('Transcribing with Whisper-large-v3…');
        try {
          const text = await transcribeAudio(blob, token);
          if (text) {
            setInput(text);
            setHfStatus(`Whisper: "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`);
          } else {
            setHfStatus('No speech detected');
          }
        } catch (e) {
          setHfStatus(`Whisper error: ${e instanceof Error ? e.message : 'unknown'}`);
        }
        setTimeout(() => setHfStatus(null), 4000);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setHfStatus('Recording… tap again to stop');
    } catch {
      setHfStatus('Microphone access denied');
      setTimeout(() => setHfStatus(null), 3000);
    }
  }, [getHfToken]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  const handleMic = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  // ── Send message (with Bio_ClinicalBERT + AraBERT enrichment) ──────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const token = getHfToken();
      let enrichedText = text.trim();
      let entities: MedicalEntity[] = [];

      // AraBERT: handle Arabic RTL text
      if (isArabicText(text) && token) {
        const { processed } = await processArabicText(text, token);
        enrichedText = processed;
      }

      // Bio_ClinicalBERT: extract symptom entities to enrich Claude prompt
      if (token) {
        try {
          entities = await parseSymptoms(enrichedText, token);
          setDetectedEntities(entities);
          if (entities.length > 0) {
            const entityStr = entities.map((e) => `${e.word} (${e.entity})`).join(', ');
            enrichedText = `${enrichedText}\n[Detected medical entities: ${entityStr}]`;
          }
        } catch {
          // Fallback silently — proceed without NER
        }
      }

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: text.trim(), // show original text in UI
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      const history = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const doctors = getDoctors();

      try {
        const result = await bookingChat(history, enrichedText, doctors);

        const aiMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
          slots: result.slots,
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (result.suggestedDoctor) {
          setCurrentDoctor(result.suggestedDoctor);
          setSlots(result.slots || []);
          setSelectedSlot(null);
          setConfirmed(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, getHfToken]
  );

  const handleConfirm = useCallback(() => {
    if (!currentDoctor || !selectedSlot || confirmed) return;

    const today = new Date();
    const dateStr = new Date(today.getTime() + 86400000)
      .toISOString()
      .split('T')[0];

    const appointment: Appointment = {
      id: uuidv4(),
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      specialty: currentDoctor.specialty,
      date: dateStr,
      time: selectedSlot,
      status: 'upcoming',
    };

    addAppointment(appointment);
    setConfirmed(true);
    setDetectedEntities([]);

    const confirmMsg: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `Your appointment with ${currentDoctor.name} (${currentDoctor.specialty}) has been confirmed for ${selectedSlot} tomorrow. You'll receive a reminder before your appointment. Is there anything else I can help you with?`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);
    setCurrentDoctor(null);
    setSlots([]);
    setSelectedSlot(null);
  }, [currentDoctor, selectedSlot, confirmed]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const aiReady = isReady();
  const hfToken = getHfToken();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className={styles.aiOrb}>✦</div>
        <div className={styles.headerInfo}>
          <p className={styles.headerTitle}>HMG AI Assistant</p>
          <p className={styles.headerSub}>
            Claude · {hfToken ? 'Whisper · Bio_ClinicalBERT · AraBERT' : 'Add HF token for voice & NER'}
          </p>
        </div>
        <button className={styles.settingsBtn} onClick={onOpenSettings} aria-label="Settings">
          ⚙
        </button>
      </div>

      <div className={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            className={styles.pill}
            onClick={() => sendMessage(s.label)}
            disabled={loading}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* HF status bar */}
      {hfStatus && (
        <div className={styles.hfStatusBar}>
          <span className={styles.hfStatusDot} />
          {hfStatus}
        </div>
      )}

      {/* Detected entities strip */}
      {detectedEntities.length > 0 && (
        <div className={styles.entitiesStrip}>
          <span className={styles.entitiesLabel}>🧬 Bio_ClinicalBERT:</span>
          {detectedEntities.map((e, i) => (
            <span key={i} className={styles.entityChip}>
              {e.word}
              <span className={styles.entityType}>{e.entity}</span>
            </span>
          ))}
        </div>
      )}

      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.msgRow} ${
              msg.role === 'user' ? styles.msgRowUser : styles.msgRowAI
            }`}
          >
            {msg.role === 'assistant' && (
              <div className={styles.msgAvatarSmall}>✦</div>
            )}
            <div>
              <div
                className={`${styles.bubble} ${
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI
                }`}
                dir={isArabicText(msg.content) ? 'rtl' : 'ltr'}
              >
                {msg.content}
              </div>
              <div className={styles.timestamp}>{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.msgRow} ${styles.msgRowAI}`}>
            <div className={styles.msgAvatarSmall}>✦</div>
            <div className={`${styles.bubble} ${styles.bubbleAI}`}>
              <div className={styles.loadingDots}>
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
              </div>
            </div>
          </div>
        )}

        {currentDoctor && slots.length > 0 && (
          <div className={`${styles.msgRow} ${styles.msgRowAI}`}>
            <div className={styles.msgAvatarSmall}>✦</div>
            <div>
              <div className={`${styles.bubble} ${styles.bubbleAI}`}>
                <div className={styles.doctorCard}>
                  <div className={styles.doctorCardHeader}>
                    <div
                      className={styles.doctorCardAvatar}
                      style={{ background: currentDoctor.avatarColor }}
                    >
                      {currentDoctor.avatar}
                    </div>
                    <div>
                      <p className={styles.doctorCardName}>{currentDoctor.name}</p>
                      <p className={styles.doctorCardSpec}>
                        {currentDoctor.specialty} · {currentDoctor.hospital}
                      </p>
                    </div>
                    <span className={styles.doctorCardRating}>
                      ★ {currentDoctor.rating}
                    </span>
                  </div>

                  <p className={styles.slotsLabel}>Select a time slot</p>
                  <div className={styles.slotsGrid}>
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        className={`${styles.slot} ${
                          !slot.available ? styles.slotDisabled : ''
                        } ${selectedSlot === slot.time ? styles.slotSelected : ''}`}
                        onClick={() =>
                          slot.available && setSelectedSlot(slot.time)
                        }
                        disabled={!slot.available}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        {currentDoctor && selectedSlot && (
          <button className={`btn-teal ${styles.confirmBtn}`} onClick={handleConfirm}>
            Confirm Appointment →
          </button>
        )}
        <div className={styles.inputRow}>
          {/* Microphone button (Whisper) */}
          <button
            className={`${styles.micBtn} ${isRecording ? styles.micBtnActive : ''}`}
            onClick={handleMic}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            title={hfToken ? 'Voice input (Whisper)' : 'Add HF token in Settings'}
          >
            {isRecording ? '⏹' : '🎙'}
          </button>

          <textarea
            ref={inputRef}
            className={styles.textInput}
            placeholder={
              aiReady
                ? 'Describe your symptoms or ask for a specialist… (EN/AR)'
                : 'Add API key in Settings to enable AI…'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <button
            className={`${styles.sendBtn} ${
              !input.trim() || loading ? styles.sendBtnDisabled : ''
            }`}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
