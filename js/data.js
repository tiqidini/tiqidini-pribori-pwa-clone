const devices = [
  {
    "id": "6957",
    "rm": "112",
    "name": "Мілівольтметр",
    "type": "В3-41",
    "serial": "№6957",
    "lastCheckDate": "2023-12-21",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "0763",
    "rm": "111",
    "name": "Мілівольтметр цифровий широкополосний",
    "type": "В3-59",
    "serial": "№0763",
    "lastCheckDate": "2024-02-07",
    "mpi": 2,
    "location": "312"
  },
  {
    "id": "005090",
    "rm": "111",
    "name": "Вольтметр універсальний швидкодіючий",
    "type": "В7-43",
    "serial": "№005090",
    "lastCheckDate": "2023-12-22",
    "mpi": 2,
    "location": "312"
  },
  {
    "id": "0769",
    "rm": "112",
    "name": "Вимірювач потужності термісторний",
    "type": "М3-22А",
    "serial": "№0769",
    "lastCheckDate": "2024-03-14",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "0326",
    "rm": "111",
    "name": "Вимірювач потужності термісторний",
    "type": "М3-22А",
    "serial": "№0326",
    "lastCheckDate": "2024-03-14",
    "mpi": 2,
    "location": "312"
  },
  {
    "id": "5011195",
    "rm": "111",
    "name": "Частотомір електронно-лічильний",
    "type": "Ч3-54",
    "serial": "№5011195",
    "lastCheckDate": "2023-12-08",
    "mpi": 2,
    "location": "312"
  },
  {
    "id": "9307048",
    "rm": "112",
    "name": "Частотомір електронно-лічильний",
    "type": "Ч3-66",
    "serial": "№9307048",
    "lastCheckDate": "2015-06-10",
    "mpi": 2,
    "location": "303",
    "notes": "повірка"
  },
  {
    "id": "9307038",
    "rm": "111",
    "name": "Частотомір електронно-лічильний",
    "type": "Ч3-66",
    "serial": "№9307038",
    "lastCheckDate": null,
    "mpi": 2,
    "location": "312",
    "notes": "----"
  },
  {
    "id": "0100/0117",
    "rm": "112",
    "name": "Вимірювач різниці фаз та відношення рівнів",
    "type": "ФК2-33",
    "serial": "№0100/0117",
    "lastCheckDate": "2021-07-08",
    "mpi": 3,
    "location": "303",
    "notes": "повірка"
  },
  {
    "id": "0095/0080",
    "rm": "112",
    "name": "Вимірювач різниці фаз та відношення рівнів",
    "type": "ФК2-33",
    "serial": "№0095/0080",
    "lastCheckDate": "2021-07-08",
    "mpi": 3,
    "location": "303",
    "notes": "повірка"
  },
  {
    "id": "К01248",
    "rm": "112",
    "name": "Осцилограф універсальний",
    "type": "С1-99",
    "serial": "№К01248",
    "lastCheckDate": "2001-12-05",
    "mpi": 3,
    "location": "303",
    "notes": "ремонт"
  },
  {
    "id": "9803004/9602044/9602013",
    "rm": "111",
    "name": "Аналiзатор спектра",
    "type": "С4-60",
    "serial": "№9803004/9602044/9602013",
    "lastCheckDate": "2017-03-17",
    "mpi": 3,
    "location": "312",
    "notes": "повірка"
  },
  {
    "id": "0000590",
    "rm": "111",
    "name": "Осцилограф обчислювальний стробоскопічний прецизійний",
    "type": "С9-9",
    "serial": "№0000590",
    "lastCheckDate": "2023-12-19",
    "mpi": 1,
    "location": "312",
    "notes": "повірка"
  },
  {
    "id": "0002989",
    "rm": "111",
    "name": "Осцилограф обчислювальний стробоскопічний прецизійний",
    "type": "С9-9",
    "serial": "№0002989",
    "lastCheckDate": "2023-12-21",
    "mpi": 1,
    "location": "312",
    "notes": "повірка"
  },
  {
    "id": "030",
    "rm": "111",
    "name": "Генератор перепаду напруги",
    "type": "И1-12",
    "serial": "№030",
    "lastCheckDate": "2023-12-22",
    "mpi": 1,
    "location": "312",
    "notes": "повірка"
  },
  {
    "id": "11014",
    "rm": "111",
    "name": "Генератор випробувальних імпульсів",
    "type": "И1-15",
    "serial": "№11014",
    "lastCheckDate": "2022-01-28",
    "mpi": 1,
    "location": "312",
    "notes": "повірка"
  },
  {
    "id": "09013",
    "rm": "112",
    "name": "Прилад для повірки вимірювачів напруженості електромагнітного поля",
    "type": "П1-8",
    "serial": "№09013",
    "lastCheckDate": "2003-04-09",
    "mpi": 1,
    "location": "303",
    "notes": "повірка"
  },
  {
    "id": "7526",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "Г4-102А",
    "serial": "№7526",
    "lastCheckDate": "2024-03-04",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "250116",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "Г4-111",
    "serial": "№250116",
    "lastCheckDate": "2024-07-02",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "3780",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "Г4-116",
    "serial": "№3780",
    "lastCheckDate": "2024-07-19",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "16937",
    "rm": "111",
    "name": "Генератор імпульсів точної амплітуди",
    "type": "Г5-75",
    "serial": "№16937",
    "lastCheckDate": "2024-02-12",
    "mpi": 3,
    "location": "312",
    "notes": "ремонт"
  },
  {
    "id": "03380",
    "rm": "111",
    "name": "Генератор сигналів спеціальної форми",
    "type": "Г6-17",
    "serial": "№03380",
    "lastCheckDate": "2020-01-10",
    "mpi": 3,
    "location": "312",
    "notes": "повірка"
  },
  {
    "id": "3626",
    "rm": "111",
    "name": "Генератор сигналів спеціальної форми",
    "type": "Г6-37",
    "serial": "№3626",
    "lastCheckDate": "2020-01-08",
    "mpi": 3,
    "location": "312",
    "notes": "повірка"
  },
  {
    "id": "9201010",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "РГ4-03",
    "serial": "№9201010",
    "lastCheckDate": "2020-07-24",
    "mpi": 2,
    "location": "303",
    "notes": "-"
  },
  {
    "id": "9010033",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "РГ4-04",
    "serial": "№9010033",
    "lastCheckDate": "2023-07-06",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "9010028",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "РГ4-05",
    "serial": "№9010028",
    "lastCheckDate": "2023-07-06",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "507504",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "РГ4-06",
    "serial": "№507504",
    "lastCheckDate": "2024-01-08",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "507204",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "РГ4-07",
    "serial": "№507204",
    "lastCheckDate": "2024-01-09",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "402114",
    "rm": "112",
    "name": "Генератор сигналів високочастотний",
    "type": "РГ4-08",
    "serial": "№402114",
    "lastCheckDate": "2023-07-06",
    "mpi": 2,
    "location": "303"
  },
  {
    "id": "12167",
    "rm": "111",
    "name": "Стабілізатор напруги мережі",
    "type": "Б2-3",
    "serial": "№12167",
    "lastCheckDate": null,
    "mpi": null,
    "location": "312",
    "notes": "----"
  },
  {
    "id": "11",
    "rm": "112",
    "name": "Комплект нестандартного обладнання для повірки вимірювачів щільності потоку НВЧ потужності типу ПО-1",
    "type": "ПО-1",
    "serial": "№11",
    "lastCheckDate": "2012-04-05",
    "mpi": 1,
    "location": "303",
    "notes": "повірка"
  },
  {
    "id": "45007784/410",
    "rm": "111",
    "name": "Термогігрометр",
    "type": "Testo 608-Н1",
    "serial": "№45007784/410",
    "lastCheckDate": null,
    "mpi": null,
    "location": "312",
    "notes": "----"
  },
  {
    "id": "45025518/503",
    "rm": "112",
    "name": "Термогігрометр",
    "type": "Testo 608-Н1",
    "serial": "№45025518/503",
    "lastCheckDate": null,
    "mpi": null,
    "location": "303",
    "notes": "----"
  },
  {
    "id": "В020713",
    "rm": "111",
    "name": "Осцилограф Tektronix",
    "type": "TDS 3054C",
    "serial": "№В020713",
    "lastCheckDate": "2022-02-10",
    "mpi": 3,
    "location": "312",
    "notes": "повірка"
  },
  {
    "id": "104609",
    "rm": "111",
    "name": "Генератор R&S",
    "type": "HMF 2550",
    "serial": "№104609",
    "lastCheckDate": "2023-07-20",
    "mpi": 3,
    "location": "312"
  }
];

// Функция для вычисления даты следующей поверки
function calculateNextCheckDate(lastCheckDateStr, mpiYears) {
  if (!lastCheckDateStr || !mpiYears || isNaN(parseInt(mpiYears))) {
    return null; // Возвращаем null, если дата последней поверки или МПИ невалидны
  }
  try {
    const lastCheckDate = new Date(lastCheckDateStr);
    // Проверяем, является ли дата валидной
    if (isNaN(lastCheckDate.getTime())) {
        return null;
    }
    lastCheckDate.setFullYear(lastCheckDate.getFullYear() + parseInt(mpiYears));
    // Отнимаем один день, так как поверка действительна до дня перед датой следующей поверки
    lastCheckDate.setDate(lastCheckDate.getDate() - 1); 
    return lastCheckDate.toISOString().split('T')[0]; // Возвращаем в формате YYYY-MM-DD
  } catch (e) {
    console.error("Error calculating next check date for", lastCheckDateStr, mpiYears, e);
    return null;
  }
}

// Добавляем вычисленное поле nextCheckDate к каждому прибору
devices.forEach(device => {
  device.nextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
});

// Экспортируем (если будем использовать модули в будущем)
// export { devices }; 