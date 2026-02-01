"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtableTs = void 0;
const airtable_1 = __importDefault(require("airtable"));
const getAirtableTsTable_1 = require("./getAirtableTsTable");
const assertMatchesSchema_1 = require("./assertMatchesSchema");
const recordMapper_1 = require("./mapping/recordMapper");
const getFields_1 = require("./getFields");
const wrapToCatchAirtableErrors_1 = require("./wrapToCatchAirtableErrors");
const AirtableTsError_1 = require("./AirtableTsError");
class AirtableTs {
    airtable;
    options;
    constructor(options) {
        this.airtable = new airtable_1.default(options);
        this.options = {
            ...airtable_1.default.default_config(),
            ...options,
            baseSchemaCacheDurationMs: options.baseSchemaCacheDurationMs ?? 120_000,
            readValidation: options.readValidation ?? 'error',
        };
    }
    async get(table, id) {
        if (!id) {
            throw new AirtableTsError_1.AirtableTsError({
                message: `The record ID must be supplied when getting a record. This was thrown when trying to get a '${table.name}' (${table.tableId}) record.`,
                type: AirtableTsError_1.ErrorType.INVALID_PARAMETER,
                suggestion: 'Provide a valid record ID when calling the get method.',
            });
        }
        const airtableTsTable = await (0, getAirtableTsTable_1.getAirtableTsTable)(this.airtable, table, this.options);
        const record = await airtableTsTable.find(id);
        if (!record) {
            throw new AirtableTsError_1.AirtableTsError({
                message: `No record with ID '${id}' exists in table '${table.name}'.`,
                type: AirtableTsError_1.ErrorType.RESOURCE_NOT_FOUND,
                suggestion: 'Verify that the record ID is correct and that the record exists in the table.',
            });
        }
        return (0, recordMapper_1.mapRecordFromAirtable)(table, record, {
            readValidation: this.options.readValidation,
            onWarning: this.options.onWarning,
        });
    }
    async scan(table, params) {
        const airtableTsTable = await (0, getAirtableTsTable_1.getAirtableTsTable)(this.airtable, table, this.options);
        const records = await airtableTsTable.select({
            fields: (0, getFields_1.getFields)(table, airtableTsTable),
            ...params,
        }).all();
        return records.map((record) => (0, recordMapper_1.mapRecordFromAirtable)(table, record, {
            readValidation: this.options.readValidation,
            onWarning: this.options.onWarning,
        }));
    }
    async insert(table, data) {
        (0, assertMatchesSchema_1.assertMatchesSchema)(table, { ...data, id: 'placeholder' });
        const airtableTsTable = await (0, getAirtableTsTable_1.getAirtableTsTable)(this.airtable, table, this.options);
        const record = await airtableTsTable.create((0, recordMapper_1.mapRecordToAirtable)(table, data, airtableTsTable));
        return (0, recordMapper_1.mapRecordFromAirtable)(table, record, {
            readValidation: this.options.readValidation,
            onWarning: this.options.onWarning,
        });
    }
    async update(table, data) {
        (0, assertMatchesSchema_1.assertMatchesSchema)(table, { ...data });
        const { id, ...withoutId } = data;
        const airtableTsTable = await (0, getAirtableTsTable_1.getAirtableTsTable)(this.airtable, table, this.options);
        const record = await airtableTsTable.update(id, (0, recordMapper_1.mapRecordToAirtable)(table, withoutId, airtableTsTable));
        return (0, recordMapper_1.mapRecordFromAirtable)(table, record, {
            readValidation: this.options.readValidation,
            onWarning: this.options.onWarning,
        });
    }
    async remove(table, id) {
        if (!id) {
            throw new AirtableTsError_1.AirtableTsError({
                message: `The record ID must be supplied when removing a record. This was thrown when trying to get a '${table.name}' (${table.tableId}) record.`,
                type: AirtableTsError_1.ErrorType.INVALID_PARAMETER,
                suggestion: 'Provide a valid record ID when calling the remove method.',
            });
        }
        const airtableTsTable = await (0, getAirtableTsTable_1.getAirtableTsTable)(this.airtable, table, this.options);
        const record = await airtableTsTable.destroy(id);
        return { id: record.id };
    }
    async table(table) {
        return (0, getAirtableTsTable_1.getAirtableTsTable)(this.airtable, table, this.options);
    }
}
exports.AirtableTs = AirtableTs;
// Wrap all methods of AirtableTs with error handling
// See https://github.com/Airtable/airtable.js/issues/294
(0, wrapToCatchAirtableErrors_1.wrapToCatchAirtableErrors)(AirtableTs);
