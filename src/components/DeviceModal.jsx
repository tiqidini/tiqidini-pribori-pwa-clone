
import React, { useState, useEffect } from 'react';

// DeviceModal Component
export default function DeviceModal({ device, onClose, onSave, onDelete }) {
    const [formData, setFormData] = useState({
        id: '', rm: '', name: '', type: '', serial: '',
        lastCheckDate: '', mpi: '', location: '', povirkyLocation: '', notes: ''
    });
    useEffect(() => {
        if (device) {
            setFormData({ ...device, mpi: device.mpi || '', lastCheckDate: device.lastCheckDate || '' });
        } else { 
            setFormData({
                id: '', rm: '', name: '', type: '', serial: '',
                lastCheckDate: '', mpi: '', location: '', povirkyLocation: '', notes: ''
            });
        }
    }, [device]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const deviceToSave = {
            ...formData,
            mpi: formData.mpi ? parseInt(formData.mpi) : null,
            lastCheckDate: formData.lastCheckDate || null, 
        };
        if (!deviceToSave.rm || !deviceToSave.name || !deviceToSave.type || !deviceToSave.serial) {
            alert("Будь ласка, заповніть обов'язкові поля: РМ, Найменування, Тип, Заводський номер.");
            return;
        }
        onSave(deviceToSave);
    };
    const handleDelete = () => {
        if (device) {
            onDelete(device); // Pass the whole device object to the parent
        }
    };
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[1000] modal-animation" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content-scrollable" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">{device ? 'Редагувати Прилад' : 'Додати Прилад'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="device-rm" className={labelClass}>РМ: <span className="text-red-500">*</span></label>
                        <input type="text" name="rm" id="device-rm" value={formData.rm} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="device-name" className={labelClass}>Найменування: <span className="text-red-500">*</span></label>
                        <input type="text" name="name" id="device-name" value={formData.name} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="device-type" className={labelClass}>Тип: <span className="text-red-500">*</span></label>
                        <input type="text" name="type" id="device-type" value={formData.type} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="device-serial" className={labelClass}>Заводський номер: <span className="text-red-500">*</span></label>
                        <input type="text" name="serial" id="device-serial" value={formData.serial} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="device-lastCheckDate" className={labelClass}>Дата останньої повірки:</label>
                        <input type="date" name="lastCheckDate" id="device-lastCheckDate" value={formData.lastCheckDate} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="device-mpi" className={labelClass}>МПІ (роки):</label>
                        <input type="number" name="mpi" id="device-mpi" value={formData.mpi} onChange={handleChange} className={inputClass} min="1" />
                    </div>
                    <div>
                        <label htmlFor="device-location" className={labelClass}>Де прилад:</label>
                        <input type="text" name="location" id="device-location" value={formData.location} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="device-povirkyLocation" className={labelClass}>Місце повірки:</label>
                        <input type="text" name="povirkyLocation" id="device-povirkyLocation" value={formData.povirkyLocation} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="device-notes" className={labelClass}>Примітки:</label>
                        <textarea name="notes" id="device-notes" value={formData.notes} onChange={handleChange} rows="3" className={inputClass}></textarea>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition flex items-center gap-2">
                            <i className="fas fa-save"></i> Зберегти
                        </button>
                        {device && (
                            <button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition flex items-center gap-2">
                                <i className="fas fa-trash"></i> Видалити
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
