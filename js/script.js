// Імпортуємо необхідні модулі та функції
// import { loadData, saveData } from './storage.js'; // Видалено
import { initDB, getAllDevices, saveDevice, deleteDevice } from './database.js'; // Додано
import { updateOverdueStats, renderDeviceList, openModal, closeModal, initUIHandlers } from './ui.js';
import { initNotifications, showNotifications } from './notifications.js';
import { calculateNextCheckDate } from './utils.js';

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
        await initDB(); // Спочатку ініціалізуємо БД
        console.log("IndexedDB ініціалізовано. Завантаження даних...");
        currentDevices = await getAllDevices(); // Потім завантажуємо дані
        console.log(`Завантажено ${currentDevices.length} приладів з IndexedDB.`);

        // Ініціалізуємо обробники UI, передаючи НАШІ функції як колбеки
        initUIHandlers(handleSaveDevice, handleDeleteDevice);

        // Ініціалізуємо та показуємо сповіщення
        initNotifications(currentDevices);

        // Перший рендеринг UI
        updateUI();

        console.log("Application initialized with IndexedDB.");

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
