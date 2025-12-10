# Electricity Meter PWA

An offline-first Progressive Web Application (PWA) designed for electricity meter reading and bill collection. This application allows field agents to manage readings and collections efficiently without needing a constant internet connection.

## Features

-   **Offline Capable**: Built with IndexedDB to store data locally on the device.
-   **Excel Integration**: Seamlessly import and export data using Excel files (`.xlsx`).
    -   **Meter Reading Mode**: Import customer lists, record readings, and export results.
    -   **Bill Collection Mode**: Import bill lists, track payments, and export collection reports.
-   **Mobile First**: Responsive design optimized for mobile devices using Tailwind CSS.
-   **PWA Support**: Installable on devices for a native app-like experience.

## Tech Stack

-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Storage**: idb (IndexedDB wrapper)
-   **File Handling**: SheetJS (xlsx)
-   **Icons**: Lucide React

## Getting Started

### Prerequisites

-   Node.js (v20 or higher recommended)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Start the development server:

```bash
npm run dev
```

### Building for Production

Build the application for deployment:

```bash
npm run build
```

The output will be in the `dist` folder.

## Deployment

This repository is configured with **GitHub Actions** to automatically deploy to **GitHub Pages**.

1.  Push changes to the `main` branch.
2.  The workflow `.github/workflows/deploy.yml` will trigger.
3.  Once complete, your app will be live at `https://<username>.github.io/<repo-name>/`.

## Usage Guide

1.  **Meter Reading**:
    -   Upload the "Readings" Excel file.
    -   Select a customer and enter the current reading.
    -   The app calculates consumption automatically.
    -   Export the updated data when finished.

2.  **Bill Collection**:
    -   Upload the "Collections" Excel file.
    -   Search for customers by ID or Name.
    -   Mark bills as paid.
    -   Export the collection report.

## License

[MIT](LICENSE)
