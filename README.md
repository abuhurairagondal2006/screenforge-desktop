# ScreenForge

**ScreenForge** is a desktop screen recorder and screenshot studio built with React, TypeScript, Vite, and Tauri 2. It brings screen capture, recording controls, screenshots, and a media library together in one desktop application.

## Features

- Screen recording and capture controls
- Audio source selection
- Screenshot capture and screenshot library
- Recordings library with video playback
- Settings and theme support
- Desktop-native integration powered by Tauri
- React-based interface with reusable components and Zustand state stores

> Availability of individual capture features can depend on your operating system and its permissions.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite
- **Desktop runtime:** Tauri 2 and Rust
- **Styling:** Tailwind CSS
- **State management:** Zustand
- **Icons:** Lucide React
- **Testing:** Vitest, Testing Library, and jsdom

## Project structure

```text
.
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # React hooks
│   ├── pages/            # App pages
│   ├── services/         # Frontend services and IPC helpers
│   ├── stores/           # Zustand state stores
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── src-tauri/
│   ├── src/              # Rust desktop application and native modules
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Requirements

Install the following before starting development:

- **Node.js** (LTS recommended) and npm
- **Rust toolchain** (stable) and Cargo
- The platform-specific system dependencies required by [Tauri 2](https://v2.tauri.app/start/prerequisites/)

On Linux, Tauri may require additional system libraries and WebKitGTK development packages. On Windows, install the supported Microsoft C++ build tools and WebView2 prerequisites. On macOS, install Xcode Command Line Tools.

## Getting started

### 1. Get the source

Clone your repository, or extract the project archive:

```bash
git clone <your-repository-url>
cd ScreenForge
```

Replace `<your-repository-url>` with your GitHub repository URL. If you downloaded the ZIP instead, open a terminal in the extracted project directory.

### 2. Install JavaScript dependencies

```bash
npm install
```

### 3. Run the desktop app in development mode

```bash
npm run tauri:dev
```

This starts the Vite development server and launches the Tauri desktop application.

To run only the frontend in a browser for UI development, use:

```bash
npm run dev
```

Some native desktop functionality may not work in a browser-only session.

## Build

### Build the frontend

```bash
npm run build
```

### Build the desktop application

```bash
npm run tauri:build
```

Tauri creates distributable bundles for the current operating system, subject to the platform's build prerequisites. See the Tauri documentation for cross-platform build guidance.

## Tests

Run the test suite once:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Available npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check TypeScript and build the frontend |
| `npm run preview` | Preview the production frontend build |
| `npm run tauri:dev` | Run the desktop app in development mode |
| `npm run tauri:build` | Package the desktop app |
| `npm test` | Run tests once with Vitest |
| `npm run test:watch` | Run Vitest in watch mode |

## Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and run the relevant tests.
4. Commit your changes and push the branch.
5. Open a pull request with a clear description of the change.

For bug reports, include your operating system, steps to reproduce the issue, and any relevant error output. Avoid posting private recordings or other sensitive capture data.

## Security and privacy

Screen recording and screenshot applications can capture sensitive information. Use ScreenForge responsibly, obtain permission before recording other people, and review captured files before sharing them. Do not commit private recordings, screenshots, credentials, or local environment files to the repository.

## License

No license file was included in the supplied project archive. Add a `LICENSE` file before publishing if you want to specify the terms under which others may use, modify, or distribute this project.
