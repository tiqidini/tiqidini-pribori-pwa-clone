// Начальные данные
export const devices = [
  { id: "6957", rm: "112", name: "Мілівольтметр", type: "В3-41", serial: "№6957", lastCheckDate: "2023-12-21", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "0763", rm: "111", name: "Мілівольтметр цифровий широкополосний", type: "В3-59", serial: "№0763", lastCheckDate: "2024-02-07", mpi: 2, location: "312", povirkyLocation: null, notes: null },
  { id: "005090", rm: "111", name: "Вольтметр універсальний швидкодіючий", type: "В7-43", serial: "№005090", lastCheckDate: "2023-12-22", mpi: 2, location: "312", povirkyLocation: null, notes: null },
  { id: "0769", rm: "112", name: "Вимірювач потужності термісторний", type: "М3-22А", serial: "№0769", lastCheckDate: "2024-03-14", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "0326", rm: "111", name: "Вимірювач потужності термісторний", type: "М3-22А", serial: "№0326", lastCheckDate: "2024-03-14", mpi: 2, location: "312", povirkyLocation: null, notes: null },
  { id: "5011195", rm: "111", name: "Частотомір електронно-лічильний", type: "Ч3-54", serial: "№5011195", lastCheckDate: "2023-12-08", mpi: 2, location: "312", povirkyLocation: null, notes: null },
  { id: "9307048", rm: "112", name: "Частотомір електронно-лічильний", type: "Ч3-66", serial: "№9307048", lastCheckDate: "2015-06-10", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "9307038", rm: "111", name: "Частотомір електронно-лічильний", type: "Ч3-66", serial: "№9307038", lastCheckDate: null, mpi: 2, location: "312", povirkyLocation: null, notes: null },
  { id: "0100/0117", rm: "112", name: "Вимірювач різниці фаз та відношення рівнів", type: "ФК2-33", serial: "№0100/0117", lastCheckDate: "2021-07-08", mpi: 3, location: "303", povirkyLocation: null, notes: null },
  { id: "0095/0080", rm: "112", name: "Вимірювач різниці фаз та відношення рівнів", type: "ФК2-33", serial: "№0095/0080", lastCheckDate: "2021-07-08", mpi: 3, location: "303", povirkyLocation: null, notes: null },
  { id: "К01248", rm: "112", name: "Осцилограф універсальний", type: "С1-99", serial: "№К01248", lastCheckDate: "2001-12-05", mpi: 3, location: "303", povirkyLocation: null, notes: null },
  { id: "9803004/9602044/9602013", rm: "111", name: "Аналiзатор спектра", type: "С4-60", serial: "№9803004/9602044/9602013", lastCheckDate: "2017-03-17", mpi: 3, location: "312", povirkyLocation: null, notes: null },
  { id: "0000590", rm: "111", name: "Осцилограф обчислювальний стробоскопічний прецизійний", type: "С9-9", serial: "№0000590", lastCheckDate: "2023-12-19", mpi: 1, location: "312", povirkyLocation: null, notes: null },
  { id: "0002989", rm: "111", name: "Осцилограф обчислювальний стробоскопічний прецизійний", type: "С9-9", serial: "№0002989", lastCheckDate: "2023-12-21", mpi: 1, location: "312", povirkyLocation: null, notes: null },
  { id: "030", rm: "111", name: "Генератор перепаду напруги", type: "И1-12", serial: "№030", lastCheckDate: "2023-12-22", mpi: 1, location: "312", povirkyLocation: null, notes: null },
  { id: "11014", rm: "111", name: "Генератор випробувальних імпульсів", type: "И1-15", serial: "№11014", lastCheckDate: "2022-01-28", mpi: 1, location: "312", povirkyLocation: null, notes: null },
  { id: "09013", rm: "112", name: "Прилад для повірки вимірювачів напруженості електромагнітного поля", type: "П1-8", serial: "№09013", lastCheckDate: "2003-04-09", mpi: 1, location: "303", povirkyLocation: null, notes: null },
  { id: "7526", rm: "112", name: "Генератор сигналів високочастотний", type: "Г4-102А", serial: "№7526", lastCheckDate: "2024-03-04", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "250116", rm: "112", name: "Генератор сигналів високочастотний", type: "Г4-111", serial: "№250116", lastCheckDate: "2024-07-02", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "3780", rm: "112", name: "Генератор сигналів високочастотний", type: "Г4-116", serial: "№3780", lastCheckDate: "2024-07-19", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "16937", rm: "111", name: "Генератор імпульсів точної амплітуди", type: "Г5-75", serial: "№16937", lastCheckDate: "2024-02-12", mpi: 3, location: "312", povirkyLocation: null, notes: null },
  { id: "03380", rm: "111", name: "Генератор сигналів спеціальної форми", type: "Г6-17", serial: "№03380", lastCheckDate: "2020-01-10", mpi: 3, location: "312", povirkyLocation: null, notes: null },
  { id: "3626", rm: "111", name: "Генератор сигналів спеціальної форми", type: "Г6-37", serial: "№3626", lastCheckDate: "2020-01-08", mpi: 3, location: "312", povirkyLocation: null, notes: null },
  { id: "9201010", rm: "112", name: "Генератор сигналів високочастотний", type: "РГ4-03", serial: "№9201010", lastCheckDate: "2020-07-24", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "9010033", rm: "112", name: "Генератор сигналів високочастотний", type: "РГ4-04", serial: "№9010033", lastCheckDate: "2023-07-06", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "9010028", rm: "112", name: "Генератор сигналів високочастотний", type: "РГ4-05", serial: "№9010028", lastCheckDate: "2023-07-06", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "507504", rm: "112", name: "Генератор сигналів високочастотний", type: "РГ4-06", serial: "№507504", lastCheckDate: "2024-01-08", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "507204", rm: "112", name: "Генератор сигналів високочастотний", type: "РГ4-07", serial: "№507204", lastCheckDate: "2024-01-09", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "402114", rm: "112", name: "Генератор сигналів високочастотний", type: "РГ4-08", serial: "№402114", lastCheckDate: "2023-07-06", mpi: 2, location: "303", povirkyLocation: null, notes: null },
  { id: "12167", rm: "111", name: "Стабілізатор напруги мережі", type: "Б2-3", serial: "№12167", lastCheckDate: null, mpi: null, location: "312", povirkyLocation: null, notes: null },
  { id: "11", rm: "112", name: "Комплект нестандартного обладнання для повірки вимірювачів щільності потоку НВЧ потужності типу ПО-1", type: "ПО-1", serial: "№11", lastCheckDate: "2012-04-05", mpi: 1, location: "303", povirkyLocation: null, notes: null },
  { id: "45007784/410", rm: "111", name: "Термогігрометр", type: "Testo 608-Н1", serial: "№45007784/410", lastCheckDate: null, mpi: null, location: "312", povirkyLocation: null, notes: null },
  { id: "45025518/503", rm: "112", name: "Термогігрометр", type: "Testo 608-Н1", serial: "№45025518/503", lastCheckDate: null, mpi: null, location: "303", povirkyLocation: null, notes: null },
  { id: "В020713", rm: "111", name: "Осцилограф Tektronix", type: "TDS 3054C", serial: "№В020713", lastCheckDate: "2022-02-10", mpi: 3, location: "312", povirkyLocation: null, notes: null },
  { id: "104609", rm: "111", name: "Генератор R&S", type: "HMF 2550", serial: "№104609", lastCheckDate: "2023-07-20", mpi: 3, location: "312", povirkyLocation: null, notes: null }
];

// Функция для сохранения данных в localStorage
function saveDevices() {
    localStorage.setItem('devices', JSON.stringify(devices));
}

// Функция для обновления данных прибора
function updateDevice(deviceId, updatedData) {
    const index = devices.findIndex(d => d.id === deviceId);
    if (index !== -1) {
        devices[index] = { ...devices[index], ...updatedData };
        saveDevices();
    }
}

// Переконуємося, що у всіх початкових даних є поле calibrationLocation
devices.forEach(device => {
    if (device.calibrationLocation === undefined) {
        device.calibrationLocation = null;
    }
});

// Сохраняем начальные данные в localStorage, если их там еще нет
if (!localStorage.getItem('devices')) {
    saveDevices();
}
