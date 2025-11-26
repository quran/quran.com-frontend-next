# Agent Guidelines for quran.com-frontend-next

## Build/Lint/Test Commands

- **Build**: `yarn build` (production) or `yarn dev` (development)
- **Lint**: `yarn lint` (check) or `yarn lint:fix` (auto-fix)
- **Test**: `yarn test` (all), `yarn test:watch` (watch mode), `yarn test:coverage` (with coverage)
- **UI Tests**: `yarn playwright test` (run all Playwright tests with default config)
- **Single test**: `yarn test <filename>` or `vitest run <filename>`
- **Integration tests**: `yarn test:integration` (run Playwright tests via npm script)
- **SCSS lint**: `yarn lint:scss`

## Code Style Guidelines

- **Imports**: Alphabetized with newlines between groups; React first, then external, then internal
- **Formatting**: Prettier with single quotes, 2-space tabs, 100-char width, trailing commas
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces/components,
  UPPER_CASE for constants
- **Types**: Prefer interfaces over types; explicit return types for public functions; avoid `any`
- **React**: Functional components only; custom hooks for reusable logic; proper memoization
- **Error Handling**: Custom error types; proper async/await; user-friendly error messages
- **Functions**: Max 30 lines; early returns; single responsibility; descriptive names
- **Files**: kebab-case, camelCase, or PascalCase allowed; co-locate with related files

## Cursor Rules

Follow all Cursor rules in `.cursor/rules/` including:

- TypeScript best practices (interfaces over types, strict mode, proper generics)
- React patterns (functional components, custom hooks, proper state management)
- General principles (simplicity, readability, minimal code changes)
- Naming conventions (descriptive, intent-revealing names)
- Performance optimization (proper memoization, lazy loading)
- Clean code (early returns, proper conditionals, function ordering)

## Important Notes

- Use Redux Toolkit for state management, XState for complex state machines
- Follow Next.js Pages Router patterns (not App Router)
- Implement proper i18n with next-translate
- Use SCSS modules for component styling
- Run lint and typecheck after changes: `yarn lint && yarn build`
