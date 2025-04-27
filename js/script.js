// Імпортуємо необхідні модулі та функції
import { loadData, saveData } from './storage.js';
import { updateOverdueStats, renderDeviceList, openModal, closeModal, initUIHandlers } from './ui.js';
import { initNotifications, showNotifications } from './notifications.js'; // Додано showNotifications
import { calculateNextCheckDate } from './utils.js'; // Імпортуємо для розрахунку

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
    showNotifications(currentDevices); // Оновлюємо сповіщення
}

// --- Функції для роботи з даними ---

// Функція для збереження/оновлення приладу
function handleSaveDevice(formData, id) {
    console.log("handleSaveDevice called with ID:", id, "and data:", formData);
    const isEditing = !!id;

    // Перераховуємо дату наступної перевірки
    formData.nextCheckDate = calculateNextCheckDate(formData.lastCheckDate, formData.mpi);

    if (isEditing) {
        // Оновлення
        const index = currentDevices.findIndex(d => d.id === id);
        if (index !== -1) {
            currentDevices[index] = { ...formData, id: id }; // Оновлюємо в масиві
            console.log("Device updated in currentDevices:", currentDevices[index]);
        } else {
            console.error(`Error: Device with ID ${id} not found for update in currentDevices.`);
            alert("Помилка: не вдалося знайти прилад для оновлення.");
            return; // Зупиняємо, якщо не знайдено
        }
    } else {
        // Додавання
        let newId = (formData.serial || 'no_serial') + '_' + Date.now();
        while (currentDevices.some(d => d.id === newId)) {
            newId = (formData.serial || 'no_serial') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
        }
        formData.id = newId;
        currentDevices.push(formData); // Додаємо до масиву
        console.log("New device added to currentDevices:", formData);
    }

    saveData(currentDevices); // Зберігаємо оновлений масив
    updateUI(); // Оновлюємо весь інтерфейс
    closeModal(); // Закриваємо модальне вікно
}

// Функція для видалення приладу
function handleDeleteDevice(id) {
    console.log(`handleDeleteDevice called with ID: ${id}`);
    const initialLength = currentDevices.length;
    currentDevices = currentDevices.filter(device => device.id !== id); // Створюємо новий масив без видаленого елемента

    if (currentDevices.length < initialLength) {
        saveData(currentDevices); // Зберігаємо зміни
        console.log("Device deleted from currentDevices. ID:", id);
        updateUI(); // Оновлюємо весь інтерфейс
        closeModal(); // Закриваємо модальне вікно
    } else {
        console.error(`Error: Device with ID ${id} not found for deletion in currentDevices.`);
        alert("Помилка: не вдалося знайти прилад для видалення.");
    }
}

// --- Обробники подій ---

// Обробник кліку на кнопку "Додати"
addDeviceBtn.addEventListener('click', () => {
    openModal(null); // Відкриваємо модалку для додавання (передаємо null)
});

// Обробник фільтрації РМ
rmFilterContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('filter-btn')) {
        const selectedRM = event.target.dataset.rm;
        if (selectedRM !== currentRMFilter) {
            currentRMFilter = selectedRM;
            // Оновлюємо активну кнопку
            rmFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.rm === currentRMFilter);
            });
            // Перемальовуємо тільки список приладів з новим фільтром
            renderDeviceList(currentDevices, currentRMFilter);
        }
    }
});

// --- Початкове Завантаження ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM завантажено. Завантаження даних...");
    currentDevices = loadData(); // Завантажуємо дані
    console.log(`Завантажено ${currentDevices.length} приладів.`);

    // Ініціалізуємо обробники UI, передаючи функції для збереження та видалення
    initUIHandlers(handleSaveDevice, handleDeleteDevice);

    // Ініціалізуємо та показуємо сповіщення
    initNotifications(currentDevices); // Передаємо актуальний масив

    // Перший рендеринг UI
    updateUI();

    console.log("Application initialized.");
});
