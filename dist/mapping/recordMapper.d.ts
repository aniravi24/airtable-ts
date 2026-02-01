import { type FieldSet } from 'airtable';
import { type AirtableRecord, type AirtableTsTable, type CompleteAirtableTsOptions } from '../types';
import { type FromTsTypeString, type Item, type Table, type TsTypeString } from './typeUtils';
type ValidationContext = Pick<CompleteAirtableTsOptions, 'readValidation' | 'onWarning'> & {
    warnings: unknown[];
};
export declare const mapRecordFromAirtable: <T extends Item>(table: Table<T>, record: AirtableRecord, options?: Pick<CompleteAirtableTsOptions, "readValidation" | "onWarning">) => T;
export declare const mapRecordToAirtable: <T extends Item>(table: Table<T>, item: Partial<T>, airtableTsTable: AirtableTsTable) => FieldSet;
export declare const visibleForTesting: {
    mapRecordTypeAirtableToTs: <T extends Record<string, TsTypeString>>(table: Table<Item>, tsTypes: T, record: AirtableRecord, validationContext?: ValidationContext) => ({ [F in keyof T]: FromTsTypeString<T[F]>; } & {
        id: string;
    });
    mapRecordTypeTsToAirtable: <T extends Record<string, TsTypeString>, R extends { [K in keyof T]?: FromTsTypeString<T[K]>; } & {
        id?: string;
    }>(table: Table<Item>, tsTypes: T, tsRecord: R, airtableTsTable: AirtableTsTable) => FieldSet;
};
export {};
