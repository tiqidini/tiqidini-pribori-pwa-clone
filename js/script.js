// Імпортуємо необхідні модулі та функції
// import { loadData, saveData } from './storage.js'; // Видалено
import { initDB, getAllDevices, saveDevice, deleteDevice } from './database.js'; // Додано
import { updateOverdueStats, renderDeviceList, openModal, closeModal, initUIHandlers } from './ui.js';
import { initNotifications, showNotifications } from './notifications.js';
import { calculateNextCheckDate, formatDateForInput } from './utils.js'; // Додано formatDateForInput

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

    formData.nextCheckDate = calculateNextCheckDate(formData.lastCheckDate, formData.mpi);

    try {
        // Створюємо об'єкт для збереження (переконуємося, що ID є, якщо редагуємо)
        const deviceToSave = { ...formData };
        if (isEditing) {
            deviceToSave.id = id;
        } else {
            // Генеруємо новий ID, якщо це новий прилад
            let newId = (formData.serial || 'no_serial') + '_' + Date.now();
            while (currentDevices.some(d => d.id === newId)) {
                newId = (formData.serial || 'no_serial') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
            }
            deviceToSave.id = newId;
        }

        await saveDevice(deviceToSave); // Зберігаємо в IndexedDB

        // Оновлюємо локальний масив currentDevices ПІСЛЯ успішного збереження в БД
        if (isEditing) {
            const index = currentDevices.findIndex(d => d.id === id);
            if (index !== -1) {
                currentDevices[index] = deviceToSave;
                console.log("Device updated in currentDevices array.");
            } else {
                 console.warn(`Device with ID ${id} was saved to DB, but not found in currentDevices array for update.`);
                 // Можливо, варто перезавантажити дані з БД тут, але поки що оновимо UI
            }
        } else {
            currentDevices.push(deviceToSave);
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
        const response = await fetch('Прилади - Аркуш1.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/); // Розділення на рядки (враховуючи \r)

        const devicesToSave = [];
        // Починаємо з 3-го рядка (індекс 2), пропускаючи порожній рядок і заголовки
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Пропускаємо порожні рядки

            // Розділяємо рядок по комірках. Увага: цей метод не обробляє коми всередині лапок.
            // Якщо у вас є коми в назвах, потрібен складніший парсер.
            const columns = line.split(',');

            // Перевіряємо, чи є достатньо колонок (припускаємо 9 колонок, як у файлі)
            if (columns.length < 9) {
                 console.warn(`Skipping line ${i + 1}: not enough columns (${columns.length})`, line);
                 continue;
            }

            // Витягуємо дані з потрібних колонок (індекси з 0)
            const rm = columns[1].trim();
            const name = columns[2].trim();
            const type = columns[3].trim();
            const serial = columns[4].trim();
            const lastCheckDateStr = columns[5].trim();
            // const nextCheckDateStr = columns[6].trim(); // Не використовуємо
            const mpiStr = columns[7].trim();
            const location = columns[8].trim();

            // --- Базова валідація та перетворення ---
            if (!rm || !name || !type || !serial) {
                 console.warn(`Skipping line ${i + 1}: Missing required fields (RM, Name, Type, Serial)`, line);
                 continue;
            }

            let lastCheckDate = null;
            // Спроба перетворити дату з ДД.ММ.ГГГГ в ГГГГ-ММ-ДД
            const dateMatch = lastCheckDateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (dateMatch) {
                lastCheckDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
            } else {
                 console.warn(`Skipping line ${i + 1}: Invalid last check date format (${lastCheckDateStr})`, line);
                // Можна залишити null або пропустити рядок зовсім
                 lastCheckDate = null; // залишаємо null, якщо формат неправильний
            }

            const mpi = parseInt(mpiStr) || null;
            if (mpi === null) {
                 console.warn(`Skipping line ${i + 1}: Invalid MPI value (${mpiStr})`, line);
                 //continue; // Якщо MPI обов'язковий, розкоментуйте
            }

            // Створюємо об'єкт приладу БЕЗ ID
            const deviceData = {
                rm: rm,
                name: name,
                type: type,
                serial: serial,
                lastCheckDate: lastCheckDate,
                mpi: mpi,
                location: location || null, // Якщо розташування порожнє, ставимо null
                povirkyLocation: null, // Цієї колонки немає в CSV, ініціалізуємо як null
                notes: null, // Цієї колонки немає в CSV
                // ID буде згенеровано в handleSaveDevice/saveDevice
            };

            devicesToSave.push(deviceData);
        }

        console.log(`Parsed ${devicesToSave.length} devices from CSV.`);

        if (devicesToSave.length > 0) {
            console.log("Saving imported devices to IndexedDB...");
            // Використовуємо Promise.all для паралельного збереження, але обережно з великою кількістю
            // Можливо, краще зберігати послідовно або пакетами для дуже великих файлів

            // Потрібно генерувати ID тут або передавати дані в handleSaveDevice,
            // який сам згенерує ID, якщо він відсутній.
            // Викличемо handleSaveDevice для кожного, щоб використати існуючу логіку генерації ID.
            const savePromises = devicesToSave.map(deviceData => handleSaveDevice(deviceData, null));

            await Promise.all(savePromises);
            console.log("Finished saving imported devices.");
            return true; // Сигналізуємо, що імпорт відбувся
        }

    } catch (error) {
        console.error("Error importing data from CSV:", error);
        alert("Помилка імпорту даних з CSV. Дивіться консоль.");
    }
    return false; // Імпорт не відбувся або була помилка
}

// --- Обробники подій ---

// Обробник кліку на кнопку "Додати"
addDeviceBtn.addEventListener('click', () => {
    openModal(null); // Відкриваємо модалку для додавання
});

// Обробник фільтрації РМ
rmFilterContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('filter-btn')) {
        const selectedRM = event.target.dataset.rm;
        if (selectedRM !== currentRMFilter) {
            currentRMFilter = selectedRM;
            rmFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.rm === currentRMFilter);
            });
            renderDeviceList(currentDevices, currentRMFilter); // Перемальовуємо список
        }
    }
});

// --- Початкове Завантаження ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM завантажено. Ініціалізація IndexedDB...");
    try {
        await initDB();
        console.log("IndexedDB ініціалізовано. Завантаження даних...");
        let initialDevices = await getAllDevices();
        console.log(`Завантажено ${initialDevices.length} приладів з IndexedDB.`);

        // Перевіряємо, чи база даних порожня
        if (initialDevices.length === 0) {
            console.log("База даних порожня. Спроба імпорту з CSV...");
            const imported = await importFromCSV();
            if (imported) {
                // Якщо імпорт пройшов успішно, перезавантажуємо дані з БД
                initialDevices = await getAllDevices();
                console.log(`Перезавантажено ${initialDevices.length} приладів після імпорту.`);
            }
        }

        // Оновлюємо глобальну змінну
        currentDevices = initialDevices;

        // Ініціалізуємо обробники UI, передаючи НАШІ функції як колбеки
        initUIHandlers(handleSaveDevice, handleDeleteDevice);

        // Ініціалізуємо та показуємо сповіщення
        initNotifications(currentDevices);

        // Перший рендеринг UI
        updateUI();

        console.log("Application initialized."); // Змінено повідомлення

    } catch (error) {
        console.error("Помилка ініціалізації програми:", error);
        // Можна показати повідомлення користувачу про помилку завантаження
        const listContainer = document.getElementById('device-list');
        if (listContainer) {
            listContainer.innerHTML = '<p class="error-message">Не вдалося завантажити дані. Перевірте консоль для деталей.</p>';
        }
        // Прибираємо плейсхолдер завантаження, якщо він є
        const loadingPlaceholder = document.querySelector('.loading-placeholder');
        loadingPlaceholder?.remove();
    }
});
