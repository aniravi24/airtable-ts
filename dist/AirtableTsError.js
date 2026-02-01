"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prependError = exports.AirtableTsError = exports.ErrorType = void 0;
/**
 * Error types for categorizing different kinds of errors
 */
var ErrorType;
(function (ErrorType) {
    ErrorType["SCHEMA_VALIDATION"] = "SCHEMA_VALIDATION";
    ErrorType["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ErrorType["INVALID_PARAMETER"] = "INVALID_PARAMETER";
    ErrorType["API_ERROR"] = "API_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
/**
 * Base error class for all airtable-ts errors
 */
class AirtableTsError extends Error {
    /** Error type for categorization */
    type;
    constructor(options) {
        const { message, suggestion, type } = options;
        super(suggestion ? `${message} Suggestion: ${suggestion}` : message);
        this.type = type;
        this.name = 'AirtableTsError';
    }
}
exports.AirtableTsError = AirtableTsError;
const prependError = (error, prefix) => {
    if (error instanceof AirtableTsError) {
        error.message = `${prefix}: ${error.message}`;
        error.stack = `Error: ${prefix}: ${error.stack?.startsWith('Error: ') ? error.stack.slice('Error: '.length) : error.stack}`;
    }
    return error;
};
exports.prependError = prependError;
