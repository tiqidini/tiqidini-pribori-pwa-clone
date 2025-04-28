import { isNumeric, calculateNextCheckDate, getNextCheckDateStatus } from './utils.js';

// Функція перевірки необхідності повірки
function checkCalibrationNeeded(device) { // Зроблено внутрішньою
    const nextCheck = calculateNextCheckDate(device.lastCheckDate, device.mpi);
    if (!nextCheck) return { isNeeded: false, nextCheckDate: null };

    const status = getNextCheckDateStatus(nextCheck);
    const needsAttention = status.class === 'date-expired';
    // Перевіряємо, чи місце повірки вказано і не є просто тире або порожнім рядком
    const hasValidPovirkyLocation = device.povirkyLocation && typeof device.povirkyLocation === 'string' && device.povirkyLocation.trim() !== '-' && device.povirkyLocation.trim() !== '';

    return {
        isNeeded: needsAttention && hasValidPovirkyLocation,
        nextCheckDate: status.date // Повертаємо об'єкт Date для сортування
    };
}

// Функція для відображення сповіщень
export function showNotifications(devices) {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) {
        console.error("Notification area element (#notification-area) not found in HTML.");
        return;
    }

    notificationArea.innerHTML = ''; // Очищаємо попередні сповіщення
    let notificationCount = 0;

    // Фільтруємо прилади, які потребують сповіщення
    const devicesToShowNotification = devices.filter(device => checkCalibrationNeeded(device).isNeeded);

    // Сортуємо їх за датою наступної повірки (спочатку найстаріші)
     devicesToShowNotification.sort((a, b) => {
        const checkA = checkCalibrationNeeded(a);
        const checkB = checkCalibrationNeeded(b);

        // Якщо дати є, сортуємо по них
        if (checkA.nextCheckDate && checkB.nextCheckDate) {
            return checkA.nextCheckDate.getTime() - checkB.nextCheckDate.getTime();
        }
        // Якщо тільки у A є дата, він йде першим
        if (checkA.nextCheckDate) return -1;
        // Якщо тільки у B є дата, він йде першим
        if (checkB.nextCheckDate) return 1;
        // Якщо дат немає, порядок не важливий
        return 0;
    });


    devicesToShowNotification.forEach(device => {
        notificationCount++;
        const notification = document.createElement('div');
        notification.className = 'notification notification-warning slide-in';

        // Перераховуємо дату для відображення тексту
        const nextCheckDateForDisplay = calculateNextCheckDate(device.lastCheckDate, device.mpi);
        const nextCheckStatusForDisplay = getNextCheckDateStatus(nextCheckDateForDisplay);

        // --- ИЗМЕНЕНО: Используем device.type и полный текст для даты ---
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div class="notification-content">
                <strong>Повірка!</strong> Прилад типу "${device.type || 'Невідомий тип'}" (РМ: ${device.rm || '?'})
                потребує повірки в "${device.povirkyLocation}". Наступна повірка: ${nextCheckStatusForDisplay.text}
            </div>
            <button class="notification-close-btn" aria-label="Закрити сповіщення">
                <i class="fas fa-times"></i>
            </button>
        `;
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---

        notification.querySelector('.notification-close-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Зупиняємо спливання події, щоб не спрацював клік по картці
            notification.classList.remove('slide-in');
            notification.classList.add('slide-out');
            // Видаляємо елемент після завершення анімації
            setTimeout(() => notification.remove(), 300);
        });

        notificationArea.appendChild(notification);
    });
    // console.log(`Displayed ${notificationCount} calibration notifications.`);
}

// Функція ініціалізації системи сповіщень
export function initNotifications(initialDevices) {
    console.log("Initializing notifications system (showing initial state).");
    if (Array.isArray(initialDevices)) {
        showNotifications(initialDevices); // Показуємо сповіщення при завантаженні
    } else {
         console.error("ERROR: initNotifications received invalid data type:", typeof initialDevices);
    }
}
