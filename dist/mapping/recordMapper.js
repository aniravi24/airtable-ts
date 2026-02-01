"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visibleForTesting = exports.mapRecordToAirtable = exports.mapRecordFromAirtable = void 0;
const fieldMappers_1 = require("./fieldMappers");
const nameMapper_1 = require("./nameMapper");
const typeUtils_1 = require("./typeUtils");
const AirtableTsError_1 = require("../AirtableTsError");
/**
 * Returns an appropriate default value for a TypeScript type when validation fails.
 * For nullable types, returns null. For non-nullable types, returns type-specific defaults.
 */
const getDefaultValueForType = (tsType) => {
    const parsed = (0, typeUtils_1.parseType)(tsType);
    if (parsed.nullable) {
        return null;
    }
    if (parsed.array) {
        return [];
    }
    if (parsed.single === 'string') {
        return '';
    }
    if (parsed.single === 'number') {
        return 0;
    }
    if (parsed.single === 'boolean') {
        return false;
    }
    // If we reach here, a new type was added without a default value
    throw new AirtableTsError_1.AirtableTsError({
        message: `No default value defined for TypeScript type '${tsType}'. This indicates that a new type was added to the type system without updating the default value logic.`,
        type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
        suggestion: 'Update the getDefaultValueForType function in recordMapper.ts to handle this type.',
    });
};
/**
 * Resolves the effective Airtable type for mapper selection.
 * For lookup/rollup fields that reference date/dateTime fields, returns a special
 * type so the mapper knows to parse ISO date strings to Unix timestamps.
 */
const resolveEffectiveAirtableType = (airtableType, tsType, fieldOptions) => {
    // Only apply special handling for number types with lookup/rollup fields
    if (!['number', 'number | null', 'number[]', 'number[] | null'].includes(tsType)) {
        return airtableType;
    }
    if (airtableType !== 'multipleLookupValues' && airtableType !== 'rollup') {
        return airtableType;
    }
    const resultType = fieldOptions?.result?.type;
    if (resultType === 'date' || resultType === 'dateTime') {
        // Use a special type that tells the mapper to parse date strings
        return airtableType === 'multipleLookupValues' ? 'dateLookup' : 'dateRollup';
    }
    return airtableType;
};
const getMapper = (tsType, airtableType) => {
    const tsMapper = fieldMappers_1.fieldMappers[tsType];
    if (!tsMapper) {
        throw new AirtableTsError_1.AirtableTsError({
            message: `No mapper exists for TypeScript type '${tsType}'.`,
            type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
            suggestion: 'Check that you are using a supported TypeScript type in your schema definition.',
        });
    }
    if (tsMapper[airtableType]) {
        return tsMapper[airtableType];
    }
    if (tsMapper.unknown) {
        console.warn(`[airtable-ts] Unknown airtable type ${airtableType} for tsType ${tsType}. This is not fully supported and exact mapping behaviour may change in a future release.`);
        return tsMapper.unknown;
    }
    throw new AirtableTsError_1.AirtableTsError({
        message: `Cannot map Airtable type '${airtableType}' to TypeScript type '${tsType}'.`,
        type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
        suggestion: 'Check that your schema definition uses TypeScript types that are compatible with the Airtable field types.',
    });
};
/**
 * This function coerces an Airtable record to a TypeScript object, given an
 * object type definition.  It will do this using the field mappers on each
 * field, based on the tsTypes and Airtable table schema (via the record).
 * It does NOT change any property names.
 *
 * @param tsTypes TypeScript types for the record.
 * @example { a: 'string', b: 'number', c: 'boolean', d: 'string' }
 *
 * @param record The Airtable record to convert.
 * @example { id: 'rec012', a: 'Some text', b: 123, d: ['rec345'] } // (c is an un-ticked checkbox, d is a multipleRecordLinks)
 *
 * @returns An object matching the TypeScript type passed in, based on the Airtable record. Throws if cannot coerce to requested type.
 * @example { id: 'rec012', a: 'Some text', b: 123, c: false, d: 'rec345' }
 */
const mapRecordTypeAirtableToTs = (table, tsTypes, record, validationContext) => {
    const item = {};
    Object.entries(tsTypes).forEach(([fieldNameOrId, tsType]) => {
        const fieldDefinition = record._table.fields.find((f) => f.id === fieldNameOrId || f.name === fieldNameOrId);
        if (!fieldDefinition) {
            // This should not happen normally, as we should only be trying to map fields that are in the table definition.
            // If it does happen this often indicates that the field has been deleted from Airtable without updating the schema.
            const validationError = new AirtableTsError_1.AirtableTsError({
                message: `Field '${fieldNameOrId}' does not exist in the table definition. This error should not happen in normal operation.`,
                type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
            });
            if (validationContext?.readValidation === 'warning') {
                validationContext.warnings.push(validationError);
                item[fieldNameOrId] = getDefaultValueForType(tsType);
                return;
            }
            throw validationError;
        }
        const value = record.fields[fieldDefinition.name];
        try {
            const effectiveType = resolveEffectiveAirtableType(fieldDefinition.type, tsType, fieldDefinition.options);
            const { fromAirtable } = getMapper(tsType, effectiveType);
            item[fieldNameOrId] = fromAirtable(value);
        }
        catch (error) {
            const tsName = table.mappings ? Object.entries(table.mappings).find((e) => e[1] === fieldNameOrId)?.[0] : undefined;
            const validationError = (0, AirtableTsError_1.prependError)(error, `Failed to map field ${tsName ? `${tsName} (${fieldNameOrId})` : fieldNameOrId} from Airtable`);
            if (validationContext?.readValidation === 'warning') {
                validationContext.warnings.push(validationError);
                item[fieldNameOrId] = getDefaultValueForType(tsType);
                return;
            }
            throw validationError;
        }
    });
    return Object.assign(item, { id: record.id });
};
/**
 * This function coerces a TypeScript object to a Airtable record, given an
 * Airtable table. It will do this using the field mappers on each field, based
 * on the tsTypes and Airtable table schema.
 * It does NOT change any property names.
 *
 * @param tsTypes TypeScript types for the record (necessary to handle nullables).
 * @example { a: 'string', b: 'number', c: 'boolean', d: 'string' }
 *
 * @param tsRecord TypeScript object to convert.
 * @example { a: 'Some text', b: 123, c: false, d: 'rec123' }
 *
 * @param airtableTsTable An Airtable table.
 * @example { fields: { a: 'singleLineText', b: 'number', c: 'checkbox', d: 'multipleRecordLinks' }, ... }
 *
 * @returns An Airtable FieldSet. Throws if cannot coerce to requested type.
 * @example { a: 'Some text', b: 123, d: ['rec123'] } // (c is an un-ticked checkbox, d is a multipleRecordLinks)
 */
const mapRecordTypeTsToAirtable = (table, tsTypes, tsRecord, airtableTsTable) => {
    const item = {};
    Object.entries(tsTypes).forEach(([fieldNameOrId, tsType]) => {
        const value = tsRecord[fieldNameOrId];
        if (!(fieldNameOrId in tsRecord)) {
            // If we don't have the field, just skip: this allows us to support partial updates
            return;
        }
        if (!(0, typeUtils_1.matchesType)(value, tsType)) {
            // This should be unreachable because of our types
            throw new AirtableTsError_1.AirtableTsError({
                message: `Type mismatch for field '${fieldNameOrId}': expected ${tsType} but got a ${typeof value}.`,
                type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
                suggestion: 'Ensure the value matches the expected type in your schema definition.',
            });
        }
        const fieldDefinition = airtableTsTable.fields.find((f) => f.id === fieldNameOrId || f.name === fieldNameOrId);
        if (!fieldDefinition) {
            const tsName = table.mappings ? Object.entries(table.mappings).find((e) => e[1] === fieldNameOrId)?.[0] : undefined;
            throw new AirtableTsError_1.AirtableTsError({
                message: `Field ${tsName ? `${tsName} (${fieldNameOrId})` : fieldNameOrId} does not exist in the Airtable table.`,
                type: AirtableTsError_1.ErrorType.RESOURCE_NOT_FOUND,
                suggestion: 'Verify that the field exists in your Airtable base and that you are using the correct field name or ID.',
            });
        }
        try {
            const { toAirtable } = getMapper(tsType, fieldDefinition.type);
            item[fieldNameOrId] = toAirtable(value);
        }
        catch (error) {
            const tsName = table.mappings ? Object.entries(table.mappings).find((e) => e[1] === fieldNameOrId)?.[0] : undefined;
            throw (0, AirtableTsError_1.prependError)(error, `Failed to map field ${tsName ? `${tsName} (${fieldNameOrId})` : fieldNameOrId} to Airtable`);
        }
    });
    return Object.assign(item, { id: tsRecord.id });
};
const mapRecordFromAirtable = (table, record, options) => {
    const qualifyError = (error) => (0, AirtableTsError_1.prependError)(error, `Failed to map record from Airtable format for table '${table.name}' (${table.tableId}) and record ${record.id}`);
    const validationContext = {
        onWarning: options?.onWarning,
        readValidation: options?.readValidation ?? 'error',
        warnings: [],
    };
    try {
        const tsTypes = (0, typeUtils_1.airtableFieldNameTsTypes)(table);
        const tsRecord = mapRecordTypeAirtableToTs(table, tsTypes, record, validationContext);
        // Handle warnings from `mapRecordTypeAirtableToTs`
        if (validationContext.onWarning) {
            validationContext.warnings.forEach((err) => {
                void (async () => {
                    try {
                        await validationContext.onWarning?.(qualifyError(err));
                    }
                    catch (error) {
                        console.error('[airtable-ts] Error in onWarning callback:', error);
                    }
                })();
            });
        }
        const mappedRecord = (0, nameMapper_1.mapRecordFieldNamesAirtableToTs)(table, tsRecord);
        return mappedRecord;
    }
    catch (error) {
        throw qualifyError(error);
    }
};
exports.mapRecordFromAirtable = mapRecordFromAirtable;
const mapRecordToAirtable = (table, item, airtableTsTable) => {
    try {
        const mappedItem = (0, nameMapper_1.mapRecordFieldNamesTsToAirtable)(table, item);
        const tsTypes = (0, typeUtils_1.airtableFieldNameTsTypes)(table);
        const fieldSet = mapRecordTypeTsToAirtable(table, tsTypes, mappedItem, airtableTsTable);
        return fieldSet;
    }
    catch (error) {
        throw (0, AirtableTsError_1.prependError)(error, `Failed to map record to Airtable format for table '${table.name}' (${table.tableId})`);
    }
};
exports.mapRecordToAirtable = mapRecordToAirtable;
exports.visibleForTesting = {
    mapRecordTypeAirtableToTs,
    mapRecordTypeTsToAirtable,
};
