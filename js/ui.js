import { formatDate, getNextCheckDateStatus, getTimelineData, calculateNextCheckDate } from './utils.js'; // Додано calculateNextCheckDate
import { saveData } from './storage.js';
import { initNotifications } from './notifications.js'; // Імпортуємо для оновлення сповіщень

// DOM элементы
const deviceListContainer = document.getElementById('device-list');
const modal = document.getElementById('modal');
const closeModalBtn = modal.querySelector('.close-btn');
const deviceForm = document.getElementById('device-form');
const modalTitle = document.getElementById('modal-title');
const deleteDeviceBtn = document.getElementById('delete-device-btn');
const deviceCountElement = document.getElementById('device-count');
const overdueCountElement = document.getElementById('overdue-count');
const loadingPlaceholder = document.querySelector('.loading-placeholder');

// Функція оновлення статистики прострочених приладів
export function updateOverdueStats(devices) {
    const overdueCount = devices.filter(device => {
        // Перераховуємо статус на основі актуальних даних
        const nextCheck = calculateNextCheckDate(device.lastCheckDate, device.mpi);
        const status = getNextCheckDateStatus(nextCheck); // Використовуємо перераховану дату
        return status.class === 'date-expired';
    }).length;
    overdueCountElement.textContent = overdueCount;
    console.log('Overdue stats updated:', overdueCount);
}

// Функція рендерингу списку приладів
export function renderDeviceList(devices, currentRMFilter) {
    console.log(`Rendering device list. Total devices: ${devices.length}, RM Filter: ${currentRMFilter}`);
    deviceListContainer.innerHTML = ''; // Очищуємо контейнер перед рендерингом
    loadingPlaceholder?.remove(); // Видаляємо завантажувач, якщо він є

    const filteredByRM = currentRMFilter === 'all'
        ? [...devices] // Створюємо копію масиву
        : devices.filter(device => device.rm === currentRMFilter);

    const count = filteredByRM.length;
    deviceCountElement.textContent = count;
    console.log(`Devices matching filter: ${count}`);

    if (count === 0 && currentRMFilter !== 'all') {
        deviceListContainer.innerHTML = `<p class="no-devices">Немає приладів для РМ "${currentRMFilter}".</p>`;
        return;
    }
     if (count === 0 && currentRMFilter === 'all') {
        deviceListContainer.innerHTML = `<p class="no-devices">Список приладів порожній. Натисніть "Додати", щоб почати.</p>`;
        return;
    }

    // Сортування перед відображенням (необов'язково, але може бути корисним)
    // filteredByRM.sort((a, b) => /* логіка сортування, наприклад, за датою */);

    filteredByRM.forEach(device => {
        const card = document.createElement('div');
        card.classList.add('device-card');
        // Переконуємося, що ID є унікальним і стабільним
        card.dataset.id = device.id || `error_no_id_${Math.random()}`;
        if (!device.id) {
            console.error("Device is missing ID:", device);
        }

        // Перераховуємо дату наступної перевірки перед рендерингом
        const actualNextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
        const nextCheckStatus = getNextCheckDateStatus(actualNextCheckDate); // Використовуємо актуальну дату
        const timeline = getTimelineData(device.lastCheckDate, actualNextCheckDate, device.mpi); // Використовуємо актуальну дату

        card.innerHTML = `
            <h3>${device.name || 'Без назви'}</h3>
            <div class="device-type-container">${device.type || '-'}</div>
            <p><strong>Зав. №:</strong> ${device.serial || '-'}</p>
            <p><strong>РМ:</strong> ${device.rm || '-'}</p>
            <p><strong>Розташування:</strong> ${device.location || '-'}</p>
            <p><strong>Місце повірки:</strong> ${device.povirkyLocation || '-'}</p>
            <p><strong>Остання пов.:</strong> ${formatDate(device.lastCheckDate)}</p>
            <p><strong>МПІ:</strong> ${device.mpi ? `${device.mpi} р.` : '-'}</p>
            <p><strong>Наступна пов.:</strong>
                <span class="date-cell ${nextCheckStatus.class}">${nextCheckStatus.text}</span>
            </p>
            ${timeline.percent > 0 || timeline.statusClass === 'expired' ? `
            <div class="calibration-timeline" title="Минуло приблизно ${timeline.percent}% інтервалу повірки">
                <div class="timeline-progress ${timeline.statusClass}" style="width: ${timeline.percent}%;"></div>
            </div>
            ` : ''}
            ${device.notes ? `<p><strong>Примітки:</strong> <span class="notes-text">${device.notes}</span></p>` : ''}
        `;

        // Додаємо обробник кліку для відкриття модального вікна редагування
        card.addEventListener('click', () => {
            const clickedDeviceId = card.dataset.id;
            const deviceToEdit = devices.find(d => d.id === clickedDeviceId);
            if (deviceToEdit) {
                openModal(deviceToEdit, devices); // Передаємо весь масив devices
            } else {
                console.error(`Device with ID ${clickedDeviceId} not found for editing.`);
                alert("Помилка: не вдалося знайти прилад для редагування.");
            }
        });
        deviceListContainer.appendChild(card);
    });
     console.log("Device list rendering complete.");
}

// Функція відкриття модального вікна
export function openModal(device = null, devices) { // devices передається для доступу в інших функціях
    deviceForm.reset(); // Скидаємо форму
    deviceForm.classList.remove('was-validated'); // Скидаємо статус валідації Bootstrap (якщо використовується)

    if (device) {
        // Режим редагування
        modalTitle.textContent = 'Редагувати Прилад';
        document.getElementById('device-id').value = device.id || ''; // Встановлюємо ID
        document.getElementById('device-rm').value = device.rm || '';
        document.getElementById('device-name').value = device.name || '';
        document.getElementById('device-type').value = device.type || '';
        document.getElementById('device-serial').value = device.serial || '';
        document.getElementById('device-lastCheckDate').value = device.lastCheckDate || '';
        document.getElementById('device-mpi').value = device.mpi || '';
        document.getElementById('device-location').value = device.location || '';
        document.getElementById('device-povirkyLocation').value = device.povirkyLocation || '';
        document.getElementById('device-notes').value = device.notes || '';
        deleteDeviceBtn.classList.remove('hidden'); // Показуємо кнопку видалення
        console.log("Opening modal for editing device:", device.id);
    } else {
        // Режим додавання
        modalTitle.textContent = 'Додати Прилад';
        document.getElementById('device-id').value = ''; // ID порожній
        deleteDeviceBtn.classList.add('hidden'); // Ховаємо кнопку видалення
        console.log("Opening modal for adding a new device.");
    }
    modal.style.display = 'block'; // Показуємо модальне вікно
    // Фокус на першому полі для зручності
    setTimeout(() => document.getElementById('device-rm').focus(), 50);
}

// Функція закриття модального вікна
export function closeModal() {
    modal.style.display = 'none'; // Ховаємо вікно
    deviceForm.reset(); // Скидаємо форму
    console.log("Modal closed.");
}

// Функція обробки відправки форми (збереження/оновлення)
export function handleFormSubmit(event, devices, currentRMFilter) {
    event.preventDefault(); // Запобігаємо стандартній відправці форми
    console.log("Form submitted.");

    const id = document.getElementById('device-id').value; // Отримуємо ID (порожній для нового)
    const isEditing = !!id; // Визначаємо, чи це редагування

    // Збираємо дані з форми
    const formData = {
        rm: document.getElementById('device-rm').value.trim(),
        name: document.getElementById('device-name').value.trim(),
        type: document.getElementById('device-type').value.trim(),
        serial: document.getElementById('device-serial').value.trim(),
        lastCheckDate: document.getElementById('device-lastCheckDate').value || null, // null якщо порожньо
        mpi: parseInt(document.getElementById('device-mpi').value) || null, // null якщо не число або 0
        location: document.getElementById('device-location').value.trim() || null,
        povirkyLocation: document.getElementById('device-povirkyLocation').value.trim() || null,
        notes: document.getElementById('device-notes').value.trim() || null
    };

    // --- ВИДАЛЕНО ПЕРЕВІРКУ ОБОВ'ЯЗКОВИХ ПОЛІВ ПРИ РЕДАГУВАННІ ---
    // Перевірка обов'язкових полів ТІЛЬКИ при додаванні нового приладу
    if (!isEditing && (!formData.rm || !formData.name || !formData.type || !formData.serial)) {
        alert("Будь ласка, заповніть обов'язкові поля: РМ, Найменування, Тип, Заводський номер.");
        console.warn("Required fields missing for new device.");
        return; // Зупиняємо виконання
    }
    // --- КІНЕЦЬ ЗМІНИ ---

    // Розраховуємо дату наступної перевірки на основі даних форми
    const calculatedNextCheckDate = calculateNextCheckDate(formData.lastCheckDate, formData.mpi);
    formData.nextCheckDate = calculatedNextCheckDate; // Додаємо розраховану дату до об'єкта

    if (isEditing) {
        // Оновлення існуючого приладу
        const index = devices.findIndex(d => d.id === id);
        if (index !== -1) {
            // Оновлюємо дані в масиві, зберігаючи ID
            devices[index] = { ...formData, id: id };
            console.log("Device updated:", devices[index]);
        } else {
            // Ця ситуація не повинна виникати, якщо логіка правильна
            console.error(`Error: Device with ID ${id} not found for update.`);
            alert("Помилка: не вдалося знайти прилад для оновлення.");
            return; // Зупиняємо виконання
        }
    } else {
        // Додавання нового приладу
        // Генеруємо унікальний ID (можна покращити генерацію)
        let newId = (formData.serial || 'no_serial') + '_' + Date.now();
        // Перевірка на унікальність (про всяк випадок)
        while (devices.some(d => d.id === newId)) {
            newId = (formData.serial || 'no_serial') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
        }
        formData.id = newId; // Присвоюємо згенерований ID
        devices.push(formData); // Додаємо новий прилад до масиву
        console.log("New device added:", formData);
    }

    // Зберігаємо оновлений масив у localStorage
    saveData(devices);

    // Оновлюємо інтерфейс
    updateOverdueStats(devices); // Оновлюємо статистику прострочених
    renderDeviceList(devices, currentRMFilter); // Перемальовуємо список
    initNotifications(devices); // Оновлюємо сповіщення

    closeModal(); // Закриваємо модальне вікно
    console.log("Form processing complete. Modal closed.");
}

// Функція видалення приладу
export function handleDeviceDelete(devices, currentRMFilter) {
    const id = document.getElementById('device-id').value; // Отримуємо ID приладу з форми
    const deviceName = document.getElementById('device-name').value || 'цей прилад'; // Для повідомлення
    if (!id) {
        console.warn("Delete button clicked, but no device ID found in the form.");
        return; // Нічого видаляти
    }

    // Запитуємо підтвердження у користувача
    if (confirm(`Ви впевнені, що хочете видалити прилад "${deviceName}" (ID: ${id})?`)) {
        console.log(`Attempting to delete device with ID: ${id}`);
        const initialLength = devices.length;
        // Створюємо новий масив, відфільтрувавши прилад за ID
        const newDevices = devices.filter(device => device.id !== id);

        // Перевіряємо, чи дійсно щось було видалено
        if (newDevices.length < initialLength) {
            // Оновлюємо оригінальний масив (важливо для передачі по посиланню)
            devices.length = 0; // Очищуємо старий масив
            devices.push(...newDevices); // Наповнюємо його новими даними

            saveData(devices); // Зберігаємо зміни
            console.log("Device deleted successfully. ID:", id);

            // Оновлюємо UI
            updateOverdueStats(devices);
            renderDeviceList(devices, currentRMFilter);
            initNotifications(devices); // Оновлюємо сповіщення
            closeModal(); // Закриваємо модальне вікно
        } else {
            // Це може статися, якщо ID в формі не відповідає жодному приладу в масиві
            console.error(`Error: Device with ID ${id} not found for deletion.`);
            alert("Помилка: не вдалося знайти прилад для видалення.");
        }
    } else {
        console.log("Device deletion cancelled by user.");
    }
}

// Функція ініціалізації обробників подій UI (викликається один раз при завантаженні)
// Передаємо devices та currentRMFilter, щоб обробники мали доступ до актуальних даних
export function initUIHandlers(getDevices, getCurrentRMFilter) {
     console.log("Initializing UI handlers.");
    // Обробники модального вікна
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        // Закриття по кліку поза вікном
        if (event.target === modal) closeModal();
    });
    window.addEventListener('keydown', (event) => {
        // Закриття по Esc
        if (event.key === 'Escape' && modal.style.display === 'block') closeModal();
    });

    // Обробник відправки форми
    deviceForm.addEventListener('submit', (event) => {
        // Передаємо функції для отримання актуальних даних на момент відправки
        handleFormSubmit(event, getDevices(), getCurrentRMFilter());
    });

    // Обробник кнопки видалення
    deleteDeviceBtn.addEventListener('click', () => {
         // Передаємо функції для отримання актуальних даних на момент кліку
        handleDeviceDelete(getDevices(), getCurrentRMFilter());
    });
     console.log("UI handlers initialized.");
}
