import { type Item, type Table } from './mapping/typeUtils';
import { type AirtableTsTable } from './types';
/**
 * Returns field IDs (e.g., 'fldXXX') if mappings are defined, otherwise returns field names from the schema.
 */
export declare const getFields: (table: Table<Item>, airtableTsTable: AirtableTsTable) => string[];
