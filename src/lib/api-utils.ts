/**
 * API Utilities
 *
 * Consistent error handling, logging, and response formatting for API routes.
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { config } from './config';
import { formatZodErrors } from './schemas';

// ============================================
// Error Types
// ============================================

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface ApiErrorResponse {
  code: ErrorCode;
  message: string;
  errors?: Record<string, string>;
  requestId?: string;
}

// ============================================
// Logging
// ============================================

interface LogContext {
  requestId?: string;
  clientId?: string;
  userId?: string;
  [key: string]: unknown;
}

function formatLog(level: string, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(formatLog('INFO', message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatLog('WARN', message, context));
  },

  error(message: string, error?: unknown, context?: LogContext) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;
    console.error(formatLog('ERROR', message, { ...context, error: errorDetails }));
  },

  debug(message: string, context?: LogContext) {
    if (config.features.debugLogging) {
      console.log(formatLog('DEBUG', message, context));
    }
  },

  // Audit log for security-sensitive operations
  audit(action: string, context: LogContext) {
    console.log(formatLog('AUDIT', action, {
      ...context,
      timestamp: Date.now(),
    }));
  },
};

// ============================================
// Response Helpers
// ============================================

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a successful JSON response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  errors?: Record<string, string>,
  requestId?: string
): NextResponse {
  const body: ApiErrorResponse = { code, message };
  if (errors) body.errors = errors;
  if (requestId) body.requestId = requestId;

  return NextResponse.json(body, { status });
}

// Pre-configured error responses
export const errors = {
  validation(errors: Record<string, string>, requestId?: string) {
    return errorResponse('VALIDATION_ERROR', 'Invalid request data', 400, errors, requestId);
  },

  unauthorized(message = 'Authentication required', requestId?: string) {
    return errorResponse('UNAUTHORIZED', message, 401, undefined, requestId);
  },

  forbidden(message = 'Access denied', requestId?: string) {
    return errorResponse('FORBIDDEN', message, 403, undefined, requestId);
  },

  notFound(resource = 'Resource', requestId?: string) {
    return errorResponse('NOT_FOUND', `${resource} not found`, 404, undefined, requestId);
  },

  conflict(message: string, requestId?: string) {
    return errorResponse('CONFLICT', message, 409, undefined, requestId);
  },

  rateLimited(requestId?: string) {
    return errorResponse('RATE_LIMITED', 'Too many requests', 429, undefined, requestId);
  },

  internal(requestId?: string) {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500, undefined, requestId);
  },

  serviceUnavailable(requestId?: string) {
    return errorResponse('SERVICE_UNAVAILABLE', 'Service temporarily unavailable', 503, undefined, requestId);
  },
};

// ============================================
// Error Handler Wrapper
// ============================================

type RouteHandler = (
  request: Request,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Wrap an API route handler with consistent error handling
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const requestId = generateRequestId();

    try {
      logger.debug('API request', {
        requestId,
        method: request.method,
        url: request.url,
      });

      const response = await handler(request, context);

      logger.debug('API response', {
        requestId,
        status: response.status,
      });

      return response;
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        logger.warn('Validation error', { requestId, issues: error.issues });
        return errors.validation(formatZodErrors(error), requestId);
      }

      // Handle known error types
      if (error instanceof Error) {
        logger.error('API error', error, { requestId });

        // Check for specific error messages
        if (error.message.includes('not found')) {
          return errors.notFound('Resource', requestId);
        }
        if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
          return errors.unauthorized(undefined, requestId);
        }
        if (error.message.includes('forbidden') || error.message.includes('Forbidden')) {
          return errors.forbidden(undefined, requestId);
        }
      }

      // Generic internal error
      logger.error('Unhandled API error', error, { requestId });
      return errors.internal(requestId);
    }
  };
}

// ============================================
// Tenant Validation Helper
// ============================================

/**
 * Validate that the requesting user has access to the specified tenant
 */
export function validateTenantAccess(
  sessionClientId: string,
  requestedClientId: string,
  requestId?: string
): NextResponse | null {
  if (sessionClientId !== requestedClientId) {
    logger.audit('Tenant access denied', {
      requestId,
      sessionClientId,
      requestedClientId,
    });
    return errors.forbidden('Access to this resource is not allowed', requestId);
  }
  return null; // Access granted
}
