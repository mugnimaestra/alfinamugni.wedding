import { DatabaseError, ValidationError, RateLimitError } from './database';

// API Error types
export enum ApiErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  SPAM_DETECTED_ERROR = 'SPAM_DETECTED_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR'
}

// API Error interface
export interface ApiError {
  type: ApiErrorType;
  message: string;
  details?: any;
  field?: string;
  code?: string;
  timestamp: string;
  requestId?: string;
}

// Standardized API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  timestamp: string;
  requestId?: string;
}

// Rate limit info interface
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// API Error Handler class
export class ApiErrorHandler {
  private static generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private static createApiError(
    type: ApiErrorType,
    message: string,
    details?: any,
    field?: string,
    code?: string
  ): ApiError {
    return {
      type,
      message,
      details,
      field,
      code,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    };
  }

  // Handle validation errors
  static handleValidationError(error: ValidationError, requestId?: string, jsonFn?: any) {
    const apiError = this.createApiError(
      ApiErrorType.VALIDATION_ERROR,
      error.message,
      undefined,
      error.field,
      'VALIDATION_FAILED'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message: error.message,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(400, response) : { status: 400, body: response };
  }

  // Handle database errors
  static handleDatabaseError(error: DatabaseError, requestId?: string, jsonFn?: any) {
    const apiError = this.createApiError(
      ApiErrorType.DATABASE_ERROR,
      'Unable to process your request at this time. Please try again later.',
      {
        operation: error.operation,
        originalMessage: error.message
      },
      undefined,
      'DATABASE_ERROR'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message: 'Database operation failed. Please try again later.',
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(500, response) : { status: 500, body: response };
  }

  // Handle rate limit errors
  static handleRateLimitError(
    error: RateLimitError,
    rateLimitInfo?: RateLimitInfo,
    requestId?: string,
    jsonFn?: any
  ) {
    const apiError = this.createApiError(
      ApiErrorType.RATE_LIMIT_ERROR,
      error.message,
      {
        retryAfter: error.retryAfter
      },
      undefined,
      'RATE_LIMIT_EXCEEDED'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message: error.message,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (rateLimitInfo) {
      headers['X-RateLimit-Limit'] = rateLimitInfo.limit.toString();
      headers['X-RateLimit-Remaining'] = rateLimitInfo.remaining.toString();
      headers['X-RateLimit-Reset'] = rateLimitInfo.resetTime.toString();
      
      if (rateLimitInfo.retryAfter) {
        headers['Retry-After'] = rateLimitInfo.retryAfter.toString();
      }
    }

    if (jsonFn) {
      // If json function is available, use it for simple responses
      return jsonFn(429, response);
    }

    // Otherwise return a Response object
    return new global.Response(JSON.stringify(response), {
      status: 429,
      headers
    });
  }

  // Handle authentication errors
  static handleAuthenticationError(message = 'Authentication required', requestId?: string, jsonFn?: any) {
    const apiError = this.createApiError(
      ApiErrorType.AUTHENTICATION_ERROR,
      message,
      undefined,
      undefined,
      'AUTHENTICATION_REQUIRED'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(401, response) : { status: 401, body: response };
  }

  // Handle authorization errors
  static handleAuthorizationError(message = 'Insufficient permissions', requestId?: string, jsonFn?: any) {
    const apiError = this.createApiError(
      ApiErrorType.AUTHORIZATION_ERROR,
      message,
      undefined,
      undefined,
      'INSUFFICIENT_PERMISSIONS'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(403, response) : { status: 403, body: response };
  }

  // Handle not found errors
  static handleNotFoundError(resource = 'Resource', requestId?: string, jsonFn?: any) {
    const apiError = this.createApiError(
      ApiErrorType.NOT_FOUND_ERROR,
      `${resource} not found`,
      undefined,
      undefined,
      'NOT_FOUND'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message: `${resource} not found`,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(404, response) : { status: 404, body: response };
  }

  // Handle conflict errors
  static handleConflictError(message = 'Resource conflict', details?: any, requestId?: string, jsonFn?: any) {
    const apiError = this.createApiError(
      ApiErrorType.CONFLICT_ERROR,
      message,
      details,
      undefined,
      'CONFLICT'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(409, response) : { status: 409, body: response };
  }

  // Handle spam detected errors
  static handleSpamDetectedError(
    message = 'Content flagged as spam',
    spamDetails?: any,
    requestId?: string,
    jsonFn?: any
  ) {
    const apiError = this.createApiError(
      ApiErrorType.SPAM_DETECTED_ERROR,
      message,
      spamDetails,
      undefined,
      'SPAM_DETECTED'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(400, response) : { status: 400, body: response };
  }

  // Handle bad request errors
  static handleBadRequestError(
    message = 'Bad request',
    details?: any,
    requestId?: string,
    jsonFn?: any
  ) {
    const apiError = this.createApiError(
      ApiErrorType.BAD_REQUEST_ERROR,
      message,
      details,
      undefined,
      'BAD_REQUEST'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(400, response) : { status: 400, body: response };
  }

  // Handle internal server errors
  static handleInternalServerError(
    error: Error,
    requestId?: string,
    includeStackTrace = false,
    jsonFn?: any
  ) {
    const apiError = this.createApiError(
      ApiErrorType.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred. Please try again later.',
      includeStackTrace ? {
        message: error.message,
        stack: error.stack
      } : {
        message: error.message
      },
      undefined,
      'INTERNAL_SERVER_ERROR'
    );

    if (requestId) {
      apiError.requestId = requestId;
    }

    const response: ApiResponse = {
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.',
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(500, response) : { status: 500, body: response };
  }

  // Generic error handler - routes errors to appropriate handlers
  static handleError(
    error: any,
    requestId?: string,
    rateLimitInfo?: RateLimitInfo,
    jsonFn?: any
  ) {
    // If it's already a Response, return it
    if (error && typeof error === 'object' && 'status' in error) {
      return error;
    }

    // Handle known error types
    if (error instanceof ValidationError) {
      return this.handleValidationError(error, requestId, jsonFn);
    }

    if (error instanceof DatabaseError) {
      return this.handleDatabaseError(error, requestId, jsonFn);
    }

    if (error instanceof RateLimitError) {
      return this.handleRateLimitError(error, rateLimitInfo, requestId, jsonFn);
    }

    // Handle error objects with type property
    if (error && error.type && Object.values(ApiErrorType).includes(error.type)) {
      switch (error.type) {
        case ApiErrorType.VALIDATION_ERROR:
          return this.handleValidationError(error, requestId, jsonFn);
        case ApiErrorType.DATABASE_ERROR:
          return this.handleDatabaseError(error, requestId, jsonFn);
        case ApiErrorType.RATE_LIMIT_ERROR:
          return this.handleRateLimitError(error, rateLimitInfo, requestId, jsonFn);
        case ApiErrorType.AUTHENTICATION_ERROR:
          return this.handleAuthenticationError(error.message, requestId, jsonFn);
        case ApiErrorType.AUTHORIZATION_ERROR:
          return this.handleAuthorizationError(error.message, requestId, jsonFn);
        case ApiErrorType.NOT_FOUND_ERROR:
          return this.handleNotFoundError(error.message, requestId, jsonFn);
        case ApiErrorType.CONFLICT_ERROR:
          return this.handleConflictError(error.message, error.details, requestId, jsonFn);
        case ApiErrorType.SPAM_DETECTED_ERROR:
          return this.handleSpamDetectedError(error.message, error.details, requestId, jsonFn);
        case ApiErrorType.BAD_REQUEST_ERROR:
          return this.handleBadRequestError(error.message, error.details, requestId, jsonFn);
        default:
          return this.handleInternalServerError(error, requestId, false, jsonFn);
      }
    }

    // Handle generic Error
    if (error instanceof Error) {
      return this.handleInternalServerError(error, requestId, false, jsonFn);
    }

    // Handle unknown error types
    return this.handleInternalServerError(
      new Error('Unknown error occurred'),
      requestId,
      false,
      jsonFn
    );
  }

  // Create success response
  static createSuccessResponse<T>(
    data: T,
    message = 'Operation successful',
    statusCode = 200,
    requestId?: string,
    jsonFn?: any
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId
    };

    return jsonFn ? jsonFn(statusCode, response) : { status: statusCode, body: response };
  }

  // Create success response with rate limit headers
  static createSuccessResponseWithRateLimit<T>(
    data: T,
    message = 'Operation successful',
    rateLimitInfo: RateLimitInfo,
    statusCode = 200,
    requestId?: string,
    jsonFn?: any
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
      'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
      'X-RateLimit-Reset': rateLimitInfo.resetTime.toString()
    };

    if (rateLimitInfo.retryAfter) {
      headers['Retry-After'] = rateLimitInfo.retryAfter.toString();
    }

    if (jsonFn) {
      return jsonFn(statusCode, response);
    }

    return new global.Response(JSON.stringify(response), {
      status: statusCode,
      headers
    });
  }
}

// Utility function to generate request ID
export function generateRequestId(): string {
  return ApiErrorHandler['generateRequestId']();
}

// Middleware wrapper for API routes
export function withApiErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const requestId = generateRequestId();
    
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`API Error [${requestId}]:`, error);
      throw ApiErrorHandler.handleError(error, requestId);
    }
  };
}