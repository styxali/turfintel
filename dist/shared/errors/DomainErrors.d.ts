export declare class DomainError extends Error {
    constructor(message: string);
}
export declare class RaceNotFoundError extends DomainError {
    constructor(guid: string);
}
export declare class HorseNotFoundError extends DomainError {
    constructor(slug: string);
}
export declare class ValidationError extends DomainError {
    readonly fields: Record<string, string>;
    constructor(message: string, fields: Record<string, string>);
}
export declare class ExternalApiError extends DomainError {
    readonly service: string;
    readonly originalError?: any | undefined;
    constructor(message: string, service: string, originalError?: any | undefined);
}
export declare class CacheError extends DomainError {
    constructor(message: string);
}
export declare class DatabaseError extends DomainError {
    readonly originalError?: any | undefined;
    constructor(message: string, originalError?: any | undefined);
}
//# sourceMappingURL=DomainErrors.d.ts.map