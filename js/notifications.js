import { isNumeric, calculateNextCheckDate, getNextCheckDateStatus } from './utils.js'; // Імпортуємо потрібні утиліти

// Функція перевірки необхідності повірки (використовує розраховану дату)
export function checkCalibrationNeeded(device) {
    // Спочатку розрахуємо актуальну дату наступної повірки
    const nextCheck = calculateNextCheckDate(device.lastCheckDate, device.mpi);
    if (!nextCheck) return { isNeeded: false, nextCheckDate: null }; // Якщо дату неможливо розрахувати

    const status = getNextCheckDateStatus(nextCheck);

    // Умови для показу сповіщення:
    // 1. Статус "прострочено" (date-expired)
    // 2. АБО статус "попередження" (date-warning) - за бажанням, можна додати
    // 3. Місце повірки вказано і це не просто "-"
    const needsAttention = status.class === 'date-expired'; // || status.class === 'date-warning';

    // Додаткова умова: чи є куди везти на повірку?
    const hasValidPovirkyLocation = device.povirkyLocation && typeof device.povirkyLocation === 'string' && device.povirkyLocation.trim() !== '-' && device.povirkyLocation.trim() !== '';

    return {
        isNeeded: needsAttention && hasValidPovirkyLocation,
        nextCheckDate: status.date // Повертаємо об'єкт Date
    };
}

// Функція для відображення сповіщень
export function showNotifications(devices) {
    // Знаходимо новий контейнер для сповіщень
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) {
        console.error("Notification area element (#notification-area) not found in HTML.");
        return; // Виходимо, якщо контейнера немає
    }

    notificationArea.innerHTML = ''; // Очищуємо контейнер перед додаванням нових сповіщень
    let notificationCount = 0;

    devices.forEach(device => {
        const calibrationCheck = checkCalibrationNeeded(device);
        if (calibrationCheck.isNeeded) {
            notificationCount++;
            const notification = document.createElement('div');
            // Додаємо класи для стилізації та анімації
            notification.className = 'notification notification-warning slide-in'; // Використовуємо клас warning для стилю

            // Оновлений текст сповіщення з РМ
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-triangle-exclamation"></i> </div>
                <div class="notification-content">
                    <strong>Повірка!</strong> Прилад "${device.name || 'Без назви'}" (РМ: ${device.rm || '?'})
                    потребує повірки в "${device.povirkyLocation}".
                </div>
                <button class="notification-close-btn" aria-label="Закрити сповіщення">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Додаємо обробник для кнопки закриття
            notification.querySelector('.notification-close-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Зупиняємо спливання події
                notification.classList.remove('slide-in');
                notification.classList.add('slide-out'); // Додаємо клас для анімації зникнення
                // Видаляємо елемент після завершення анімації
                setTimeout(() => notification.remove(), 300);
            });

            notificationArea.appendChild(notification);
        }
    });
     console.log(`Displayed ${notificationCount} calibration notifications.`);
}

// Функція ініціалізації системи сповіщень
// Приймає функцію для отримання актуального списку приладів
export function initNotifications(getDevices) {
    console.log("Initializing notifications system.");
    showNotifications(getDevices()); // Показуємо сповіщення при завантаженні

    // Можна додати періодичне оновлення, якщо потрібно
    // setInterval(() => {
    //     console.log("Refreshing notifications...");
    //     showNotifications(getDevices());
    // }, 3600000); // Наприклад, кожну годину
}
