// Імпортуємо необхідні функції та початкові дані
import { calculateNextCheckDate } from './utils.js';
import { devices as initialDevices } from './data.js'; // Імпортуємо початкові дані як initialDevices

// Константа для ключа зберігання
export const STORAGE_KEY = 'priboriAppData_v4';

// Функція збереження даних
export function saveData(devices) {
    try {
        // Розраховуємо nextCheckDate перед збереженням
        const devicesToSave = devices.map(device => ({
            ...device,
            nextCheckDate: calculateNextCheckDate(device.lastCheckDate, device.mpi)
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(devicesToSave));
        console.log("Дані збережено в localStorage.");
    } catch (e) {
        console.error("Помилка збереження даних в localStorage:", e);
        // Можна додати сповіщення для користувача
        alert("Не вдалося зберегти зміни. Можливо, сховище переповнене.");
    }
}

// Функція завантаження даних
export function loadData() {
    let loadedData = null;
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Додаткова перевірка, що це масив
            if (Array.isArray(parsedData)) {
                loadedData = parsedData;
                console.log(`Дані (${loadedData.length} приладів) завантажено з localStorage.`);
            } else {
                console.warn("Збережені дані в localStorage мають невірний формат (не масив). Буде використано початкові дані.");
                localStorage.removeItem(STORAGE_KEY); // Видаляємо некоректні дані
            }
        } else {
             console.log("Дані в localStorage не знайдено. Буде використано початкові дані.");
        }
    } catch (e) {
        console.error("Помилка завантаження або парсингу даних з localStorage:", e);
        // Якщо сталася помилка парсингу, видаляємо потенційно пошкоджені дані
        localStorage.removeItem(STORAGE_KEY);
        loadedData = null; // Переконуємося, що буде використано початкові дані
    }

    // Якщо дані не завантажено з localStorage, використовуємо початкові
    if (loadedData === null) {
        // Перевіряємо, чи initialDevices імпортовано коректно
        if (typeof initialDevices !== 'undefined' && Array.isArray(initialDevices)) {
            // Створюємо глибоку копію, щоб уникнути мутації оригінального масиву
            loadedData = JSON.parse(JSON.stringify(initialDevices));
            console.log(`Використовуються початкові дані з data.js (${loadedData.length} приладів).`);
            // Одразу зберігаємо початкові дані в localStorage для наступних запусків
            saveData(loadedData);
        } else {
            console.error("Помилка: Початкові дані 'initialDevices' не знайдено або мають невірний формат в data.js.");
            loadedData = []; // Повертаємо порожній масив у разі помилки
        }
    }

    // Обробка та валідація завантажених даних (з localStorage або початкових)
    // Переконуємося, що всі необхідні поля існують і розраховуємо nextCheckDate
    return loadedData.map(device => {
        // Міграція старого поля, якщо воно існує
        if (device.calibrationLocation !== undefined) {
            device.povirkyLocation = device.calibrationLocation;
            delete device.calibrationLocation;
        }
        // Забезпечуємо наявність поля povirkyLocation
        if (device.povirkyLocation === undefined) {
            device.povirkyLocation = null;
        }
         // Забезпечуємо наявність поля notes
        if (device.notes === undefined) {
            device.notes = null;
        }
        // Розраховуємо дату наступної перевірки
        const nextCheck = calculateNextCheckDate(device.lastCheckDate, device.mpi);
        // Повертаємо об'єкт приладу з усіма полями, включаючи розраховану дату
        return {
            id: device.id || `generated_${Math.random().toString(16).slice(2)}`, // Генеруємо ID, якщо відсутній
            rm: device.rm || null,
            name: device.name || 'Без назви',
            type: device.type || '-',
            serial: device.serial || '-',
            lastCheckDate: device.lastCheckDate || null,
            mpi: device.mpi || null,
            location: device.location || null,
            povirkyLocation: device.povirkyLocation, // Вже перевірено
            notes: device.notes, // Вже перевірено
            nextCheckDate: nextCheck // Додаємо розраховану дату
        };
    });
}
