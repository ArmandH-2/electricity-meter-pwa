import { getDB } from './db';
import type { MeterReading, Bill } from './types';

export const ReadingRepository = {
    async addAll(readings: MeterReading[]) {
        const db = await getDB();
        const tx = db.transaction('readings', 'readwrite');
        const store = tx.objectStore('readings');
        await Promise.all(readings.map(r => store.put(r)));
        await tx.done;
    },

    async getAll() {
        const db = await getDB();
        return await db.getAll('readings');
    },

    async update(reading: MeterReading) {
        const db = await getDB();
        await db.put('readings', reading);
    },

    async getByInstallationID(id: string) {
        const db = await getDB();
        return await db.getAllFromIndex('readings', 'by-installation', id);
    },

    async clearAll() {
        const db = await getDB();
        await db.clear('readings');
    }
};

export const BillRepository = {
    async addAll(bills: Bill[]) {
        const db = await getDB();
        const tx = db.transaction('bills', 'readwrite');
        const store = tx.objectStore('bills');
        await Promise.all(bills.map(b => store.put(b)));
        await tx.done;
    },

    async getAll() {
        const db = await getDB();
        return await db.getAll('bills');
    },

    async update(bill: Bill) {
        const db = await getDB();
        await db.put('bills', bill);
    },

    async getUnpaid() {
        const db = await getDB();
        return await db.getAllFromIndex('bills', 'by-status', 'unpaid');
    },

    async clearAll() {
        const db = await getDB();
        await db.clear('bills');
    }
};

export const LogRepository = {
    async add(action: string, details: string) {
        const db = await getDB();
        await db.add('logs', {
            action,
            details,
            timestamp: new Date().toISOString()
        });
    },

    async getAll() {
        const db = await getDB();
        return await db.getAllFromIndex('logs', 'by-timestamp');
    },

    async clearAll() {
        const db = await getDB();
        await db.clear('logs');
    }
};
