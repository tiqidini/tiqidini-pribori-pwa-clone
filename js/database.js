const DB_NAME = 'priboriDB';
const STORE_NAME = 'devices';
const DB_VERSION = 1;

let db = null; // Глобальна змінна для збереження екземпляра БД

/**
 * Ініціалізує (відкриває) базу даних IndexedDB.
 * Створює сховище об'єктів, якщо воно ще не існує.
 * @returns {Promise<IDBDatabase>} Проміс, який вирішується з екземпляром БД.
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db); // Повертаємо вже відкриту БД
            return;
        }

        console.log(`Opening database ${DB_NAME} version ${DB_VERSION}...`);
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject(`Database error: ${event.target.error}`);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log(`Database ${DB_NAME} opened successfully.`);
            // Додаємо обробник закриття для діагностики
            db.onclose = () => {
                console.warn(`Database ${DB_NAME} connection closed.`);
                db = null; // Скидаємо екземпляр при закритті
            };
            db.onerror = (event) => {
                 console.error("Database error after open:", event.target.error);
            };
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            console.log("Database upgrade needed...");
            const tempDb = event.target.result;
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                console.log(`Creating object store: ${STORE_NAME}`);
                // Використовуємо 'id' як ключ, оскільки ми його генеруємо і він унікальний
                tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
                console.log(`Object store ${STORE_NAME} created.`);
            } else {
                 console.log(`Object store ${STORE_NAME} already exists.`);
            }
            console.log("Database upgrade finished.");
            // Не викликаємо resolve тут, onsuccess буде викликано автоматично
        };

         request.onblocked = () => {
            console.warn("Database open request blocked. Close other tabs using the database.");
            alert("Будь ласка, закрийте інші вкладки з цим додатком, щоб оновити базу даних.");
        };
    });
}

/**
 * Отримує всі записи приладів з бази даних.
 * @returns {Promise<Array>} Проміс, який вирішується з масивом приладів.
 */
export function getAllDevices() {
    return new Promise(async (resolve, reject) => {
        try {
            const currentDb = await initDB(); // Переконуємося, що БД ініціалізовано
            const transaction = currentDb.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onerror = (event) => {
                console.error("Error getting all devices:", event.target.error);
                reject(`Error getting all devices: ${event.target.error}`);
            };

            request.onsuccess = (event) => {
                console.log(`Retrieved ${event.target.result.length} devices from DB.`);
                resolve(event.target.result || []);
            };
        } catch (error) {
             console.error("Failed to get all devices:", error);
             reject(error);
        }
    });
}

/**
 * Зберігає (додає або оновлює) прилад в базу даних.
 * Використовує метод put, який автоматично обробляє обидва випадки.
 * @param {object} device Об'єкт приладу для збереження.
 * @returns {Promise<void>} Проміс, який вирішується при успішному збереженні.
 */
export function saveDevice(device) {
    return new Promise(async (resolve, reject) => {
         if (!device || typeof device.id === 'undefined') {
            console.error("Invalid device object passed to saveDevice:", device);
            return reject("Invalid device object: ID is missing.");
        }
        try {
            const currentDb = await initDB();
            const transaction = currentDb.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(device); // put додає або оновлює

            request.onerror = (event) => {
                console.error("Error saving device:", event.target.error, "Device:", device);
                reject(`Error saving device: ${event.target.error}`);
            };

            request.onsuccess = () => {
                console.log(`Device with ID ${device.id} saved successfully.`);
                resolve();
            };

            transaction.oncomplete = () => {
                console.log(`Transaction completed for saving device ${device.id}.`);
            };
            transaction.onerror = (event) => {
                 console.error("Transaction error saving device:", event.target.error);
                 reject(`Transaction error saving device: ${event.target.error}`);
            }

        } catch (error) {
             console.error("Failed to save device:", error, "Device:", device);
             reject(error);
        }
    });
}

/**
 * Видаляє прилад з бази даних за його ID.
 * @param {string} deviceId ID приладу для видалення.
 * @returns {Promise<void>} Проміс, який вирішується при успішному видаленні.
 */
export function deleteDevice(deviceId) {
    return new Promise(async (resolve, reject) => {
        if (!deviceId) {
            console.error("Invalid deviceId passed to deleteDevice:", deviceId);
            return reject("Invalid device ID.");
        }
        try {
            const currentDb = await initDB();
            const transaction = currentDb.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(deviceId);

            request.onerror = (event) => {
                console.error("Error deleting device:", event.target.error, "ID:", deviceId);
                reject(`Error deleting device: ${event.target.error}`);
            };

            request.onsuccess = () => {
                console.log(`Device with ID ${deviceId} deleted successfully.`);
                resolve();
            };

             transaction.oncomplete = () => {
                console.log(`Transaction completed for deleting device ${deviceId}.`);
            };
            transaction.onerror = (event) => {
                 console.error("Transaction error deleting device:", event.target.error);
                 reject(`Transaction error deleting device: ${event.target.error}`);
            }
        } catch (error) {
             console.error("Failed to delete device:", error, "ID:", deviceId);
             reject(error);
        }
    });
} 