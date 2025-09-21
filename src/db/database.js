
const DB_NAME = 'priboriReactDB';
const STORE_NAME = 'devices';
const DB_VERSION = 1;
let dbInstance = null;

export function initDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (event) => reject(`Database error: ${event.target.error}`);
        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            dbInstance.onclose = () => { dbInstance = null; console.warn("Database connection closed."); };
            resolve(dbInstance);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onblocked = () => {
            console.warn("Database open request blocked.");
            alert("Будь ласка, закрийте інші вкладки з цим додатком, щоб оновити базу даних.");
        };
    });
}

export async function getAllDevicesDB() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onerror = (event) => reject(`Error getting all devices: ${event.target.error}`);
        request.onsuccess = (event) => resolve(event.target.result || []);
    });
}

export async function saveDeviceDB(device) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        if (!device || typeof device.id === 'undefined') {
            return reject("Invalid device object: ID is missing.");
        }
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(device);
        request.onerror = (event) => reject(`Error saving device: ${event.target.error}`);
        request.onsuccess = () => resolve();
    });
}

export async function deleteDeviceDB(deviceId) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        if (!deviceId) return reject("Invalid device ID.");
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(deviceId);
        request.onerror = (event) => reject(`Error deleting device: ${event.target.error}`);
        request.onsuccess = () => resolve();
    });
}

export async function clearAllDevicesDB() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onerror = (event) => reject(`Error clearing store: ${event.target.error}`);
        request.onsuccess = () => resolve();
    });
}
