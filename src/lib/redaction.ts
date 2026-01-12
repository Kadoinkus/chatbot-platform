import type { AssistantSession, ChatSessionWithAnalysis, Conversation, Message, TranscriptMessage, UserRole } from '@/types';

export function shouldRedactRole(role?: UserRole | null): boolean {
  return role === 'viewer' || role === 'member';
}

export function maskText(value: string): string {
  return value.replace(/[^\s]/g, '*');
}

export function redactTranscript(transcript: TranscriptMessage[] | null): TranscriptMessage[] | null {
  if (!transcript) return transcript;
  return transcript.map((message) => {
    if (message.author !== 'user') return message;
    return { ...message, message: maskText(message.message) };
  });
}

export function redactChatSession(session: ChatSessionWithAnalysis): ChatSessionWithAnalysis {
  const analysis = session.analysis
    ? {
        ...session.analysis,
        raw_response: null,
      }
    : null;

  return {
    ...session,
    full_transcript: redactTranscript(session.full_transcript),
    analysis,
  };
}

export function redactChatSessions(sessions: ChatSessionWithAnalysis[]): ChatSessionWithAnalysis[] {
  return sessions.map((session) => redactChatSession(session));
}

export function redactMessages(messages: Message[]): Message[] {
  return messages.map((message) => {
    if (message.sender !== 'user') return message;
    return { ...message, content: maskText(message.content) };
  });
}

function redactTranscriptString(value: string): string {
  if (!value) return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const redacted = parsed.map((entry) => {
        if (!entry || typeof entry !== 'object') return entry;
        const author = String((entry as { author?: string }).author || '').toLowerCase();
        if (author !== 'user') return entry;
        const message = typeof (entry as { message?: unknown }).message === 'string'
          ? maskText((entry as { message: string }).message)
          : (entry as { message?: unknown }).message;
        return { ...entry, message };
      });
      return JSON.stringify(redacted);
    }
  } catch {}

  return maskText(value);
}

export function redactAssistantSession(session: AssistantSession): AssistantSession {
  return {
    ...session,
    full_transcript: session.full_transcript ? redactTranscriptString(session.full_transcript) : session.full_transcript,
  };
}

export function redactAssistantSessions(sessions: AssistantSession[]): AssistantSession[] {
  return sessions.map((session) => redactAssistantSession(session));
}

export function redactConversations(conversations: Conversation[]): Conversation[] {
  return conversations.map((conversation) => ({
    ...conversation,
    preview: maskText(conversation.preview),
  }));
}
