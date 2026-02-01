"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertMatchesSchema = assertMatchesSchema;
const typeUtils_1 = require("./mapping/typeUtils");
const AirtableTsError_1 = require("./AirtableTsError");
/**
 * In theory, this should never catch stuff because our type mapping logic should
 * verify the types are compatible.
 *
 * "In theory, there is no difference between theory and practice. But in practice, there is."
 *   ~ Benjamin Brewster, probably: https://quoteinvestigator.com/2018/04/14/theory/
 *
 * @param table
 * @param data
 */
function assertMatchesSchema(table, data, mode = 'partial') {
    if (typeof data !== 'object' || data === null) {
        throw new AirtableTsError_1.AirtableTsError({
            message: `Data passed in to airtable-ts should be an object but received ${data === null ? 'null' : typeof data}.`,
            type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
        });
    }
    Object.entries(table.schema).forEach(([fieldName, type]) => {
        const value = data[fieldName];
        if (value === undefined) {
            if (mode === 'partial') {
                return;
            }
            throw new AirtableTsError_1.AirtableTsError({
                message: `Data passed in to airtable-ts is missing required field '${fieldName}' in table '${table.name}' (expected type: ${type}).`,
                type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
            });
        }
        if (!(0, typeUtils_1.matchesType)(value, type)) {
            throw new AirtableTsError_1.AirtableTsError({
                message: `Invalid value passed in to airtable-ts for field '${fieldName}' in table '${table.name}' (received type: ${typeof value}, expected type: ${type}).`,
                type: AirtableTsError_1.ErrorType.SCHEMA_VALIDATION,
            });
        }
    });
}
