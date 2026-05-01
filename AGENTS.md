# Agent Guidelines for JobLinked

This file provides instructions for AI agents working on the JobLinked project.

## Project Overview

JobLinked is a React 19 + Vite application for a digital employment gateway in Santa Maria, Bulacan. It uses Tailwind CSS v4 for styling, React Router v7 for routing, and ESLint for code quality.

## Commands

### Development
```bash
npm run dev          # Start dev server (runs on localhost with --host flag)
```

### Building
```bash
npm run build       # Production build to dist/
npm run preview     # Preview production build
```

### Linting
```bash
npm run lint        # Run ESLint on entire project
```

### Testing
**Note:** No test framework is currently configured. If you add tests, use:
```bash
npm test            # Run all tests
npm test -- --run   # Run single test file (Vitest)
npm test -- filename.test.jsx  # Run specific test
```

## Code Style Guidelines

### File Structure
- Use `.jsx` extension for React components, `.js` for utilities
- Components go in `src/` directory
- Keep components small and focused (single responsibility)
- Co-locate related files when possible

### Imports
- Group imports in this order: external libraries, React/framework, internal components/utilities
- Use absolute imports where configured (alias `@/` to `src/`)
- Avoid default exports for components (use named exports)
- Example:
  ```jsx
  import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { Button, Card } from '@/components/ui';
  import { formatDate } from '@/utils/helpers';
  ```

### Formatting
- Use 2 spaces for indentation
- No semicolons at end of statements
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Maximum line length: 100 characters

### React Patterns
- Use functional components with arrow functions or `function` keyword consistently
- Use hooks for state and side effects (`useState`, `useEffect`, `useContext`, etc.)
- Destructure props for clarity
- Memoize expensive calculations with `useMemo` and callbacks with `useCallback`
- Always use React.Fragment (`<>`) instead of `<div>` wrappers when possible

### Naming Conventions
- **Components**: PascalCase (e.g., `JobCard`, `Header`)
- **Hooks**: camelCase starting with `use` (e.g., `useJobs`, `useAuth`)
- **Utilities**: camelCase (e.g., `formatDate`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`)
- **CSS Classes**: kebab-case for utility classes, BEM-like for custom classes
- **Files**: kebab-case for components (e.g., `job-card.jsx`), camelCase for utilities

### Types
- Use PropTypes or TypeScript (project uses JS with ESLint)
- Document complex objects with comments
- Use meaningful type names

### Error Handling
- Use try-catch for async operations
- Provide user-friendly error messages
- Log errors appropriately (console.error for dev, error tracking service for prod)
- Handle loading and empty states in components

### CSS / Tailwind
- Use Tailwind utility classes as primary styling method
- Use arbitrary values sparingly (`bg-[#hex]`)
- Keep custom CSS in `index.css` or component-scoped styles
- Use CSS variables for theme colors when needed

### State Management
- Use React Context for global state (auth, theme)
- Use local state with `useState` for component-specific state
- Keep state as close to where it's used as possible

### Performance
- Lazy load routes with `React.lazy()` and `<Suspense>`
- Optimize images (use WebP, appropriate sizing)
- Avoid unnecessary re-renders (use `React.memo`, `useMemo`)
- Code split by route

### Accessibility
- Use semantic HTML elements
- Include alt text for images
- Ensure keyboard navigation works
- Use proper ARIA labels where needed

### Best Practices
- Avoid `any` type in TypeScript if used
- No console.log in production code
- Remove unused imports and variables
- Use `const` over `let`, avoid `var`
- Prefer composition over inheritance
- Write self-documenting code with clear variable/function names

### Working with Existing Code
- When modifying existing components, maintain consistent style with surrounding code
- Before making changes, review the component's current patterns and conventions
- Add meaningful comments when business logic is complex
- Use descriptive variable names that explain intent (e.g., `isLoading` instead of `flag`)

### Git Workflow
- Create feature branches for new functionality
- Write clear commit messages that explain the "why" not just the "what"
- Run `npm run lint` before committing to catch code quality issues
- Test changes locally before pushing to remote

### Common Patterns

#### Handling Async Data
```jsx
const [data, setData] = useState(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

#### Conditional Rendering
```jsx
if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
if (!data) return <EmptyState />;
return <DataDisplay data={data} />;
```

### Project-Specific Notes
- The app uses mock data stored in `src/mockData.js` for development
- Currently no backend API - all data is client-side
- Lucide React is used for icon library
- Dark mode support is implemented via Tailwind CSS