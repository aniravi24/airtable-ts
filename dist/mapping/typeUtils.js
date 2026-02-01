"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airtableFieldNameTsTypes = exports.matchesType = exports.parseType = void 0;
const AirtableTsError_1 = require("../AirtableTsError");
const parseType = (t) => {
    if (t.endsWith('[] | null')) {
        return {
            single: t.slice(0, -('[] | null'.length)),
            array: true,
            nullable: true,
        };
    }
    if (t.endsWith('[]')) {
        return {
            single: t.slice(0, -('[]'.length)),
            array: true,
            nullable: false,
        };
    }
    if (t.endsWith(' | null')) {
        return {
            single: t.slice(0, -(' | null'.length)),
            array: false,
            nullable: true,
        };
    }
    return {
        single: t,
        array: false,
        nullable: false,
    };
};
exports.parseType = parseType;
/**
 * Checks if an object is a valid Attachment
 */
const isAttachment = (value) => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const obj = value;
    return (typeof obj.id === 'string'
        && typeof obj.url === 'string'
        && typeof obj.filename === 'string'
        && typeof obj.size === 'number'
        && typeof obj.type === 'string');
};
/**
 * Verifies whether the given value is assignable to the given type
 *
 * @param value
 * @example [1, 2, 3]
 *
 * @param tsType
 * @example 'number[]'
 *
 * @returns
 * @example true
 */
const matchesType = (value, tsType) => {
    const expectedType = (0, exports.parseType)(tsType);
    if (expectedType.nullable && value === null) {
        return true;
    }
    if (expectedType.single === 'Attachment') {
        if (!expectedType.array) {
            return isAttachment(value);
        }
        return Array.isArray(value) && value.every(isAttachment);
    }
    if (!expectedType.array && typeof value === expectedType.single) {
        return true;
    }
    return (expectedType.array
        && Array.isArray(value)
        && value.every((entry) => typeof entry === expectedType.single));
};
exports.matchesType = matchesType;
/**
 * Returns a single type for an array type
 *
 * @param tsType
 * @example 'string[]'
 *
 * @returns
 * @example 'string'
 */
const arrayToSingleType = (tsType) => {
    if (tsType.endsWith('[] | null')) {
        // This results in:
        // string[] | null -> string | null
        // Going the other way might not work - e.g. we'd get (string | null)[]
        return `${tsType.slice(0, -'[] | null'.length)} | null`;
    }
    if (tsType.endsWith('[]')) {
        return tsType.slice(0, -'[]'.length);
    }
    throw new AirtableTsError_1.AirtableTsError({
        message: `The type '${tsType}' is not an array type.`,
        type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
    });
};
/**
 * Constructs a TypeScript object type definition given a table definition
 *
 * @param table Table definition
 * @example {
 *            schema: { someProp: 'string', otherProps: 'number[]', another: 'boolean' },
 *            mappings: { someProp: 'Some_Airtable_Field', otherProps: ['Field1', 'Field2'], another: 'another' },
 *            ...
 *          }
 *
 * @returns The TypeScript object type we expect the Airtable record to coerce to
 * @example {
 *            Some_Airtable_Field: 'string',
 *            Field1: 'number',
 *            Field2: 'number',
 *            another: 'boolean',
 *          }
 */
const airtableFieldNameTsTypes = (table) => {
    const schemaEntries = Object.entries(table.schema);
    return Object.fromEntries(schemaEntries.map(([outputFieldName, tsType]) => {
        const mappingToAirtable = table.mappings?.[outputFieldName];
        try {
            if (!mappingToAirtable) {
                return [[outputFieldName, tsType]];
            }
            if (Array.isArray(mappingToAirtable)) {
                return mappingToAirtable.map((airtableFieldName) => [airtableFieldName, arrayToSingleType(tsType)]);
            }
            return [[mappingToAirtable, tsType]];
        }
        catch (error) {
            throw (0, AirtableTsError_1.prependError)(error, `Error with field ${String(outputFieldName)} (${JSON.stringify(mappingToAirtable)})`);
        }
    }).flat(1));
};
exports.airtableFieldNameTsTypes = airtableFieldNameTsTypes;
