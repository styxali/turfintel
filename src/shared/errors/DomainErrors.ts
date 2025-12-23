// Base Domain Error
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific Domain Errors
export class RaceNotFoundError extends DomainError {
  constructor(guid: string) {
    super(`Race not found: ${guid}`);
  }
}

export class HorseNotFoundError extends DomainError {
  constructor(slug: string) {
    super(`Horse not found: ${slug}`);
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly fields: Record<string, string>
  ) {
    super(message);
  }
}

export class ExternalApiError extends DomainError {
  constructor(
    message: string,
    public readonly service: string,
    public readonly originalError?: any
  ) {
    super(`${service} API Error: ${message}`);
  }
}

export class CacheError extends DomainError {
  constructor(message: string) {
    super(`Cache Error: ${message}`);
  }
}

export class DatabaseError extends DomainError {
  constructor(message: string, public readonly originalError?: any) {
    super(`Database Error: ${message}`);
  }
}
