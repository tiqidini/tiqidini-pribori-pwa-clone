
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

if ('serviceWorker' in navigator) {
    const swPath = 'service-worker.js'; 
    const swScope = './'; 
    navigator.serviceWorker.register(swPath, { scope: swScope })
    .then(registration => {
        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('Новий Service Worker встановлено. Оновіть сторінку для застосування.');
                        } else {
                            console.log('Контент кешовано для офлайн використання.');
                        }
                    }
                };
            }
        };
    })
    .catch(error => {
        console.error('Помилка реєстрації Service Worker:', error);
    });
} else {
     console.log('Service Worker не підтримується цим браузером.');
}
