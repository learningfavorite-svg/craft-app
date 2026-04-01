import Anthropic from '@anthropic-ai/sdk';
import { AGENT_TOOLS, AGENT_SYSTEM_PROMPT } from './agent-tools';
import { executeTool } from './tool-executor';

let client: Anthropic | null = null;

export function initializeClient(apiKey: string): void {
  if (!apiKey) { client = null; return; }
  client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

export function isReady(): boolean {
  return client !== null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentToolEvent {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
  status: 'calling' | 'done' | 'error';
}

export interface AgentResponse {
  content: string;
  /** Updated full API history to pass back on next call */
  updatedHistory: ApiMessage[];
}

// Loose type that matches what Anthropic SDK accepts
export type ApiMessage = {
  role: 'user' | 'assistant';
  content: string | unknown[];
};

// ─── Tool display names ───────────────────────────────────────────────────────

export const TOOL_LABELS: Record<string, string> = {
  search_doctors:          'Searching doctors',
  get_availability:        'Checking availability',
  book_appointment:        'Booking appointment',
  get_appointment_history: 'Loading history',
  cancel_appointment:      'Cancelling appointment',
  analyze_symptoms:        'Analyzing symptoms (Bio_ClinicalBERT)',
  analyze_lab_report:      'Analyzing lab report (BiomedBERT)',
};

// ─── Agent chat loop ──────────────────────────────────────────────────────────

const MAX_ITERATIONS = 12;

export async function agentChat(
  /** Full API history from previous turns (including tool calls/results) */
  prevHistory: ApiMessage[],
  userMessage: string,
  hfToken: string,
  onToolEvent: (event: AgentToolEvent) => void
): Promise<AgentResponse> {
  if (!client) {
    return {
      content: 'AI assistant not configured. Please add your Anthropic API key in Settings.',
      updatedHistory: prevHistory,
    };
  }

  // Append user message
  const history: ApiMessage[] = [
    ...prevHistory,
    { role: 'user', content: userMessage },
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: AGENT_SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
      messages: history as Parameters<typeof client.messages.create>[0]['messages'],
    });

    if (response.stop_reason === 'end_turn') {
      // Extract final text
      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => (b.type === 'text' ? b.text : ''))
        .join('');

      // Persist assistant turn
      history.push({ role: 'assistant', content: response.content });

      return { content: text || '(no response)', updatedHistory: history };
    }

    if (response.stop_reason === 'tool_use') {
      // Persist assistant turn (contains tool_use blocks)
      history.push({ role: 'assistant', content: response.content });

      // Execute every tool call in parallel
      const toolResultBlocks: unknown[] = [];

      await Promise.all(
        response.content
          .filter((b) => b.type === 'tool_use')
          .map(async (block) => {
            if (block.type !== 'tool_use') return;

            onToolEvent({ id: block.id, name: block.name, input: block.input as Record<string, unknown>, status: 'calling' });

            let result: unknown;
            try {
              result = await executeTool(block.name, block.input as Record<string, unknown>, hfToken);
              onToolEvent({ id: block.id, name: block.name, input: block.input as Record<string, unknown>, result, status: 'done' });
            } catch (err) {
              result = { error: err instanceof Error ? err.message : 'Tool execution failed' };
              onToolEvent({ id: block.id, name: block.name, input: block.input as Record<string, unknown>, result, status: 'error' });
            }

            toolResultBlocks.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result),
            });
          })
      );

      // Persist tool results as user turn
      history.push({ role: 'user', content: toolResultBlocks });
      continue;
    }

    // Unexpected stop reason
    break;
  }

  return { content: 'Agent reached maximum steps. Please try a simpler request.', updatedHistory: history };
}
