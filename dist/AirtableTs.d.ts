import Airtable from 'airtable';
import { type Item, type Table } from './mapping/typeUtils';
import { type AirtableTsTable, type AirtableTsOptions, type ScanParams } from './types';
export declare class AirtableTs {
    airtable: Airtable;
    private readonly options;
    constructor(options: AirtableTsOptions);
    get<T extends Item>(table: Table<T>, id: string): Promise<T>;
    scan<T extends Item>(table: Table<T>, params?: ScanParams): Promise<T[]>;
    insert<T extends Item>(table: Table<T>, data: Partial<Omit<T, 'id'>>): Promise<T>;
    update<T extends Item>(table: Table<T>, data: Partial<T> & {
        id: string;
    }): Promise<T>;
    remove<T extends Item>(table: Table<T>, id: string): Promise<{
        id: string;
    }>;
    table<T extends Item>(table: Table<T>): Promise<AirtableTsTable<T>>;
}
