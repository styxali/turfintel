"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.CacheError = exports.ExternalApiError = exports.ValidationError = exports.HorseNotFoundError = exports.RaceNotFoundError = exports.DomainError = void 0;
// Base Domain Error
class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.DomainError = DomainError;
// Specific Domain Errors
class RaceNotFoundError extends DomainError {
    constructor(guid) {
        super(`Race not found: ${guid}`);
    }
}
exports.RaceNotFoundError = RaceNotFoundError;
class HorseNotFoundError extends DomainError {
    constructor(slug) {
        super(`Horse not found: ${slug}`);
    }
}
exports.HorseNotFoundError = HorseNotFoundError;
class ValidationError extends DomainError {
    constructor(message, fields) {
        super(message);
        this.fields = fields;
    }
}
exports.ValidationError = ValidationError;
class ExternalApiError extends DomainError {
    constructor(message, service, originalError) {
        super(`${service} API Error: ${message}`);
        this.service = service;
        this.originalError = originalError;
    }
}
exports.ExternalApiError = ExternalApiError;
class CacheError extends DomainError {
    constructor(message) {
        super(`Cache Error: ${message}`);
    }
}
exports.CacheError = CacheError;
class DatabaseError extends DomainError {
    constructor(message, originalError) {
        super(`Database Error: ${message}`);
        this.originalError = originalError;
    }
}
exports.DatabaseError = DatabaseError;
//# sourceMappingURL=DomainErrors.js.map