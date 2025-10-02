# Gemini Code Assistant Context

## Project Overview

This project, named **CognitoOcean**, is a modern desktop application built with Electron, Vue 3, and TypeScript. It serves as a powerful toolset for developers and analysts, offering features like:

- **Git Repository Analysis:** Visualizing commit history, contributor statistics, and file change frequency.
- **AI-Powered Insights:** Integrating with Google Gemini and OpenAI for code analysis, commit message generation, and technical Q&A.
- **Stock Market Tracking:** Fetching and displaying real-time and historical stock data with technical indicators.
- **Data Visualization:** Using Chart.js to create interactive charts for various data points.
- **Web Scraping:** Leveraging Puppeteer to extract data from websites.
- **Local Data Storage:** Utilizing SQLite and `electron-store` for secure local data persistence.

The application features a modern UI built with Ant Design Vue and ensures it stays up-to-date with `electron-updater`.

### Core Architecture

The project follows the standard Electron-Vite structure, with a clear separation between the `main` process, `preload` script, and `renderer` process. A key architectural highlight is the unified IPC (Inter-Process Communication) entry point (`src/main/features/handlers/ipcHandlers.ts`), which centralizes and simplifies all frontend-to-backend communication. The routing and menu system is dynamically managed by the backend, allowing for flexible updates without frontend code changes.

### Technology Stack

- **Frameworks:** Electron, Vue 3
- **Language:** TypeScript
- **Build Tool:** Vite (via `electron-vite`)
- **UI:** Ant Design Vue
- **State Management:** Pinia
- **Database:** better-sqlite3
- **Core Libraries:** `simple-git`, `puppeteer-core`, `yahoo-finance2`, `chart.js`, `axios`, `@google/genai`, `openai`

## Building and Running

The project uses `pnpm` as its package manager.

- **Install Dependencies:**

  ```bash
  pnpm install
  ```

- **Run in Development Mode:**
  This command starts the application with hot-reloading enabled.

  ```bash
  pnpm dev
  ```

- **Build for Production:**
  The following commands build and package the application for different operating systems. The output is placed in the `release/` directory.
  - **Windows:**
    ```bash
    pnpm build:win
    ```
  - **macOS:**
    ```bash
    pnpm build:mac
    ```
  - **Linux:**
    ```bash
    pnpm build:linux
    ```

## Development Conventions

The `README.md` outlines a detailed, 12-step workflow for developing new features, which should be followed closely. It covers everything from UI design and database schema changes to implementing the service and handler layers on the backend and connecting them to the frontend.

### Path Aliases

The project is heavily configured with path aliases to simplify imports. These are defined in `electron.vite.config.ts`, `tsconfig.node.json`, and `tsconfig.web.json`. Always use these aliases for cleaner and more maintainable code.

**Main Process Aliases:**

- `@main`: `src/main`
- `@features`: `src/main/features`
- `@handlers`: `src/main/features/handlers`
- `@services`: `src/main/features/services`
- `@nodeUtils`: `src/main/utils`
- `@shared`: `src/shared`

**Renderer Process Aliases:**

- `@` or `@renderer`: `src/renderer/src`
- `@components`: `src/renderer/src/components`
- `@views`: `src/renderer/src/views`
- `@api`: `src/renderer/src/api`
- `@assets`: `src/renderer/src/assets`
- `@composables`: `src/renderer/src/composables`
- `@router`: `src/renderer/src/router`
- `@shared`: `src/shared`
