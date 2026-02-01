"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapToCatchAirtableErrors = exports.WrappedAirtableError = void 0;
const airtable_error_1 = __importDefault(require("airtable/lib/airtable_error"));
class WrappedAirtableError extends Error {
    /** The original error thrown by Airtable.js */
    originalError;
    /** The error type from Airtable.js */
    error;
    /** The HTTP status code if applicable */
    statusCode;
    constructor(originalError) {
        super(originalError.message);
        this.name = 'WrappedAirtableError';
        this.originalError = originalError;
        this.error = originalError.error;
        this.statusCode = originalError.statusCode;
    }
}
exports.WrappedAirtableError = WrappedAirtableError;
/**
 * Wraps any error thrown that isn't a proper Error object to ensure it has a stack trace for debugging.
 * @see https://github.com/Airtable/airtable.js/issues/294
 */
function wrapAirtableError(error) {
    if (error instanceof Error) {
        return error;
    }
    if (error instanceof airtable_error_1.default) {
        return new WrappedAirtableError(error);
    }
    return new Error(String(error));
}
const wrapToCatchAirtableErrors = (c) => {
    // Cast to any to bypass TypeScript's type checking, as unfortunately this is too funky for TypeScript
    const prototype = c.prototype;
    const methods = Object.getOwnPropertyNames(prototype).filter((prop) => {
        return prop !== 'constructor' && typeof prototype[prop] === 'function';
    });
    methods.forEach((method) => {
        const original = prototype[method];
        if (typeof original === 'function') {
            prototype[method] = function (...args) {
                try {
                    const result = original.apply(this, args);
                    if (result instanceof Promise) {
                        return result.catch((error) => {
                            throw wrapAirtableError(error);
                        });
                    }
                    return result;
                }
                catch (error) {
                    throw wrapAirtableError(error);
                }
            };
        }
    });
};
exports.wrapToCatchAirtableErrors = wrapToCatchAirtableErrors;
