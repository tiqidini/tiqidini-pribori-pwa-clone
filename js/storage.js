import { calculateNextCheckDate } from './utils.js';

// Константа для ключа хранения
export const STORAGE_KEY = 'priboriAppData_v4';

// Функция сохранения данных
export function saveData(devices) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
        console.log("Дані збережено в localStorage.");
    } catch (e) {
        console.error("Помилка збереження даних в localStorage:", e);
        alert("Не вдалося зберегти зміни.");
    }
}

// Функция загрузки данных
export function loadData() {
    let loadedData = null;
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData)) {
                loadedData = parsedData;
                console.log("Дані завантажено з localStorage.");
            } else {
                console.warn("Збережені дані в localStorage мають невірний формат.");
            }
        }
    } catch (e) {
        console.error("Помилка завантаження або парсингу даних з localStorage:", e);
        localStorage.removeItem(STORAGE_KEY);
    }

    if (!loadedData) {
        if (typeof devices !== 'undefined' && Array.isArray(devices)) {
            loadedData = JSON.parse(JSON.stringify(devices));
            console.log("Використовуються початкові дані з data.js.");
        } else {
            console.error("Початкові дані 'devices' не знайдено або мають невірний формат.");
            loadedData = [];
        }
    }

    // Обработка и валидация данных
    loadedData.forEach(device => {
        if (device.calibrationLocation !== undefined) {
            device.povirkyLocation = device.calibrationLocation;
            delete device.calibrationLocation;
        }
        if (device.povirkyLocation === undefined) {
            device.povirkyLocation = null;
        }
        device.nextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
    });

    return loadedData;
} 