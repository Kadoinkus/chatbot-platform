/**
 * Database Layer Types
 *
 * Defines the interface that both mock and Supabase implementations must follow.
 * This ensures we can swap implementations without changing consuming code.
 */

import type {
  Client,
  Bot,
  Workspace,
  User,
  Conversation,
  Message,
  Session,
  BotSession,
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
  csat: number;
}

export interface BotMetricsResult {
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

// Bot operations
export interface BotOperations {
  getAll(): Promise<Bot[]>;
  getById(id: string): Promise<Bot | null>;
  getByClientId(clientId: string): Promise<Bot[]>;
  getByWorkspaceId(workspaceId: string): Promise<Bot[]>;
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
  getByBotId(botId: string): Promise<Conversation[]>;
}

// Message operations
export interface MessageOperations {
  getByConversationId(conversationId: string): Promise<Message[]>;
}

// Session operations
export interface SessionOperations {
  getByClientId(clientId: string): Promise<Session[]>;
  getActiveByClientId(clientId: string): Promise<Session[]>;
  getBotSessions(botId: string, dateRange?: DateRange): Promise<BotSession[]>;
  getBotSessionsByClientId(clientId: string, dateRange?: DateRange): Promise<BotSession[]>;
}

// Metrics operations
export interface MetricsOperations {
  getClientMetrics(clientId: string): Promise<ClientMetrics>;
  getBotMetrics(botId: string): Promise<BotMetricsResult>;
}

// Complete database client interface
export interface DbClient {
  clients: ClientOperations;
  bots: BotOperations;
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
  bots: BotOperations;
  workspaces: WorkspaceOperations;
  users: UserOperations;
  conversations: ConversationOperations;
  messages: MessageOperations;
  sessions: SessionOperations;
  metrics: MetricsOperations;
}
