// API configuration
export const API_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 100,
  rateLimitPublic: 100,    // requests per minute
  rateLimitAuth: 200,
  rateLimitAdmin: 500,
  jwtExpiresIn: '7d',
  otpLength: 6,
  otpExpiresIn: 300,       // seconds
} as const;

// API error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STATE_MACHINE_ERROR: 'STATE_MACHINE_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;
