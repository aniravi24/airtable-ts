import { type Item, type Table, type FromTsTypeString, type TsTypeString } from './typeUtils';
/**
 * Maps a TS object (matching table.mappings) to another TS object (matching table.schema),
 * mapping columns based on the table definition.
 *
 * @param table Table definition
 * @example {
 *            schema: { someProp: 'string', otherProps: 'number[]', another: 'boolean' },
 *            mappings: { someProp: 'Some_Airtable_Field', otherProps: ['Field1', 'Field2'], another: 'another' },
 *            ...
 *          }
 *
 * @param tsRecord The TS object to map
 * @example {
 *            Some_Airtable_Field: 'abcd',
 *            Field1: 314,
 *            Field2: 159,
 *            another: true,
 *          }
 *
 * @returns The TS object mapped via the table.mappings
 * @example {
 *            someProp: 'abcd',
 *            otherProps: [314, 159],
 *            another: true,
 *          }
 */
export declare const mapRecordFieldNamesAirtableToTs: <T extends Item>(table: Table<T>, tsRecord: Record<string, FromTsTypeString<TsTypeString>>) => T;
/**
 * Maps a TS object (matching table.schema) to another TS object (matching table.mappings),
 * mapping columns based on the table definition.
 *
 * @param table Table definition
 * @example {
 *            schema: { someProp: 'string', otherProps: 'number[]', another: 'boolean' },
 *            mappings: { someProp: 'Some_Airtable_Field', otherProps: ['Field1', 'Field2'] },
 *            ...
 *          }
 *
 * @param item The TS object to map
 * @example {
 *            someProp: 'abcd',
 *            otherProps: [314, 159],
 *            another: true,
 *          }
 *
 * @returns The TS object mapped via the table.mappings
 * @example {
 *            Some_Airtable_Field: 'abcd',
 *            Field1: 314,
 *            Field2: 159,
 *            another: true,
 *          }
 */
export declare const mapRecordFieldNamesTsToAirtable: <T extends Item>(table: Table<T>, item: Partial<T>) => Record<string, FromTsTypeString<TsTypeString>>;
