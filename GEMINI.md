## Project Overview

This project is a React-based Progressive Web App (PWA) called "Список Приладів" (List of Devices). It's a simple, offline-first application for managing a list of measuring devices, their checks, and calibrations. The application is written in Ukrainian.

**Main Technologies:**

*   **Frontend:** React, Tailwind CSS
*   **Build Tool:** Vite
*   **Database:** IndexedDB for client-side storage
*   **PWA:** Service Worker and a Web App Manifest are used to provide offline capabilities and a native-like app experience.

**Architecture:**

The application follows a modern client-side architecture:

*   `index.html`: The main entry point of the application.
*   `src/index.jsx`: The entry point for the React application, where the `App` component is rendered and the service worker is registered.
*   `src/App.jsx`: The main React component that manages the application's state, including the list of devices, filtering, and all the core logic for adding, editing, deleting, importing, and exporting data.
*   `src/components/`: This directory contains reusable React components that make up the UI, such as `DeviceCard`, `DeviceList`, and `DeviceModal`.
*   `src/db/database.js`: This module encapsulates all interactions with the IndexedDB, providing a simple API for CRUD (Create, Read, Update, Delete) operations on the devices.
*   `src/utils/`: This directory contains utility functions for calculations, CSV parsing, and other helper tasks.
*   `public/`: This directory contains static assets, including the `manifest.json`, `service-worker.js`, images, and a CSV file for initial data import.
*   `vite.config.js`: The configuration file for the Vite build tool.

## Building and Running

This is a Vite-based project. To get it running, you'll need to have Node.js and npm installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start a local development server, and you can view the application in your browser at the address provided (usually `http://localhost:5173`).

3.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the optimized, production-ready files.

4.  **Preview the production build:**
    ```bash
    npm run preview
    ```
    This will serve the `dist` directory, allowing you to test the production build locally.

## Development Conventions

*   The code is written in modern JavaScript (ESM) and JSX.
*   The application uses React with functional components and hooks.
*   State management is handled within the `App.jsx` component.
*   Styling is done using Tailwind CSS.
*   The application is designed to be an offline-first PWA, using a service worker to cache assets and IndexedDB for data persistence.
*   The code is well-structured, with a clear separation of concerns between UI components, database logic, and utility functions.
*   The application can import initial data from a CSV file and import/export data in JSON format.