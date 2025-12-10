import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { MeterReading, Bill } from './types';

export interface MeterAppDB extends DBSchema {
    readings: {
        key: number;
        value: MeterReading;
        indexes: { 'by-installation': string; 'by-code': string; 'by-branch': string; 'by-flagged': number };
    };
    bills: {
        key: number;
        value: Bill;
        indexes: { 'by-installation': string; 'by-code': string; 'by-branch': string; 'by-status': string };
    };
    logs: {
        key: number;
        value: any; // You might want to define a specific type for LogEntry
        indexes: { 'by-timestamp': number };
    };
}

const DB_NAME = 'MeterAppDB';
const DB_VERSION = 6;

export const getDB = async (): Promise<IDBPDatabase<MeterAppDB>> => {
    return openDB<MeterAppDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Recreate stores to use auto-incrementing keys
            if (db.objectStoreNames.contains('readings')) {
                db.deleteObjectStore('readings');
            }
            if (db.objectStoreNames.contains('bills')) {
                db.deleteObjectStore('bills');
            }
            // Add logs store deletion if it exists
            if (db.objectStoreNames.contains('logs')) {
                db.deleteObjectStore('logs');
            }

            const readingStore = db.createObjectStore('readings', { keyPath: 'id', autoIncrement: true });
            readingStore.createIndex('by-installation', 'installationID');
            readingStore.createIndex('by-code', 'code');
            readingStore.createIndex('by-branch', 'branchID');
            readingStore.createIndex('by-flagged', 'flagged');

            const billStore = db.createObjectStore('bills', { keyPath: 'id', autoIncrement: true });
            billStore.createIndex('by-installation', 'installationID');
            billStore.createIndex('by-code', 'code');
            billStore.createIndex('by-branch', 'branchID');
            billStore.createIndex('by-status', 'paymentStatus');

            // Create logs store
            const logStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
            logStore.createIndex('by-timestamp', 'timestamp');
        },
    });
};

export const initDB = getDB;
