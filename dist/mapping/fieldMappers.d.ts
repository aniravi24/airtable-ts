import { type AirtableTypeString, type FromAirtableTypeString, type FromTsTypeString, type TsTypeString } from './typeUtils';
type Mapper = {
    [T in TsTypeString]?: {
        [A in AirtableTypeString | 'unknown']?: {
            toAirtable: (value: FromTsTypeString<T>) => FromAirtableTypeString<A>;
            fromAirtable: (value: FromAirtableTypeString<A> | null | undefined) => FromTsTypeString<T>;
        };
    };
};
export declare const fieldMappers: Mapper;
export {};
