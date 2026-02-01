import AirtableError from 'airtable/lib/airtable_error';
export declare class WrappedAirtableError extends Error {
    /** The original error thrown by Airtable.js */
    originalError: AirtableError;
    /** The error type from Airtable.js */
    error?: string;
    /** The HTTP status code if applicable */
    statusCode?: number;
    constructor(originalError: AirtableError);
}
export declare const wrapToCatchAirtableErrors: <T extends {
    prototype: object;
}>(c: T) => void;
