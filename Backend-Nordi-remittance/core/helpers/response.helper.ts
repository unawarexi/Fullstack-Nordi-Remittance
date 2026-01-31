// ============================================================================
// RESPONSE HELPER UTILITIES
// ============================================================================

import { Response } from 'express';
import { HttpStatus } from '../../config/env.config.js';
import type { ApiResponse, PaginatedResponse, ResponseMeta } from '../../types/index.js';

// ============================================================================
// SUCCESS RESPONSES
// ============================================================================

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = HttpStatus.OK,
  meta?: ResponseMeta
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully',
  meta?: ResponseMeta
): Response {
  return sendSuccess(res, data, message, HttpStatus.CREATED, meta);
}

export function sendNoContent(res: Response): Response {
  return res.status(HttpStatus.NO_CONTENT).send();
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message: string = 'Success'
): Response {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    message,
    data: {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasMore: pagination.page < totalPages,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
      },
    },
  };
  return res.status(HttpStatus.OK).json(response);
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export function sendError(
  res: Response,
  message: string,
  code: string,
  statusCode: number = HttpStatus.BAD_REQUEST,
  details?: Record<string, unknown>
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
}

export function sendValidationError(
  res: Response,
  errors: Array<{ field: string; message: string }>,
  message: string = 'Validation failed'
): Response {
  return sendError(res, message, 'VALIDATION_ERROR', HttpStatus.BAD_REQUEST, { errors });
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized access'
): Response {
  return sendError(res, message, 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
}

export function sendForbidden(
  res: Response,
  message: string = 'Access forbidden'
): Response {
  return sendError(res, message, 'FORBIDDEN', HttpStatus.FORBIDDEN);
}

export function sendNotFound(
  res: Response,
  resource: string = 'Resource',
  message?: string
): Response {
  return sendError(
    res,
    message || `${resource} not found`,
    'NOT_FOUND',
    HttpStatus.NOT_FOUND
  );
}

export function sendConflict(
  res: Response,
  message: string = 'Resource already exists'
): Response {
  return sendError(res, message, 'CONFLICT', HttpStatus.CONFLICT);
}

export function sendTooManyRequests(
  res: Response,
  retryAfter?: number,
  message: string = 'Rate limit exceeded'
): Response {
  if (retryAfter) {
    res.setHeader('Retry-After', retryAfter);
  }
  return sendError(res, message, 'RATE_LIMIT_EXCEEDED', HttpStatus.TOO_MANY_REQUESTS, { retryAfter });
}

export function sendInternalError(
  res: Response,
  message: string = 'An unexpected error occurred'
): Response {
  return sendError(res, message, 'INTERNAL_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
}

// ============================================================================
// RESPONSE BUILDER CLASS
// ============================================================================

export class ResponseBuilder {
  private res: Response;

  constructor(res: Response) {
    this.res = res;
  }

  success<T>(data: T, message?: string, meta?: ResponseMeta): Response {
    return sendSuccess(this.res, data, message, HttpStatus.OK, meta);
  }

  created<T>(data: T, message?: string): Response {
    return sendCreated(this.res, data, message);
  }

  noContent(): Response {
    return sendNoContent(this.res);
  }

  paginated<T>(
    data: T[],
    pagination: { page: number; limit: number; total: number },
    message?: string
  ): Response {
    return sendPaginated(this.res, data, pagination, message);
  }

  error(
    message: string,
    code: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ): Response {
    return sendError(this.res, message, code, statusCode, details);
  }

  unauthorized(message?: string): Response {
    return sendUnauthorized(this.res, message);
  }

  forbidden(message?: string): Response {
    return sendForbidden(this.res, message);
  }

  notFound(resource?: string, message?: string): Response {
    return sendNotFound(this.res, resource, message);
  }

  validationError(errors: Array<{ field: string; message: string }>): Response {
    return sendValidationError(this.res, errors);
  }

  static from(res: Response): ResponseBuilder {
    return new ResponseBuilder(res);
  }
}

export default {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendTooManyRequests,
  sendInternalError,
  ResponseBuilder,
};
