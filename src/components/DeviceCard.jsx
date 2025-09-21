
import React, { useState, useEffect } from 'react';
import { getNextCheckDateStatus, getTimelineData } from '../utils/calculations.js';

// DeviceCard Component
export default function DeviceCard({ device, onEdit, onImageClick }) {
    const nextCheckStatus = getNextCheckDateStatus(calculateNextCheckDate(device.lastCheckDate, device.mpi));
    const timeline = getTimelineData(device.lastCheckDate, calculateNextCheckDate(device.lastCheckDate, device.mpi), device.mpi);
    // CORRECTED Regex: Only replace specified special characters, keep hyphens.
    const imageFileName = device.type ? `${device.type.replace(/[\/\s\\?%*:|"<>]/g, '_')}.png` : null;
    const imageUrl = imageFileName ? `img/${imageFileName}` : null;
    
    // console.log(`Device Type: ${device.type}, Attempting to load image: ${imageUrl}`); // Keep for debugging if needed

    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [device.type]); // Reset error when device.type changes

    const handleImageClick = (e) => {
        e.stopPropagation();
        if (imageUrl && !imageError) {
            onImageClick(imageUrl);
        }
    };

    return (
        <div
            onClick={() => onEdit(device)}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-4 cursor-pointer border border-gray-200 flex flex-col justify-between"
        >
            <div className="flex-grow">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-md font-semibold text-blue-700 mb-1 truncate" title={device.name}>{device.name || 'Без назви'}</h3>
                        <p className="text-xs text-blue-500 font-medium mb-2 truncate" title={device.type}>{device.type || '-'}</p>
                        <div className="space-y-0.5 text-xs text-gray-600">
                            <p><strong>Зав. №:</strong> {device.serial || '-'}</p>
                            <p><strong>РМ:</strong> {device.rm || '-'}</p>
                            <p><strong>Розташування:</strong> {device.location || '-'}</p>
                            <p><strong>Місце повірки:</strong> {device.povirkyLocation || '-'}</p>
                            <p><strong>Остання повірка:</strong> {formatDate(device.lastCheckDate)}</p>
                            <p><strong>МПІ:</strong> {device.mpi ? `${device.mpi} р.` : '-'}</p>
                            <p className="flex items-center"><strong>Наступна повірка:</strong>
                                <span className={`ml-1 px-1.5 py-0.5 rounded-sm text-xs font-medium ${nextCheckStatus.className}`}>
                                    {nextCheckStatus.text}
                                </span>
                            </p>
                        </div>
                    </div>
                    {imageUrl && (
                        <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 ml-2 cursor-pointer"
                            onClick={handleImageClick}
                        >
                            {!imageError ? (
                                <img 
                                    src={imageUrl} 
                                    alt={`Зображення ${device.type}`}
                                    className="w-full h-full object-contain rounded-md"
                                    onError={(e) => {
                                        // console.error(`Failed to load image for ${device.type}: ${imageUrl}`, e);
                                        setImageError(true);
                                    }} 
                                />
                            ) : (
                                <div className="w-full h-full device-image-fallback">
                                    <i className="fas fa-image"></i>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-3">
                {(timeline.percent > 0 || timeline.timelineClassName === 'timeline-expired') && (
                    <div className="mb-2" title={`Пройшло приблизно ${timeline.percent}% інтервалу повірки`}>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${timeline.timelineClassName} transition-all duration-500 ease-out flex items-center justify-center`}
                                style={{ width: `${timeline.percent}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                {device.notes && <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-1.5"><strong>Примітки:</strong> {device.notes}</p>}
            </div>
        </div>
    );
}
