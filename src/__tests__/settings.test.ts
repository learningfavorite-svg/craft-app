import { saveSettings, getSettings } from '../lib/database';

describe('Settings persistence', () => {
  beforeEach(() => localStorage.clear());

  test('getSettings returns defaults when nothing saved', () => {
    const s = getSettings();
    expect(s.model).toBe('claude-sonnet-4-6');
    expect(s.language).toBe('en');
    expect(s.anthropicApiKey).toBe('');
  });

  test('saveSettings and getSettings round-trip', () => {
    saveSettings({ anthropicApiKey: 'sk-ant-test', model: 'claude-opus-4-6', language: 'ar' });
    const s = getSettings();
    expect(s.anthropicApiKey).toBe('sk-ant-test');
    expect(s.model).toBe('claude-opus-4-6');
    expect(s.language).toBe('ar');
  });

  test('partial update preserves other fields', () => {
    saveSettings({ anthropicApiKey: 'sk-ant-123', model: 'claude-sonnet-4-6', language: 'en' });
    const current = getSettings();
    saveSettings({ ...current, model: 'claude-haiku-4-5-20251001' });
    const updated = getSettings();
    expect(updated.anthropicApiKey).toBe('sk-ant-123');
    expect(updated.model).toBe('claude-haiku-4-5-20251001');
  });
});
