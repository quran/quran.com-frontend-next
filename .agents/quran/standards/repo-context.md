# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Common Development Commands

### Development & Build

- `yarn dev` - Start development server (default port 3000)
- `yarn dev:https` - Start HTTPS development server
- `yarn build` - Build production bundle
- `yarn start` - Start production server
- `yarn analyze` - Analyze bundle size

### Testing

- `yarn test` - Run unit tests with Vitest
- `yarn test:watch` - Run tests in watch mode
- `yarn test:integration` - Run Playwright integration tests
- `yarn test:coverage` - Run tests with coverage report

### Code Quality

- `yarn lint` - ESLint check
- `yarn lint:fix` - Fix ESLint issues
- `yarn lint:scss` - Lint SCSS files

### Storybook

- `yarn storybook` - Start Storybook dev server on port 6006
- `yarn build-storybook` - Build Storybook

## Architecture Overview

### Framework & Stack

- **Next.js 14** with Pages Router (not App Router)
- **TypeScript** with strict configuration
- **React 18** with functional components
- **Redux Toolkit** for complex state management with persistence
- **XState** for complex state machines (audio player, etc.)
- **SCSS Modules** for component styling
- **Vitest** for unit testing, **Playwright** for integration testing

### Key Directories

- `src/components/` - React components organized by feature
- `src/components/dls/` - Design Language System components
- `src/pages/` - Next.js pages (Pages Router)
- `src/redux/` - Redux store, slices, and middleware
- `src/utils/` - Utility functions organized by domain
- `src/hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `locales/` - i18n translations (18+ languages)

### State Management Architecture

- **Redux Toolkit** with persistence for settings, preferences, bookmarks
- **XState** for complex stateful components (audio player)
- Local component state with `useState` for simple UI state
- Custom hooks for reusable stateful logic

### Authentication & API

- Custom auth system with JWT tokens and refresh tokens
- API utilities in `src/utils/auth/api.ts`
- Protected routes using `withAuth` HOC
- User preferences synced between client and server

### Styling System

- SCSS modules for component-specific styles
- Theme system supporting light, dark, and sepia themes
- Design tokens in `src/styles/_constants.scss`
- Responsive breakpoints in `src/styles/_breakpoints.scss`
- Path aliases: `@/` for `src/`, `@/dls/*` for design system components

### Internationalization

- **next-translate** for i18n with 18+ supported languages
- Translation files in `locales/[lang]/` directories
- RTL support for Arabic and other languages

### Component Patterns

- Functional components with TypeScript interfaces for props
- Custom hooks for reusable logic
- Storybook stories for component development
- Form building with `FormBuilder` component

### Testing Strategy

- Unit tests with Vitest and React Testing Library
- Integration tests with Playwright
- Component testing through Storybook
- Test files co-located with components

### Build & Deployment

- **Sentry** for error tracking and performance monitoring
- **PWA** support with service workers
- Bundle analysis and optimization

## Important Notes

- Uses Pages Router, not App Router
- Authentication is custom-built, not using next-auth
- State persistence uses redux-persist
- Multiple themes supported (light/dark/sepia)
- Extensive i18n support with RTL languages
- Audio functionality uses XState for complex state management

## Git Workflow

### Branch Strategy

- **Production branch**: `production` (NOT `master`)
- When asked to create a PR "on production" or "for production", target the `production` branch

### Commit & PR Guidelines

- **Never mention "Claude" or "Claude Code"** in commit messages or PR descriptions
- Keep commit messages concise and descriptive
- PR descriptions should include a summary and test plan

## Code Quality Guidelines

- **Before writing code**: Read `docs/COMMON_MISTAKES.md` for patterns that have caused production
  bugs
- **Before reviewing PRs**: Read `docs/REVIEW_PROMPT.md` for comprehensive review criteria
- **When reviewing**: Use `/review {PR_NUMBER}` command for structured PR reviews
