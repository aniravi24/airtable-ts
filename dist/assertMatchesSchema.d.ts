import { type Item, type Table } from './mapping/typeUtils';
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
export declare function assertMatchesSchema<T extends Item>(table: Table<T>, data: unknown, mode?: 'full' | 'partial'): asserts data is T;
