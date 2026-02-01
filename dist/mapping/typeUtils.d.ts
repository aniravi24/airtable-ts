/**
 * Represents an attachment from Airtable with full metadata.
 * @see https://airtable.com/developers/web/api/field-model#multipleattachment
 */
export type Attachment = {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    width?: number;
    height?: number;
    thumbnails?: {
        small?: {
            url: string;
            width: number;
            height: number;
        };
        large?: {
            url: string;
            width: number;
            height: number;
        };
        full?: {
            url: string;
            width: number;
            height: number;
        };
    };
};
export type TsTypeString = NonNullToString<any> | ToTsTypeString<any>;
type NonNullToString<T> = T extends string ? 'string' : T extends number ? 'number' : T extends boolean ? 'boolean' : T extends number[] ? 'number[]' : T extends string[] ? 'string[]' : T extends boolean[] ? 'boolean[]' : T extends Attachment[] ? 'Attachment[]' : never;
export type ToTsTypeString<T> = null extends T ? `${NonNullToString<T>} | null` : NonNullToString<T>;
export type FromTsTypeString<T> = T extends 'string' ? string : T extends 'string | null' ? string | null : T extends 'number' ? number : T extends 'number | null' ? number | null : T extends 'boolean' ? boolean : T extends 'boolean | null' ? boolean | null : T extends 'string[]' ? string[] : T extends 'string[] | null' ? string[] | null : T extends 'number[]' ? number[] : T extends 'number[] | null' ? number[] | null : T extends 'boolean[]' ? boolean[] : T extends 'boolean[] | null' ? boolean[] | null : T extends 'Attachment[]' ? Attachment[] : T extends 'Attachment[] | null' ? Attachment[] | null : never;
export type AirtableTypeString = 'aiText' | 'autoNumber' | 'barcode' | 'button' | 'checkbox' | 'count' | 'createdBy' | 'createdTime' | 'currency' | 'date' | 'dateLookup' | 'dateRollup' | 'dateTime' | 'duration' | 'email' | 'externalSyncSource' | 'formula' | 'lastModifiedBy' | 'lastModifiedTime' | 'lookup' | 'multipleLookupValues' | 'multilineText' | 'multipleAttachments' | 'multipleCollaborators' | 'multipleRecordLinks' | 'multipleSelects' | 'number' | 'percent' | 'phoneNumber' | 'rating' | 'richText' | 'rollup' | 'singleCollaborator' | 'singleLineText' | 'singleSelect' | 'url';
export type FromAirtableTypeString<T extends AirtableTypeString | 'unknown'> = null | (T extends 'url' | 'email' | 'phoneNumber' | 'singleLineText' | 'multilineText' | 'richText' | 'singleSelect' | 'externalSyncSource' | 'date' | 'dateTime' | 'createdTime' | 'lastModifiedTime' ? string : T extends 'multipleRecordLinks' | 'multipleSelects' ? string[] : T extends 'number' | 'rating' | 'duration' | 'currency' | 'percent' | 'count' | 'autoNumber' ? number : T extends 'checkbox' ? boolean : T extends 'lookup' | 'multipleLookupValues' | 'rollup' | 'formula' ? FromAirtableTypeString<any>[] : T extends 'aiText' | 'barcode' | 'singleCollaborator' | 'createdBy' | 'modifiedBy' | 'button' ? object : T extends 'multipleCollaborators' | 'multipleAttachments' ? object[] : T extends 'unknown' ? unknown : never);
type TypeDef = {
    single: 'string' | 'number' | 'boolean' | 'Attachment';
    array: boolean;
    nullable: boolean;
};
export declare const parseType: (t: TsTypeString) => TypeDef;
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
export declare const matchesType: (value: unknown, tsType: TsTypeString) => boolean;
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
export declare const airtableFieldNameTsTypes: <T extends Item>(table: Table<T>) => Record<string, TsTypeString>;
export type MappingValue<T> = T extends unknown[] ? string | string[] : string;
export type Item = {
    /** Represents the Airtable record id, @example "rec1234" */
    id: string;
};
export type Table<T extends Item> = {
    /** A simple name for the entities in this table, to be used in error messages @example "person" */
    name: string;
    /** The base id for this table. You can get this from the URL when accessing the table in the web UI. @example "app1234" */
    baseId: string;
    /** The table id for this table. You can get this from the URL when accessing the table in the web UI. @example "tbl1234" */
    tableId: string;
    /** The schema. We need to define this as a real object (rather than a type) because we do checks at run-time. You should usually be able to just take the autocomplete suggestions (provided you gave a TypeScript type already). */
    schema: {
        [k in keyof Omit<T, 'id'>]: ToTsTypeString<T[k]>;
    };
    /**
   * Optional name mappings. This allows you to detach the schema names from the names you want to use in your code.
   * @example
   * export const personTable: Table<{ id: string, firstName: string }> = {
   *   name: 'person', baseId: 'app1234', tableId: 'tbl1234',
   *   schema: { firstName: 'string' },
   *   // The field is named '[core] First Name' in the base. If this ever changes, we just need to update it here.
   *   mappings: { firstName: '[core] First Name' },
   * };
   * const people = await db.scan(studentTable);
   * const firstPersonsFirstName = people[0].firstName;
   * */
    mappings?: {
        [k in keyof Omit<T, 'id'>]: MappingValue<T[k]>;
    };
};
export {};
