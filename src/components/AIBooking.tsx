'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, AgentToolCall } from '@/lib/types';
import { agentChat, isReady, TOOL_LABELS } from '@/lib/ai-service';
import type { AgentToolEvent, ApiMessage } from '@/lib/ai-service';
import { getSettings } from '@/lib/database';
import { transcribeAudio, isArabicText } from '@/lib/hf-service';
import { v4 as uuidv4 } from 'uuid';
import styles from './AIBooking.module.css';

interface AIBookingProps {
  onBack: () => void;
  onOpenSettings: () => void;
}

const SUGGESTIONS = [
  { label: 'I have chest pain', emoji: '🫀' },
  { label: 'Headache & dizziness', emoji: '🧠' },
  { label: 'My appointments', emoji: '📅' },
  { label: 'Analyze lab report', emoji: '🔬' },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-1',
  role: 'assistant',
  content: "Hello! I'm HMG AI Agent — I can autonomously search doctors, check availability, and book appointments. Just describe your symptoms or tell me what you need.",
  timestamp: new Date(),
};

function ToolLabel({ name }: { name: string }) {
  const icons: Record<string, string> = {
    search_doctors: '🔍',
    get_availability: '📅',
    book_appointment: '✅',
    get_appointment_history: '📋',
    cancel_appointment: '❌',
    analyze_symptoms: '🧬',
    analyze_lab_report: '🔬',
  };
  return (
    <span>
      {icons[name] ?? '⚙'} {TOOL_LABELS[name] ?? name}
    </span>
  );
}

function ToolFeed({ calls }: { calls: AgentToolCall[] }) {
  if (!calls.length) return null;
  return (
    <div className={styles.toolFeed}>
      {calls.map((tc) => (
        <div
          key={tc.id}
          className={`${styles.toolItem} ${
            tc.status === 'done' ? styles.toolDone :
            tc.status === 'error' ? styles.toolError :
            styles.toolCalling
          }`}
        >
          <span className={styles.toolIcon}>
            {tc.status === 'calling' ? <span className={styles.spinnerSm} /> :
             tc.status === 'error' ? '⚠' : '✓'}
          </span>
          <ToolLabel name={tc.name} />
        </div>
      ))}
    </div>
  );
}

export default function AIBooking({ onBack, onOpenSettings }: AIBookingProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCalls, setActiveCalls] = useState<AgentToolCall[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [isRTL, setIsRTL] = useState(false);

  // Full API history (includes tool_use + tool_result blocks) — persisted across turns
  const apiHistoryRef = useRef<ApiMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, activeCalls]);

  useEffect(() => {
    setIsRTL(isArabicText(input));
  }, [input]);

  const getSettings_ = useCallback(() => {
    try { return getSettings(); } catch { return { anthropicApiKey: '', huggingFaceToken: '', model: '', language: 'en' as const }; }
  }, []);

  // ── Voice input (Whisper) ────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    const { huggingFaceToken } = getSettings_();
    if (!huggingFaceToken) {
      setVoiceStatus('Add HF token in Settings for voice input');
      setTimeout(() => setVoiceStatus(null), 3000);
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
        setVoiceStatus('Transcribing with Whisper-large-v3…');
        try {
          const text = await transcribeAudio(blob, huggingFaceToken);
          if (text) {
            setInput(text);
            setVoiceStatus(`"${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`);
          } else {
            setVoiceStatus('No speech detected');
          }
        } catch {
          setVoiceStatus('Whisper error — check HF token');
        }
        setTimeout(() => setVoiceStatus(null), 4000);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setVoiceStatus('Recording… tap again to stop');
    } catch {
      setVoiceStatus('Microphone access denied');
      setTimeout(() => setVoiceStatus(null), 3000);
    }
  }, [getSettings_]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  // ── Send message → agent loop ─────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setActiveCalls([]);
      setLoading(true);

      const { huggingFaceToken } = getSettings_();
      const liveToolCalls: AgentToolCall[] = [];

      const onToolEvent = (event: AgentToolEvent) => {
        const call: AgentToolCall = { ...event };
        const idx = liveToolCalls.findIndex((c) => c.id === event.id);
        if (idx === -1) {
          liveToolCalls.push(call);
        } else {
          liveToolCalls[idx] = call;
        }
        // Trigger re-render with snapshot
        setActiveCalls([...liveToolCalls]);
      };

      try {
        const result = await agentChat(
          apiHistoryRef.current,
          text.trim(),
          huggingFaceToken || '',
          onToolEvent
        );

        // Update persistent API history
        apiHistoryRef.current = result.updatedHistory;

        const aiMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
          toolCalls: liveToolCalls.length > 0 ? [...liveToolCalls] : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const aiMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your API key.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setLoading(false);
        setActiveCalls([]);
      }
    },
    [loading, getSettings_]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const aiReady = isReady();
  const hfToken = getSettings_().huggingFaceToken;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">←</button>
        <div className={styles.aiOrb}>✦</div>
        <div className={styles.headerInfo}>
          <p className={styles.headerTitle}>HMG AI Agent</p>
          <p className={styles.headerSub}>
            Autonomous · 7 tools · {hfToken ? 'Whisper + Bio_ClinicalBERT' : 'Add HF token for NLP'}
          </p>
        </div>
        <button className={styles.settingsBtn} onClick={onOpenSettings} aria-label="Settings">⚙</button>
      </div>

      {/* Quick suggestions */}
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

      {/* Voice status */}
      {voiceStatus && (
        <div className={styles.hfStatusBar}>
          <span className={styles.hfStatusDot} />
          {voiceStatus}
        </div>
      )}

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : styles.msgRowAI}`}
          >
            {msg.role === 'assistant' && <div className={styles.msgAvatarSmall}>✦</div>}
            <div className={styles.msgGroup}>
              {/* Tool feed pinned above the assistant message */}
              {msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
                <ToolFeed calls={msg.toolCalls} />
              )}
              <div
                className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI}`}
                dir={isArabicText(msg.content) ? 'rtl' : 'ltr'}
              >
                {msg.content}
              </div>
              <div className={styles.timestamp}>{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {/* Live agent thinking / tool activity */}
        {loading && (
          <div className={`${styles.msgRow} ${styles.msgRowAI}`}>
            <div className={styles.msgAvatarSmall}>✦</div>
            <div className={styles.msgGroup}>
              {activeCalls.length > 0 && <ToolFeed calls={activeCalls} />}
              <div className={`${styles.bubble} ${styles.bubbleAI}`}>
                {activeCalls.length === 0 ? (
                  <div className={styles.loadingDots}>
                    <span className={styles.loadingDot} />
                    <span className={styles.loadingDot} />
                    <span className={styles.loadingDot} />
                  </div>
                ) : (
                  <span className={styles.agentThinking}>Agent reasoning…</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        <div className={styles.inputRow}>
          <button
            className={`${styles.micBtn} ${isRecording ? styles.micBtnActive : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? 'Stop recording' : 'Voice input'}
            title={hfToken ? 'Voice input — Whisper-large-v3' : 'Add HF token in Settings'}
          >
            {isRecording ? '⏹' : '🎙'}
          </button>
          <textarea
            ref={inputRef}
            className={styles.textInput}
            placeholder={
              aiReady
                ? 'Describe symptoms, ask for a doctor, manage appointments… (EN/AR)'
                : 'Add Anthropic API key in Settings to enable the AI agent…'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <button
            className={`${styles.sendBtn} ${!input.trim() || loading ? styles.sendBtnDisabled : ''}`}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
