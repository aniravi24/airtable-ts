import type Airtable from 'airtable';
import { type Item, type Table } from './mapping/typeUtils';
import { type AirtableTsTable, type CompleteAirtableTsOptions } from './types';
export declare const getAirtableTsTable: <T extends Item>(airtable: Airtable, table: Table<T>, options: CompleteAirtableTsOptions) => Promise<AirtableTsTable<T>>;
