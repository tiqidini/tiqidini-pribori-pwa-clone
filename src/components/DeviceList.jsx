
import React from 'react';
import DeviceCard from './DeviceCard.jsx';

// DeviceList Component
export default function DeviceList({ devices, onEdit, onImageClick, isLoading }) {
    if (isLoading && devices.length === 0) { 
        return <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-6">Завантаження приладів...</div>;
    }
    if (!isLoading && devices.length === 0) { 
         return <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-6">Список приладів порожній або не знайдено за фільтрами.</div>;
    }
    return (
        <>
            <div className="text-sm text-gray-600 text-right mb-2">
                Показано: {devices.length} прилад(ів)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {devices.map(device => (
                    <DeviceCard key={device.id} device={device} onEdit={onEdit} onImageClick={onImageClick} />
                ))}
            </div>
        </>
    );
}
