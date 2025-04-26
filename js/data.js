const devices = [
  {
    "id": "6957",
    "rm": "112",
    "name": "Мілівольтметр",
    "type": "В3-41",
    "serial": "№6957",
    "lastCheckDate": "2023-12-21",
    "mpi": 2,
    "location": "303",
    "calibrationLocation": "ННЦ ІМ", // Нове поле
    "notes": null
  },
  {
    "id": "0763",
    "rm": "111",
    "name": "Мілівольтметр цифровий широкополосний",
    "type": "В3-59",
    "serial": "№0763",
    "lastCheckDate": "2024-02-07",
    "mpi": 2,
    "location": "312",
    "calibrationLocation": "ННЦ ІМ",
    "notes": null
  },
  {
    "id": "005090",
    "rm": "111",
    "name": "Вольтметр універсальний швидкодіючий",
    "type": "В7-43",
    "serial": "№005090",
    "lastCheckDate": "2023-12-22",
    "mpi": 2,
    "location": "312",
    "calibrationLocation": "ННЦ ІМ",
    "notes": null
  },
  {
    "id": "0769",
    "rm": "112",
    "name": "Вимірювач потужності термісторний",
    "type": "М3-22А",
    "serial": "№0769",
    "lastCheckDate": "2024-03-14",
    "mpi": 2,
    "location": "303",
    "calibrationLocation": "Власна лаб.",
    "notes": null
  },
  {
    "id": "9307048",
    "rm": "112",
    "name": "Частотомір електронно-лічильний",
    "type": "Ч3-66",
    "serial": "№9307048",
    "lastCheckDate": "2023-06-10", // Змінив дату для прикладу простроченої
    "mpi": 1, // Змінив МПІ для прикладу
    "location": "303",
    "calibrationLocation": "ННЦ ІМ",
    "notes": "Терміново повірити"
  },
  {
    "id": "0000590",
    "rm": "111",
    "name": "Осцилограф обчислювальний стробоскопічний прецизійний",
    "type": "С9-9",
    "serial": "№0000590",
    "lastCheckDate": "2024-12-19", // Змінив дату для прикладу warning
    "mpi": 1,
    "location": "312",
    "calibrationLocation": "Виробник",
    "notes": "Повірка скоро"
  },
    {
    "id": "104609",
    "rm": "111",
    "name": "Генератор R&S",
    "type": "HMF 2550",
    "serial": "№104609",
    "lastCheckDate": "2023-07-20",
    "mpi": 3,
    "location": "312",
    "calibrationLocation": "ННЦ ІМ",
    "notes": null
  }
  // ... інші прилади з доданим полем calibrationLocation ...
];

// Функція calculateNextCheckDate тепер знаходиться в script.js
// і викликається при завантаженні даних у функції loadData().
// Немає потреби дублювати її тут.

// Переконуємося, що у всіх початкових даних є поле calibrationLocation
devices.forEach(device => {
    if (device.calibrationLocation === undefined) {
        device.calibrationLocation = null; // Або інше значення за замовчуванням
    }
});
