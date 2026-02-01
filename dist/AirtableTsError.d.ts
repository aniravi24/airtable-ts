/**
 * Error types for categorizing different kinds of errors
 */
export declare enum ErrorType {
    SCHEMA_VALIDATION = "SCHEMA_VALIDATION",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    INVALID_PARAMETER = "INVALID_PARAMETER",
    API_ERROR = "API_ERROR"
}
/**
 * Base error class for all airtable-ts errors
 */
export declare class AirtableTsError extends Error {
    /** Error type for categorization */
    type: ErrorType;
    constructor(options: {
        message: string;
        type: ErrorType;
        suggestion?: string;
    });
}
export declare const prependError: (error: unknown, prefix: string) => unknown;
