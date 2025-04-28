// Импортуємо необхідні модулі та функції
// import { loadData, saveData } from './storage.js'; // Видалено
import { initDB, getAllDevices, saveDevice, deleteDevice } from './database.js'; // Додано
import { updateOverdueStats, renderDeviceList, openModal, closeModal, initUIHandlers } from './ui.js';
import { initNotifications, showNotifications } from './notifications.js';
// --- ИСПРАВЛЕНО: Импортируем 'formatDate' вместо 'formatDateForInput' ---
import { calculateNextCheckDate, formatDate } from './utils.js';
// --- КОНЕЦ ИСПРАВЛЕНИЯ ---

// --- Глобальні змінні ---
let currentDevices = [];
let currentRMFilter = 'all';

// --- DOM елементи ---
const deviceListContainer = document.getElementById('device-list');
const modal = document.getElementById('modal');
const addDeviceBtn = document.getElementById('add-device-btn');
const rmFilterContainer = document.getElementById('rm-filter');

// --- Функції оновлення UI ---
function updateUI() {
    renderDeviceList(currentDevices, currentRMFilter);
    updateOverdueStats(currentDevices);
    showNotifications(currentDevices);
}

// --- Функції для роботи з даними (використовують database.js) ---

// Функція для збереження/оновлення приладу
async function handleSaveDevice(formData, id) {
    console.log("handleSaveDevice called with ID:", id, "and data:", formData);
    const isEditing = !!id;

    // Рассчитываем дату следующей поверки перед сохранением
    // Примечание: calculateNextCheckDate возвращает строку 'YYYY-MM-DD' или null
    const nextCheckDateString = calculateNextCheckDate(formData.lastCheckDate, formData.mpi);

    try {
        // Создаем объект для сохранения
        const deviceToSave = { ...formData };
        if (isEditing) {
            deviceToSave.id = id;
        } else {
            // Генерируем новый ID, если это новый прилад
            let newId = (formData.serial || 'no_serial') + '_' + Date.now();
            // Проверяем уникальность ID (хотя Date.now() почти всегда уникален)
            while (currentDevices.some(d => d.id === newId)) {
                newId = (formData.serial || 'no_serial') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
            }
            deviceToSave.id = newId;
        }
        // Добавляем рассчитанную дату следующей поверки (если она есть)
        // В IndexedDB лучше хранить строку YYYY-MM-DD или null
        deviceToSave.nextCheckDate = nextCheckDateString;

        await saveDevice(deviceToSave); // Зберігаємо в IndexedDB

        // Оновлюємо локальний масив currentDevices ПІСЛЯ успішного збереження в БД
        if (isEditing) {
            const index = currentDevices.findIndex(d => d.id === id);
            if (index !== -1) {
                currentDevices[index] = deviceToSave; // Обновляем объект в массиве
                console.log("Device updated in currentDevices array.");
            } else {
                 console.warn(`Device with ID ${id} was saved to DB, but not found in currentDevices array for update.`);
                 // Можно перезагрузить данные из БД для консистентности
                 // currentDevices = await getAllDevices();
            }
        } else {
            currentDevices.push(deviceToSave); // Добавляем новый объект в массив
            console.log("New device added to currentDevices array.");
        }

        updateUI(); // Оновлюємо весь інтерфейс
        closeModal(); // Закриваємо модальне вікно

    } catch (error) {
        console.error("Failed to save device:", error);
        alert("Помилка збереження приладу. Дивіться консоль.");
    }
}

// Функція для видалення приладу
async function handleDeleteDevice(id) {
    console.log(`handleDeleteDevice called with ID: ${id}`);
    try {
        await deleteDevice(id); // Видаляємо з IndexedDB

        // Оновлюємо локальний масив currentDevices ПІСЛЯ успішного видалення з БД
        const initialLength = currentDevices.length;
        currentDevices = currentDevices.filter(device => device.id !== id);

        if (currentDevices.length < initialLength) {
             console.log("Device removed from currentDevices array.");
        } else {
             console.warn(`Device with ID ${id} was deleted from DB, but not found in currentDevices array.`);
        }

        updateUI(); // Оновлюємо весь інтерфейс
        closeModal(); // Закриваємо модальне вікно

    } catch(error) {
         console.error("Failed to delete device:", error);
         alert("Помилка видалення приладу. Дивіться консоль.");
    }
}

// --- Функція імпорту з CSV ---
async function importFromCSV() {
    console.log("Attempting to import data from CSV...");
    try {
        // Убедитесь, что путь к файлу CSV правильный относительно корня сайта
        const response = await fetch('Прилади - Аркуш1.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, failed to fetch CSV.`);
        }
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/); // Розділення на рядки (враховуючи \r)

        const devicesToImport = [];
        // Починаємо з 3-го рядка (індекс 2), пропускаючи порожній рядок і заголовки
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Пропускаємо порожні рядки

            // Простой парсер CSV, может не работать с запятыми внутри кавычек
            const columns = line.split(',');

            // Проверяем, есть ли достаточно колонок
            if (columns.length < 9) {
                 console.warn(`Skipping line ${i + 1}: not enough columns (${columns.length})`, line);
                 continue;
            }

            // Извлекаем данные
            const rm = columns[1].trim();
            const name = columns[2].trim();
            const type = columns[3].trim();
            const serial = columns[4].trim();
            const lastCheckDateStr = columns[5].trim();
            const mpiStr = columns[7].trim();
            const location = columns[8].trim();

            // --- Базовая валидация и преобразование ---
            if (!rm || !name || !type || !serial) {
                 console.warn(`Skipping line ${i + 1}: Missing required fields (RM, Name, Type, Serial)`, line);
                 continue;
            }

            let lastCheckDate = null;
            // Преобразование даты из ДД.ММ.ГГГГ в ГГГГ-ММ-ДД
            const dateMatch = lastCheckDateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (dateMatch) {
                lastCheckDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
            } else if (lastCheckDateStr) { // Логируем только если дата не пустая, но формат неверный
                 console.warn(`Line ${i + 1}: Invalid last check date format (${lastCheckDateStr}), setting to null.`, line);
            }

            const mpi = parseInt(mpiStr) || null;
            if (mpi === null && mpiStr) { // Логируем только если MPI не пустое, но не число
                 console.warn(`Line ${i + 1}: Invalid MPI value (${mpiStr}), setting to null.`, line);
            }

            // Создаем объект прибора БЕЗ ID и nextCheckDate (они будут добавлены позже)
            const deviceData = {
                rm: rm,
                name: name,
                type: type,
                serial: serial,
                lastCheckDate: lastCheckDate,
                mpi: mpi,
                location: location || null,
                povirkyLocation: null, // Инициализируем как null
                notes: null, // Инициализируем как null
            };

            devicesToImport.push(deviceData);
        }

        console.log(`Parsed ${devicesToImport.length} devices from CSV.`);

        if (devicesToImport.length > 0) {
            console.log("Saving imported devices to IndexedDB...");
            // Используем Promise.all для параллельного сохранения
            // handleSaveDevice сам сгенерирует ID и рассчитает nextCheckDate
            const savePromises = devicesToImport.map(deviceData => handleSaveDevice(deviceData, null)); // Передаем null как ID для создания

            await Promise.all(savePromises);
            console.log("Finished saving imported devices.");
            return true; // Сигнализируем, что импорт произошел
        } else {
             console.log("No valid devices found in CSV to import.");
        }

    } catch (error) {
        console.error("Error importing data from CSV:", error);
        alert("Помилка імпорту даних з CSV. Дивіться консоль.");
    }
    return false; // Импорт не состоялся или была ошибка
}

// --- Обробники подій ---

// Обробник кліку на кнопку "Додати"
addDeviceBtn.addEventListener('click', () => {
    openModal(null); // Відкриваємо модалку для додавання (null означает новый прибор)
});

// Обробник фільтрації РМ
rmFilterContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('filter-btn')) {
        const selectedRM = event.target.dataset.rm;
        if (selectedRM !== currentRMFilter) {
            currentRMFilter = selectedRM;
            // Обновляем активную кнопку
            rmFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.rm === currentRMFilter);
            });
            renderDeviceList(currentDevices, currentRMFilter); // Перерисовываем список с новым фильтром
        }
    }
});

// --- Початкове Завантаження ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM fully loaded and parsed. Initializing application...");
    try {
        await initDB();
        console.log("IndexedDB initialized. Loading initial data...");
        let initialDevices = await getAllDevices();
        console.log(`Loaded ${initialDevices.length} devices from IndexedDB.`);

        // Проверяем, пуста ли база данных и есть ли CSV файл для импорта
        if (initialDevices.length === 0) {
            console.log("Database is empty. Attempting initial import from CSV...");
            const imported = await importFromCSV();
            if (imported) {
                // Если импорт прошел успешно, перезагружаем данные из БД
                initialDevices = await getAllDevices();
                console.log(`Reloaded ${initialDevices.length} devices after import.`);
            } else {
                 console.log("CSV import failed or CSV was empty/invalid. Starting with an empty list.");
            }
        }

        // Обновляем глобальную переменную
        currentDevices = initialDevices;

        // Инициализируем обработчики UI, передавая НАШИ функции сохранения и удаления
        initUIHandlers(handleSaveDevice, handleDeleteDevice);

        // Инициализируем и показываем уведомления (если есть)
        initNotifications(currentDevices);

        // Первый рендеринг UI
        updateUI();

        console.log("Application initialization complete.");

    } catch (error) {
        console.error("Critical error during application initialization:", error);
        // Показываем сообщение об ошибке пользователю
        const listContainer = document.getElementById('device-list');
        if (listContainer) {
            listContainer.innerHTML = '<p class="error-message">Не вдалося завантажити дані програми. Будь ласка, спробуйте оновити сторінку або перевірте консоль розробника.</p>';
        }
         // Убираем плейсхолдер загрузки, если он есть
        const loadingPlaceholder = document.querySelector('.loading-placeholder');
        loadingPlaceholder?.remove();
    }
});
