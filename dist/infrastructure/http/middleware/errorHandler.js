"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const DomainErrors_1 = require("../../../shared/errors/DomainErrors");
function errorHandler(err, req, res, next) {
    console.error('[ERROR]', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    // Validation errors
    if (err instanceof DomainErrors_1.ValidationError) {
        return res.status(400).json({
            error: true,
            type: 'ValidationError',
            message: err.message,
            fields: err.fields
        });
    }
    // Not found errors
    if (err instanceof DomainErrors_1.RaceNotFoundError || err instanceof DomainErrors_1.HorseNotFoundError) {
        return res.status(404).json({
            error: true,
            type: err.name,
            message: err.message
        });
    }
    // External API errors
    if (err instanceof DomainErrors_1.ExternalApiError) {
        return res.status(502).json({
            error: true,
            type: 'ExternalApiError',
            message: err.message,
            service: err.service
        });
    }
    // Cache errors (non-critical, log but don't fail)
    if (err instanceof DomainErrors_1.CacheError) {
        console.warn('[CACHE ERROR]', err.message);
        return res.status(500).json({
            error: true,
            type: 'CacheError',
            message: 'Cache operation failed, but request may succeed'
        });
    }
    // Database errors
    if (err instanceof DomainErrors_1.DatabaseError) {
        return res.status(500).json({
            error: true,
            type: 'DatabaseError',
            message: 'Database operation failed'
        });
    }
    // Generic domain errors
    if (err instanceof DomainErrors_1.DomainError) {
        return res.status(400).json({
            error: true,
            type: err.name,
            message: err.message
        });
    }
    // Unknown errors
    return res.status(500).json({
        error: true,
        type: 'InternalServerError',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message
    });
}
//# sourceMappingURL=errorHandler.js.map