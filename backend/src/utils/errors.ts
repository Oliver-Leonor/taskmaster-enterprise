// backend/src/utils/errors.ts
export type ErrorDetails = Record<string, unknown> | unknown[];

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;

  constructor(opts: {
    message: string;
    statusCode: number;
    code: string;
    details?: ErrorDetails;
  }) {
    super(opts.message);
    this.statusCode = opts.statusCode;
    this.code = opts.code;
    this.details = opts.details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: ErrorDetails) {
    super({ message, statusCode: 400, code: "VALIDATION_ERROR", details });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super({ message, statusCode: 401, code: "AUTHENTICATION_ERROR" });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Not allowed") {
    super({ message, statusCode: 403, code: "AUTHORIZATION_ERROR" });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({ message, statusCode: 404, code: "NOT_FOUND" });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super({ message, statusCode: 409, code: "CONFLICT" });
  }
}
