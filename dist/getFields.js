"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFields = void 0;
/**
 * Returns field IDs (e.g., 'fldXXX') if mappings are defined, otherwise returns field names from the schema.
 */
const getFields = (table, airtableTsTable) => {
    const allFields = table.mappings
        ? Object.values(table.mappings).flat()
        : Object.keys(table.schema);
    // Filter out fields that have been deleted from Airtable but still exist in the schema.
    // These may trigger validation errors later, but this function is intended not to throw any errors.
    return allFields.filter((fieldNameOrId) => {
        const field = airtableTsTable.fields.find((f) => f.name === fieldNameOrId || f.id === fieldNameOrId);
        return Boolean(field);
    });
};
exports.getFields = getFields;
