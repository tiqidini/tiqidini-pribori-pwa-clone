import { isNumeric, calculateNextCheckDate, getNextCheckDateStatus } from './utils.js';

// Функція перевірки необхідності повірки
function checkCalibrationNeeded(device) { // Зроблено внутрішньою
    const nextCheck = calculateNextCheckDate(device.lastCheckDate, device.mpi);
    if (!nextCheck) return { isNeeded: false, nextCheckDate: null };

    const status = getNextCheckDateStatus(nextCheck);
    const needsAttention = status.class === 'date-expired';
    const hasValidPovirkyLocation = device.povirkyLocation && typeof device.povirkyLocation === 'string' && device.povirkyLocation.trim() !== '-' && device.povirkyLocation.trim() !== '';

    return {
        isNeeded: needsAttention && hasValidPovirkyLocation,
        nextCheckDate: status.date
    };
}

// Функція для відображення сповіщень
// Тепер приймає безпосередньо масив devices
export function showNotifications(devices) {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) {
        console.error("Notification area element (#notification-area) not found in HTML.");
        return;
    }

    notificationArea.innerHTML = '';
    let notificationCount = 0;

    // Фільтруємо прилади, які потребують сповіщення
    const devicesToShowNotification = devices.filter(device => checkCalibrationNeeded(device).isNeeded);

    // Сортуємо їх за датою наступної повірки (спочатку найстаріші)
     devicesToShowNotification.sort((a, b) => {
        // Перераховуємо дати прямо тут для надійності
        const dateA = calculateNextCheckDate(a.lastCheckDate, a.mpi);
        const dateB = calculateNextCheckDate(b.lastCheckDate, b.mpi);
        const statusA = getNextCheckDateStatus(dateA);
        const statusB = getNextCheckDateStatus(dateB);

        if (statusA.date && !statusB.date) return -1;
        if (!statusA.date && statusB.date) return 1;
        if (statusA.date && statusB.date) {
            return statusA.date.getTime() - statusB.date.getTime();
        }
        return 0;
    });


    devicesToShowNotification.forEach(device => {
        notificationCount++;
        const notification = document.createElement('div');
        notification.className = 'notification notification-warning slide-in';
        // Перераховуємо дату для відображення тексту
        const nextCheckDateForDisplay = calculateNextCheckDate(device.lastCheckDate, device.mpi);
        const nextCheckStatusForDisplay = getNextCheckDateStatus(nextCheckDateForDisplay);


        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div class="notification-content">
                <strong>Повірка!</strong> Прилад "${device.name || 'Без назви'}" (РМ: ${device.rm || '?'})
                потребує повірки в "${device.povirkyLocation}". Наст. пов.: ${nextCheckStatusForDisplay.text}
            </div>
            <button class="notification-close-btn" aria-label="Закрити сповіщення">
                <i class="fas fa-times"></i>
            </button>
        `;

        notification.querySelector('.notification-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            notification.classList.remove('slide-in');
            notification.classList.add('slide-out');
            setTimeout(() => notification.remove(), 300);
        });

        notificationArea.appendChild(notification);
    });
    // console.log(`Displayed ${notificationCount} calibration notifications.`);
}

// Функція ініціалізації системи сповіщень
// Тепер викликається лише один раз при завантаженні з script.js
// і отримує початковий масив devices
export function initNotifications(initialDevices) { // <-- ПЕРЕВІРТЕ ЦЕЙ РЯДОК! Параметр має бути initialDevices
    console.log("Initializing notifications system (showing initial state).");
    // Перевірка типу аргументу для діагностики
    if (typeof initialDevices === 'function') {
        console.error("ERROR: initNotifications received a function instead of an array!");
        // Спроба викликати функцію, якщо це помилково передана getDevices
        try {
            const devicesArray = initialDevices();
             if(Array.isArray(devicesArray)) {
                showNotifications(devicesArray);
             } else {
                 console.error("ERROR: The function passed to initNotifications did not return an array.");
             }
        } catch (e) {
             console.error("ERROR: Failed to execute the function passed to initNotifications:", e);
        }

    } else if (Array.isArray(initialDevices)) {
        showNotifications(initialDevices); // Показуємо сповіщення при завантаженні
    } else {
         console.error("ERROR: initNotifications received invalid data type:", typeof initialDevices);
    }
}
