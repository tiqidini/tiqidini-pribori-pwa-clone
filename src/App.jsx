import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initDB, getAllDevicesDB, saveDeviceDB, deleteDeviceDB, clearAllDevicesDB } from './db/database.js';
import { calculateNextCheckDate, getNextCheckDateStatus } from './utils/calculations.js';
import { parseCSV } from './utils/csvParser.js';
import Header from './components/Header.jsx';
import FilterControls from './components/FilterControls.jsx';
import ImageZoomModal from './components/ImageZoomModal.jsx';
import DeviceList from './components/DeviceList.jsx';
import DeviceModal from './components/DeviceModal.jsx';
import NotificationsArea from './components/NotificationsArea.jsx';
import DialogModal from './components/DialogModal.jsx';

// Main App Component
export default function App() {
    const [allDevices, setAllDevices] = useState([]);
    const [currentRMFilter, setCurrentRMFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingDevice, setEditingDevice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [zoomedImageUrl, setZoomedImageUrl] = useState(null);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const fileInputRef = useRef(null);

    const loadDevices = useCallback(async () => {
        setIsLoading(true);
        try {
            await initDB(); 
            let currentDevs = await getAllDevicesDB();
            if (currentDevs.length === 0) {
                console.log("База даних порожня. Спроба імпорту з CSV...");
                try {
                    const response = await fetch('Прилади - Аркуш1.csv');
                    if (!response.ok) throw new Error(`Не вдалося завантажити CSV: ${response.statusText}`);
                    const csvText = await response.text();
                    const parsedDevices = await parseCSV(csvText);
                    if (parsedDevices.length > 0) {
                        const savePromises = parsedDevices.map(devData => {
                            const newId = (devData.serial || 'no_serial_csv') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2,8);
                            const deviceToSave = {
                              ...devData,
                              id: newId,
                              nextCheckDate: calculateNextCheckDate(devData.lastCheckDate, devData.mpi) 
                            };
                            return saveDeviceDB(deviceToSave);
                        });
                        await Promise.all(savePromises);
                        console.log(`${parsedDevices.length} приладів імпортовано та збережено.`);
                        currentDevs = await getAllDevicesDB();
                    } else {
                        console.log("CSV файл порожній або не містить валідних даних.");
                    }
                } catch (csvError) {
                    console.error("Помилка імпорту CSV:", csvError);
                }
            }
            setAllDevices(currentDevs);
        } catch (error) {
            console.error("Failed to load devices:", error);
            setDialog({ isOpen: true, title: 'Помилка', message: 'Не вдалося завантажити прилади. Перевірте консоль розробника для деталей.', type: 'danger', onConfirm: () => setDialog({ isOpen: false }) });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDevices();
    }, [loadDevices]);

    const filteredAndSortedDevices = useMemo(() => {
        let devicesToDisplay = [...allDevices];
        if (currentRMFilter !== 'all') {
            devicesToDisplay = devicesToDisplay.filter(device => device.rm === currentRMFilter);
        }
        if (searchTerm.trim() !== '') {
            const lowerSearchTerm = searchTerm.toLowerCase();
            devicesToDisplay = devicesToDisplay.filter(device => 
                (device.name && device.name.toLowerCase().includes(lowerSearchTerm)) ||
                (device.type && device.type.toLowerCase().includes(lowerSearchTerm)) ||
                (device.serial && device.serial.toLowerCase().includes(lowerSearchTerm))
            );
        }

        // Sorting logic
        return devicesToDisplay.sort((a, b) => {
            switch (sortOrder) {
                case 'name_asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name_desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'date_asc': {
                    const dateA = getNextCheckDateStatus(calculateNextCheckDate(a.lastCheckDate, a.mpi)).date;
                    const dateB = getNextCheckDateStatus(calculateNextCheckDate(b.lastCheckDate, b.mpi)).date;
                    if (dateA && dateB) return dateB.getTime() - dateA.getTime();
                    if (dateA) return -1;
                    if (dateB) return 1;
                    return 0;
                }
                case 'date_desc': {
                    const dateA = getNextCheckDateStatus(calculateNextCheckDate(a.lastCheckDate, a.mpi)).date;
                    const dateB = getNextCheckDateStatus(calculateNextCheckDate(b.lastCheckDate, b.mpi)).date;
                    if (dateA && dateB) return dateA.getTime() - dateB.getTime();
                    if (dateA) return 1;
                    if (dateB) return -1;
                    return 0;
                }
                case 'status':
                default:
                    const statusA = getNextCheckDateStatus(calculateNextCheckDate(a.lastCheckDate, a.mpi));
                    const statusB = getNextCheckDateStatus(calculateNextCheckDate(b.lastCheckDate, b.mpi));
                    if (statusB.sortPriority !== statusA.sortPriority) {
                        return statusB.sortPriority - statusA.sortPriority;
                    }
                    const dateA = statusA.date;
                    const dateB = statusB.date;
                    if (dateA && dateB) return dateA.getTime() - dateB.getTime();
                    if (dateA) return -1;
                    if (dateB) return 1;
                    return 0;
            }
        });
    }, [allDevices, currentRMFilter, searchTerm, sortOrder]);

    const handleRMFILTERChange = (rm) => setCurrentRMFilter(rm);
    const handleSearchChange = (event) => setSearchTerm(event.target.value);
    const handleAddDevice = () => {
        setEditingDevice(null);
        setIsModalOpen(true);
    };
    const handleEditDevice = (device) => {
        setEditingDevice(device);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDevice(null);
    };

    const handleSaveDevice = async (deviceData) => {
        try {
            let deviceToSave;
            if (deviceData.id) {
                deviceToSave = { ...deviceData };
            } else { 
                const newId = (deviceData.serial || 'no_serial_new') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2,8);
                deviceToSave = { ...deviceData, id: newId };
            }
            deviceToSave.nextCheckDate = calculateNextCheckDate(deviceToSave.lastCheckDate, deviceToSave.mpi);
            await saveDeviceDB(deviceToSave);
            await loadDevices(); 
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save device:", error);
            setDialog({ isOpen: true, title: 'Помилка', message: 'Не вдалося зберегти прилад. Перевірте консоль розробника.', type: 'danger', onConfirm: () => setDialog({ isOpen: false }) });
        }
    };

    const confirmDeleteDevice = async (deviceId) => {
        try {
            await deleteDeviceDB(deviceId);
            await loadDevices(); 
            handleCloseModal();
        } catch (error) {
            console.error("Failed to delete device:", error);
            setDialog({ isOpen: true, title: 'Помилка', message: 'Не вдалося видалити прилад. Перевірте консоль розробника.', type: 'danger', onConfirm: () => setDialog({ isOpen: false }) });
        }
    };

    const handleDeleteRequest = (device) => {
        setDialog({
            isOpen: true,
            type: 'danger',
            title: `Видалити прилад?`,
            message: `Ви впевнені, що хочете назавжди видалити "${device.name}" (S/N: ${device.serial})? Цю дію неможливо скасувати.`,
            onConfirm: () => {
                confirmDeleteDevice(device.id);
                setDialog({ isOpen: false });
            },
            onCancel: () => setDialog({ isOpen: false }),
            confirmText: 'Видалити',
            cancelText: 'Відміна',
        });
    };

    const overdueCount = useMemo(() => {
        return allDevices.filter(device => {
            const nextCheck = calculateNextCheckDate(device.lastCheckDate, device.mpi);
            const status = getNextCheckDateStatus(nextCheck);
            return status.isExpired;
        }).length;
    }, [allDevices]);

    useEffect(() => {
        if ('setAppBadge' in navigator) {
            if (overdueCount > 0) {
                navigator.setAppBadge(overdueCount).catch(error => {
                    console.error("Error setting app badge:", error);
                });
            } else {
                navigator.clearAppBadge().catch(error => {
                    console.error("Error clearing app badge:", error);
                });
            }
        }
    }, [overdueCount]);

    const handleImageZoom = (imageUrl) => {
        setZoomedImageUrl(imageUrl);
    };
    const handleCloseImageZoom = () => {
        setZoomedImageUrl(null);
    };

    const handleExportData = async () => {
        try {
            const devicesToExport = await getAllDevicesDB();
            if (devicesToExport.length === 0) {
                setDialog({ isOpen: true, title: 'Експорт', message: 'Немає даних для експорту.', type: 'info', onConfirm: () => setDialog({ isOpen: false }) });
                return;
            }
            const jsonData = JSON.stringify(devicesToExport, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'devices_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setDialog({ isOpen: true, title: 'Експорт', message: 'Дані успішно експортовано у файл devices_data.json!', type: 'success', onConfirm: () => setDialog({ isOpen: false }) });
        } catch (error) {
            console.error("Error exporting data:", error);
            setDialog({ isOpen: true, title: 'Помилка', message: 'Не вдалося експортувати дані.', type: 'danger', onConfirm: () => setDialog({ isOpen: false }) });
        }
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const processFile = () => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importedDevices = JSON.parse(e.target.result);
                    if (!Array.isArray(importedDevices)) {
                        throw new Error("Формат файлу невірний. Очікується масив приладів.");
                    }
                    for(const device of importedDevices){
                        if(typeof device.id === 'undefined' || !device.name || !device.type || !device.serial){
                            throw new Error(`Невірний формат об'єкта приладу в файлі: ${JSON.stringify(device)}`);
                        }
                        device.nextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
                    }
                    await clearAllDevicesDB();
                    for (const device of importedDevices) {
                        await saveDeviceDB(device);
                    }
                    await loadDevices();
                    setDialog({ isOpen: true, title: 'Імпорт завершено', message: `Дані успішно імпортовано. Завантажено ${importedDevices.length} прилад(ів).`, type: 'success', onConfirm: () => setDialog({ isOpen: false }) });
                } catch (error) {
                    console.error("Error importing data:", error);
                    setDialog({ isOpen: true, title: 'Помилка імпорту', message: `Не вдалося імпортувати дані: ${error.message}`, type: 'danger', onConfirm: () => setDialog({ isOpen: false }) });
                } finally {
                     if(fileInputRef.current) fileInputRef.current.value = "";
                }
            };
            reader.readAsText(file);
        };

        setDialog({
            isOpen: true,
            type: 'danger',
            title: 'Замінити всі дані?',
            message: 'УВАГА! Імпорт повністю замінить усі поточні дані в базі. Цю дію неможливо скасувати.',
            onConfirm: () => {
                setDialog({ isOpen: false });
                processFile();
            },
            onCancel: () => {
                if(fileInputRef.current) fileInputRef.current.value = "";
                setDialog({ isOpen: false });
            },
            confirmText: 'Так, замінити',
            cancelText: 'Скасувати',
        });
    };
    
    const triggerImportFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header overdueCount={overdueCount} />
            <main className="container mx-auto p-4 max-w-6xl">
                <FilterControls
                    currentRM={currentRMFilter}
                    onRMChange={handleRMFILTERChange}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onAddDevice={handleAddDevice}
                    onExport={handleExportData}
                    onCsvExport={handleCsvExport}
                    onImportTrigger={triggerImportFileSelect}
                />
                <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef} 
                    onChange={handleImportData} 
                    className="hidden" 
                />
                <NotificationsArea devices={allDevices} />
                <DeviceList
                    devices={filteredAndSortedDevices}
                    onEdit={handleEditDevice}
                    onImageClick={handleImageZoom}
                    isLoading={isLoading} 
                />
            </main>
            {isModalOpen && (
                <DeviceModal
                    device={editingDevice}
                    onClose={handleCloseModal}
                    onSave={handleSaveDevice}
                    onDelete={handleDeleteRequest}
                />
            )}
            {zoomedImageUrl && (
                <ImageZoomModal 
                    imageUrl={zoomedImageUrl} 
                    onClose={handleCloseImageZoom} 
                />
            )}
            <DialogModal 
                isOpen={dialog.isOpen}
                title={dialog.title}
                message={dialog.message}
                onConfirm={dialog.onConfirm}
                onCancel={dialog.onCancel}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
                type={dialog.type}
            />
        </div>
    );
}