// Импортируем необходимые модули и функции
import { loadData, saveData } from './storage.js'; // Добавлен импорт saveData
import { updateOverdueStats, renderDeviceList, openModal, closeModal, handleFormSubmit, handleDeviceDelete, initUIHandlers } from './ui.js'; // Импортируем функции UI, включая renderDeviceList
import { initNotifications, checkCalibrationNeeded } from './notifications.js'; // Импортируем функции уведомлений
import { calculateNextCheckDate, isNumeric } from './utils.js'; // Импортируем утилиты

// --- Глобальні змінні та DOM елементи ---
let currentDevices = [];
let currentRMFilter = 'all';
const deviceListContainer = document.getElementById('device-list');
const modal = document.getElementById('modal');
const closeModalBtn = modal.querySelector('.close-btn');
const addDeviceBtn = document.getElementById('add-device-btn');
const deviceForm = document.getElementById('device-form');
const modalTitle = document.getElementById('modal-title');
const rmFilterContainer = document.getElementById('rm-filter');
const deleteDeviceBtn = document.getElementById('delete-device-btn');
const deviceCountElement = document.getElementById('device-count');
const overdueCountElement = document.getElementById('overdue-count');
const loadingPlaceholder = document.querySelector('.loading-placeholder');

// --- Логіка Модального Вікна та Форми (перенесена в ui.js, тут залишаємо обробники) ---

// Обробники для закриття модального вікна
addDeviceBtn.addEventListener('click', () => openModal(null, currentDevices)); // Передаємо currentDevices
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Обробник події для відправки форми
deviceForm.addEventListener('submit', (event) => {
    // Викликаємо обробник з ui.js, передаючи необхідні дані
    handleFormSubmit(event, currentDevices, currentRMFilter);
    // Оновлюємо статистику після збереження
    updateOverdueStats(currentDevices);
    // Оновлюємо сповіщення, якщо потрібно
    initNotifications(currentDevices);
});

// Обробник події для кнопки "Видалити"
deleteDeviceBtn.addEventListener('click', () => {
    // Викликаємо обробник з ui.js
    handleDeviceDelete(currentDevices, currentRMFilter);
    // Оновлюємо статистику після видалення
    updateOverdueStats(currentDevices);
     // Оновлюємо сповіщення, якщо потрібно
    initNotifications(currentDevices);
});


// --- Логіка Фільтрації РМ ---

rmFilterContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('filter-btn')) {
        const selectedRM = event.target.dataset.rm;
        if (selectedRM !== currentRMFilter) {
            currentRMFilter = selectedRM;
            rmFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            // Використовуємо імпортовану функцію renderDeviceList
            renderDeviceList(currentDevices, currentRMFilter);
        }
    }
});


// --- Початкове Завантаження ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM завантажено. Завантаження даних...");
    currentDevices = loadData(); // Завантажуємо дані з storage.js
    console.log(`Завантажено ${currentDevices.length} приладів.`);

    // Ініціалізуємо UI (включаючи початковий рендеринг списку та статистику)
    updateOverdueStats(currentDevices);
    renderDeviceList(currentDevices, currentRMFilter); // Перший рендерінг
    initUIHandlers(currentDevices, currentRMFilter); // Ініціалізація обробників UI з ui.js

    // Ініціалізуємо систему сповіщень
    initNotifications(currentDevices); // Використовуємо функцію з notifications.js
});

// --- Видалено дублюючі функції ---
// Функції formatDate, calculateNextCheckDate, getNextCheckDateStatus, getTimelineData, sortDevices
// тепер імпортуються з utils.js або використовуються в ui.js.
// Функція renderDeviceList тепер імпортується з ui.js.
// Функції openModal, closeModal, handleFormSubmit, handleDeviceDelete тепер імпортуються або обробляються в ui.js.
// Функції saveData, loadData тепер імпортуються з storage.js.
// Функції checkCalibrationNeeded, showNotifications, initNotifications тепер імпортуються з notifications.js.
// Функція isNumeric тепер імпортується з utils.js.

// Переконуємося, що Service Worker реєструється (цей код залишається в index.html)
/*
if ('serviceWorker' in navigator) {
    const swPath = 'service-worker.js';
    navigator.serviceWorker.register(swPath)
    .then(registration => {
        console.log('Service Worker зареєстровано:', registration.scope);
    })
    .catch(error => {
        console.error('Помилка реєстрації Service Worker:', error);
    });
}
*/
