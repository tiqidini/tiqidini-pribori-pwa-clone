import { formatDate, getNextCheckDateStatus, getTimelineData } from './utils.js';
import { saveData } from './storage.js';

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

// Функция обновления статистики просроченных приборов
export function updateOverdueStats(devices) {
    const overdueCount = devices.filter(device => {
        const status = getNextCheckDateStatus(device.nextCheckDate);
        return status.class === 'date-expired';
    }).length;
    overdueCountElement.textContent = overdueCount;
}

// Функция рендеринга списка приборов
export function renderDeviceList(devices, currentRMFilter) {
    deviceListContainer.innerHTML = '';
    loadingPlaceholder?.remove();

    const filteredByRM = currentRMFilter === 'all'
        ? [...devices]
        : devices.filter(device => device.rm === currentRMFilter);

    const count = filteredByRM.length;
    deviceCountElement.textContent = count;

    if (count === 0) {
        deviceListContainer.innerHTML = `<p class="no-devices">Немає приладів для РМ "${currentRMFilter}".</p>`;
        return;
    }

    filteredByRM.forEach(device => {
        const card = document.createElement('div');
        card.classList.add('device-card');
        card.dataset.id = device.id || `generated_${Math.random()}`;

        const nextCheckStatus = getNextCheckDateStatus(device.nextCheckDate);
        const timeline = getTimelineData(device.lastCheckDate, device.nextCheckDate, device.mpi);

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

        card.addEventListener('click', () => openModal(device, devices));
        deviceListContainer.appendChild(card);
    });
}

// Функция открытия модального окна
export function openModal(device = null, devices) {
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
    } else {
        modalTitle.textContent = 'Додати Прилад';
        document.getElementById('device-id').value = '';
        deleteDeviceBtn.classList.add('hidden');
    }
    modal.style.display = 'block';
    setTimeout(() => document.getElementById('device-rm').focus(), 100);
}

// Функция закрытия модального окна
export function closeModal() {
    modal.style.display = 'none';
    deviceForm.reset();
}

// Функция обработки отправки формы
export function handleFormSubmit(event, devices, currentRMFilter) {
    event.preventDefault();
    const id = document.getElementById('device-id').value;
    const formData = {
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

    if (!formData.rm || !formData.name || !formData.type || !formData.serial) {
        alert("Будь ласка, заповніть обов'язкові поля: РМ, Найменування, Тип, Заводський номер.");
        return;
    }

    if (id) {
        const index = devices.findIndex(d => d.id === id);
        if (index !== -1) {
            devices[index] = { ...formData, id: id };
            console.log("Прилад оновлено:", devices[index]);
        } else {
            alert("Помилка: не вдалося знайти прилад для оновлення.");
            return;
        }
    } else {
        let newId = (formData.serial || 'no_serial') + '_' + Date.now();
        while (devices.some(d => d.id === newId)) {
            newId = (formData.serial || 'no_serial') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
        }
        formData.id = newId;
        devices.push(formData);
        console.log("Новий прилад додано:", formData);
    }

    saveData(devices);
    updateOverdueStats(devices);
    renderDeviceList(devices, currentRMFilter);
    closeModal();
}

// Функция удаления прибора
export function handleDeviceDelete(devices, currentRMFilter) {
    const id = document.getElementById('device-id').value;
    const deviceName = document.getElementById('device-name').value || 'цей прилад';
    if (!id) return;

    if (confirm(`Ви впевнені, що хочете видалити ${deviceName}?`)) {
        const initialLength = devices.length;
        const newDevices = devices.filter(device => device.id !== id);

        if (newDevices.length < initialLength) {
            devices.length = 0;
            devices.push(...newDevices);
            saveData(devices);
            console.log("Прилад видалено з ID:", id);
            updateOverdueStats(devices);
            renderDeviceList(devices, currentRMFilter);
            closeModal();
        } else {
            alert("Помилка: не вдалося знайти прилад для видалення.");
        }
    }
}

// Функция инициализации обработчиков событий UI
export function initUIHandlers(devices, currentRMFilter) {
    // Обработчики модального окна
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') closeModal();
    });

    // Обработчик формы
    deviceForm.addEventListener('submit', (event) => handleFormSubmit(event, devices, currentRMFilter));

    // Обработчик удаления
    deleteDeviceBtn.addEventListener('click', () => handleDeviceDelete(devices, currentRMFilter));
} 