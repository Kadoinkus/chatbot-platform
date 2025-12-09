/**
 * Database Layer Types
 *
 * Defines the interface that both mock and Supabase implementations must follow.
 * This ensures we can swap implementations without changing consuming code.
 */

import type {
  Client,
  Assistant,
  Workspace,
  User,
  Conversation,
  Message,
  Session,
  AssistantSession,
  UsageData,
  IntentData,
} from '@/types';

// Date range filter used by multiple queries
export interface DateRange {
  start: Date;
  end: Date;
}

// Metrics result types
export interface ClientMetrics {
  usageByDay: UsageData[];
  topIntents: IntentData[];
}

export interface AssistantMetricsResult {
  usageByDay: UsageData[];
  topIntents: IntentData[];
}

// Client operations
export interface ClientOperations {
  getAll(): Promise<Client[]>;
  getById(id: string): Promise<Client | null>;
  getBySlug(slug: string): Promise<Client | null>;
  getByIdOrSlug(idOrSlug: string): Promise<Client | null>;
  resolveId(idOrSlug: string): Promise<string | null>;
}

// Assistant operations
export interface AssistantOperations {
  getAll(): Promise<Assistant[]>;
  getById(id: string): Promise<Assistant | null>;
  getByClientId(clientId: string): Promise<Assistant[]>;
  getByWorkspaceId(workspaceId: string): Promise<Assistant[]>;
}

// Workspace operations
export interface WorkspaceOperations {
  getAll(): Promise<Workspace[]>;
  getById(id: string): Promise<Workspace | null>;
  getByClientId(clientId: string): Promise<Workspace[]>;
}

// User operations
export interface UserOperations {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  getByClientId(clientId: string): Promise<User[]>;
}

// Conversation operations
export interface ConversationOperations {
  getAll(): Promise<Conversation[]>;
  getById(id: string): Promise<Conversation | null>;
  getByClientId(clientId: string): Promise<Conversation[]>;
  getByAssistantId(assistantId: string): Promise<Conversation[]>;
}

// Message operations
export interface MessageOperations {
  getByConversationId(conversationId: string): Promise<Message[]>;
}

// Session operations
export interface SessionOperations {
  getByClientId(clientId: string): Promise<Session[]>;
  getActiveByClientId(clientId: string): Promise<Session[]>;
  getAssistantSessions(assistantId: string, dateRange?: DateRange): Promise<AssistantSession[]>;
  getAssistantSessionsByClientId(clientId: string, dateRange?: DateRange): Promise<AssistantSession[]>;
}

// Metrics operations
export interface MetricsOperations {
  getClientMetrics(clientId: string): Promise<ClientMetrics>;
  getAssistantMetrics(assistantId: string): Promise<AssistantMetricsResult>;
}

// Complete database client interface
export interface DbClient {
  clients: ClientOperations;
  assistants: AssistantOperations;
  workspaces: WorkspaceOperations;
  users: UserOperations;
  conversations: ConversationOperations;
  messages: MessageOperations;
  sessions: SessionOperations;
  metrics: MetricsOperations;
}

// Type for the full database operations export
export interface DbOperations {
  clients: ClientOperations;
  assistants: AssistantOperations;
  workspaces: WorkspaceOperations;
  users: UserOperations;
  conversations: ConversationOperations;
  messages: MessageOperations;
  sessions: SessionOperations;
  metrics: MetricsOperations;
}
