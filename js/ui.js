import { formatDate, getNextCheckDateStatus, getTimelineData, calculateNextCheckDate } from './utils.js';
// import { saveData } from './storage.js'; // Видалено, ui не повинен знати про зберігання
// import { initNotifications } from './notifications.js'; // Видалено, ui не повинен ініціювати сповіщення

// --- DOM елементи ---
const deviceListContainer = document.getElementById('device-list');
const modal = document.getElementById('modal');
const closeModalBtn = modal.querySelector('.close-btn');
const deviceForm = document.getElementById('device-form');
const modalTitle = document.getElementById('modal-title');
const deleteDeviceBtn = document.getElementById('delete-device-btn');
const deviceCountElement = document.getElementById('device-count');
const overdueCountElement = document.getElementById('overdue-count');
const loadingPlaceholder = document.querySelector('.loading-placeholder');

let _onSaveCallback = null; // Зберігаємо колбек збереження
let _onDeleteCallback = null; // Зберігаємо колбек видалення

// --- Публічні функції UI ---

export function updateOverdueStats(devices) {
    if (!devices || !Array.isArray(devices)) {
        console.warn("updateOverdueStats received invalid devices array:", devices);
        overdueCountElement.textContent = '-';
        return;
    }
    const overdueCount = devices.filter(device => {
        const nextCheck = calculateNextCheckDate(device.lastCheckDate, device.mpi);
        const status = getNextCheckDateStatus(nextCheck);
        return status.class === 'date-expired';
    }).length;
    overdueCountElement.textContent = overdueCount;
    // console.log('Overdue stats updated:', overdueCount); // Можна розкоментувати для відладки
}

export function renderDeviceList(devices, currentRMFilter) {
    console.log(`Rendering device list. Total devices: ${devices?.length ?? 0}, RM Filter: ${currentRMFilter}`);
    deviceListContainer.innerHTML = '';
    loadingPlaceholder?.remove();

     if (!devices || !Array.isArray(devices)) {
        console.warn("renderDeviceList received invalid devices array:", devices);
        deviceListContainer.innerHTML = `<p class="error-message">Помилка завантаження списку приладів.</p>`;
        deviceCountElement.textContent = '0';
        return;
    }

    const filteredByRM = currentRMFilter === 'all'
        ? [...devices]
        : devices.filter(device => device.rm === currentRMFilter);

    const count = filteredByRM.length;
    deviceCountElement.textContent = count;
    console.log(`Devices matching filter: ${count}`);

    if (count === 0 && devices.length > 0 && currentRMFilter !== 'all') {
        deviceListContainer.innerHTML = `<p class="no-devices">Немає приладів для РМ "${currentRMFilter}".</p>`;
    } else if (count === 0 && devices.length === 0) {
         deviceListContainer.innerHTML = `<p class="no-devices">Список приладів порожній. Натисніть "Додати", щоб почати.</p>`;
    } else {
        // Сортування: спочатку прострочені, потім попередження, потім решта, по даті
        filteredByRM.sort((a, b) => {
            const statusA = getNextCheckDateStatus(calculateNextCheckDate(a.lastCheckDate, a.mpi));
            const statusB = getNextCheckDateStatus(calculateNextCheckDate(b.lastCheckDate, b.mpi));
            const priority = { 'date-expired': 3, 'date-warning': 2, '': 1 };
            const priorityA = statusA.date ? (priority[statusA.class] ?? 0) : 0;
            const priorityB = statusB.date ? (priority[statusB.class] ?? 0) : 0;

            if (priorityB !== priorityA) return priorityB - priorityA;

            const dateA = statusA.date;
            const dateB = statusB.date;
            if (dateA && dateB) return dateA.getTime() - dateB.getTime();
            else if (dateA) return -1; // A має дату, B ні - A вище
            else if (dateB) return 1;  // B має дату, A ні - B вище
            else return 0; // Обидва не мають дати
        });

        filteredByRM.forEach(device => {
            const card = document.createElement('div');
            card.classList.add('device-card');
            card.dataset.id = device.id;
            if (!device.id) {
                console.error("Device is missing ID during render:", device);
                card.dataset.id = `error_no_id_${Math.random()}`;
            }

            const actualNextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
            const nextCheckStatus = getNextCheckDateStatus(actualNextCheckDate);
            const timeline = getTimelineData(device.lastCheckDate, actualNextCheckDate, device.mpi);

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

            card.addEventListener('click', () => {
                const clickedDeviceId = card.dataset.id;
                // Знаходимо прилад у ПОТОЧНОМУ відфільтрованому списку
                // АБО краще шукати в оригінальному масиві devices, якщо він доступний
                // **Потрібно передати оригінальний масив `devices` в цю функцію або знайти інший спосіб**
                // Поки що шукаємо у filteredByRM, але це не ідеально
                const deviceToEdit = filteredByRM.find(d => d.id === clickedDeviceId);
                if (deviceToEdit) {
                     openModal(deviceToEdit); // Передаємо тільки знайдений прилад
                } else {
                    console.error(`Device with ID ${clickedDeviceId} not found for editing.`);
                    alert("Помилка: не вдалося знайти прилад для редагування.");
                }
            });
            deviceListContainer.appendChild(card);
        });
    }
    console.log("Device list rendering complete.");
}

export function openModal(device = null) {
    deviceForm.reset();
    deviceForm.classList.remove('was-validated');

    if (device) {
        modalTitle.textContent = 'Редагувати Прилад';
        document.getElementById('device-id').value = device.id || '';
        document.getElementById('device-rm').value = device.rm || '';
        document.getElementById('device-name').value = device.name || '';
        document.getElementById('device-type').value = device.type || '';
        document.getElementById('device-serial').value = device.serial || '';
        document.getElementById('device-lastCheckDate').value = device.lastCheckDate || '';
        document.getElementById('device-mpi').value = device.mpi || '';
        document.getElementById('device-location').value = device.location || '';
        document.getElementById('device-povirkyLocation').value = device.povirkyLocation || '';
        document.getElementById('device-notes').value = device.notes || '';
        deleteDeviceBtn.classList.remove('hidden');
        console.log("Opening modal for editing device:", device.id);
    } else {
        modalTitle.textContent = 'Додати Прилад';
        document.getElementById('device-id').value = '';
        deleteDeviceBtn.classList.add('hidden');
        console.log("Opening modal for adding a new device.");
        // Можна встановити РМ за замовчуванням, якщо фільтр активний
        // const currentRMFilter = document.querySelector('#rm-filter .filter-btn.active')?.dataset.rm;
        // if (currentRMFilter && currentRMFilter !== 'all') {
        //     document.getElementById('device-rm').value = currentRMFilter;
        // }
    }
    modal.style.display = 'block';
    setTimeout(() => document.getElementById('device-rm').focus(), 50);
}

export function closeModal() {
    modal.style.display = 'none';
    deviceForm.reset();
    console.log("Modal closed.");
}

// --- Ініціалізація обробників подій --- //

// Ця функція налаштовує обробники, які ВИКЛИКАЮТЬ колбеки з script.js
export function initUIHandlers(onSave, onDelete) {
    console.log("Initializing UI handlers...");
    _onSaveCallback = onSave;     // Зберігаємо колбек збереження
    _onDeleteCallback = onDelete; // Зберігаємо колбек видалення

    // Обробник для закриття модального вікна (без змін)
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

    // Обробник відправки форми
    deviceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log("UI: Form submit intercepted.");

        const id = document.getElementById('device-id').value || null; // null, якщо порожній рядок
        const formData = {
            // Не додаємо ID сюди, він передається окремо
            rm: document.getElementById('device-rm').value.trim(),
            name: document.getElementById('device-name').value.trim(),
            type: document.getElementById('device-type').value.trim(),
            serial: document.getElementById('device-serial').value.trim(),
            lastCheckDate: document.getElementById('device-lastCheckDate').value || null,
            mpi: parseInt(document.getElementById('device-mpi').value) || null,
            location: document.getElementById('device-location').value.trim() || null,
            povirkyLocation: document.getElementById('device-povirkyLocation').value.trim() || null,
            notes: document.getElementById('device-notes').value.trim() || null
        };

         // Перевірка обов'язкових полів ТІЛЬКИ при додаванні нового приладу (isEditing = false -> id = null)
        if (!id && (!formData.rm || !formData.name || !formData.type || !formData.serial)) {
            alert("Будь ласка, заповніть обов'язкові поля: РМ, Найменування, Тип, Заводський номер.");
            console.warn("Required fields missing for new device.");
            return; // Зупиняємо виконання
        }

        // Викликаємо колбек збереження, переданий з script.js
        if (typeof _onSaveCallback === 'function') {
            console.log("UI: Calling onSave callback with:", formData, "ID:", id);
            _onSaveCallback(formData, id); // Передаємо дані та ID
        } else {
            console.error("UI: onSave callback is not defined or not a function!");
        }
    });

    // Обробник кнопки видалення
    deleteDeviceBtn.addEventListener('click', () => {
        const id = document.getElementById('device-id').value;
        const deviceName = document.getElementById('device-name').value || 'цей прилад';
        if (!id) {
            console.warn("UI: Delete button clicked, but no device ID found.");
            return;
        }

        // Запитуємо підтвердження
        if (confirm(`Ви впевнені, що хочете видалити "${deviceName}"?`)) {
             // Викликаємо колбек видалення, переданий з script.js
            if (typeof _onDeleteCallback === 'function') {
                console.log("UI: Calling onDelete callback with ID:", id);
                 _onDeleteCallback(id); // Передаємо тільки ID
            } else {
                console.error("UI: onDelete callback is not defined or not a function!");
            }
        } else {
             console.log("UI: Deletion cancelled by user.");
        }
    });

    console.log("UI handlers initialized.");
}

// --- Видалено внутрішні функції handleFormSubmit і handleDeviceDelete ---
// Їхня логіка тепер розділена між обробниками подій вище і колбеками в script.js
