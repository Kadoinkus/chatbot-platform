/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for API request/response validation.
 * These schemas align with the TypeScript types in @/types.
 */

import { z } from 'zod';

// ============================================
// Common schemas
// ============================================

export const IdSchema = z.string().min(1, 'ID is required');

export const SlugSchema = z.string().min(1).regex(/^[a-z0-9-]+$/, 'Invalid slug format');

export const EmailSchema = z.string().email('Invalid email format');

export const DateRangeSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
}).refine(data => data.start <= data.end, {
  message: 'Start date must be before end date',
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// Auth schemas
// ============================================

export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const SessionSchema = z.object({
  clientId: IdSchema,
  clientSlug: SlugSchema,
  userId: IdSchema,
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
  defaultWorkspaceId: IdSchema.optional(),
});

// ============================================
// Client schemas
// ============================================

export const ClientIdOrSlugSchema = z.string().min(1, 'Client ID or slug is required');

// ============================================
// Bot schemas
// ============================================

export const BotStatusSchema = z.enum(['active', 'inactive', 'maintenance', 'error']);

export const CreateBotRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  workspaceId: IdSchema,
  status: BotStatusSchema.default('inactive'),
});

export const UpdateBotRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: BotStatusSchema.optional(),
});

// ============================================
// Workspace schemas
// ============================================

export const PlanTypeSchema = z.enum(['free', 'starter', 'professional', 'enterprise']);

export const CreateWorkspaceRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  plan: PlanTypeSchema.default('free'),
});

// ============================================
// User schemas
// ============================================

export const TeamRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);
export const UserStatusSchema = z.enum(['active', 'invited', 'suspended']);

export const InviteUserRequestSchema = z.object({
  email: EmailSchema,
  role: TeamRoleSchema.default('member'),
  workspaceIds: z.array(IdSchema).optional(),
});

// ============================================
// Conversation schemas
// ============================================

export const ConversationStatusSchema = z.enum(['active', 'resolved', 'pending', 'escalated']);
export const ChannelSchema = z.enum(['web', 'whatsapp', 'telegram', 'slack', 'api']);

export const ConversationFilterSchema = z.object({
  status: ConversationStatusSchema.optional(),
  channel: ChannelSchema.optional(),
  botId: IdSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).merge(PaginationSchema);

// ============================================
// Message schemas
// ============================================

export const MessageSenderSchema = z.enum(['user', 'bot', 'system']);

export const SendMessageRequestSchema = z.object({
  conversationId: IdSchema,
  content: z.string().min(1, 'Message content is required').max(10000),
  sender: MessageSenderSchema.default('user'),
});

// ============================================
// Metrics schemas
// ============================================

export const MetricsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ============================================
// API Response schemas
// ============================================

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
  });

// ============================================
// Helper function for request validation
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Format Zod errors into a user-friendly object
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path || 'root'] = issue.message;
  }
  return errors;
}
