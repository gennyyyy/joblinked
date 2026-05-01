# GEMINI.md - JobLinked Sta. Maria

## Project Overview
**JobLinked Sta. Maria** is a high-end digital employment gateway designed for Santa Maria, Bulacan. It serves as a centralized platform connecting the local workforce with industrial opportunities and government employment programs (TUPAD, SPES, GIP).

### Core Stack
- **Framework:** React 19 (SPA)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4 (using `@tailwindcss/vite` plugin)
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Data:** Local mock data (`src/mockData.js`)

## Architectural Patterns
- **Monolithic Component Structure:** Currently, most page components (Home, Browse, Sectors, Employers, etc.) are defined within `src/App.jsx`.
- **Industrial Design System:** The application uses a custom "industrial" aesthetic defined in `src/index.css`, featuring:
    - **Bento Grid Layouts:** Using the `.bento-card` utility.
    - **Typography:** `.industrial-heading` (heavy, tight tracking) and `.industrial-label` (mono-spaced, uppercase).
    - **Visual Effects:** Glassmorphism (`.glass-nav`), Shimmer effects (`.btn-shimmer`), and animated grid backgrounds.
- **Theme Management:** Dark mode is supported via the `.dark` class and `data-theme="dark"` attribute on the `<html>` element, managed in `src/App.jsx`.

## Building and Running
- **Development Server:** `npm run dev` (Runs on `--host` by default)
- **Production Build:** `npm run build`
- **Linting:** `npm run lint` (using ESLint 9)
- **Preview Build:** `npm run preview`

## Development Conventions
- **Component Style:** Functional components with React Hooks.
- **Styling:** Prefer Tailwind utility classes. For custom "industrial" components, use the established classes in `src/index.css`.
- **State Management:** Local React state (`useState`, `useMemo`) for data filtering and UI toggles.
- **Data Structure:** Job data follows the schema defined in `src/mockData.js` (id, title, company, location, type, category, salary, etc.).

## Key Files
- `src/App.jsx`: Main entry point containing routing and all page components.
- `src/index.css`: Tailwind v4 configuration and global industrial design system styles.
- `src/mockData.js`: Centralized store for job listings, barangays, and categories.
- `vite.config.js`: Configuration for Vite, React, and Tailwind CSS.
