# ContextMenu Component

This directory contains a refactored version of the ContextMenu component for the Quran reader application.

## Structure

The component has been refactored into a more maintainable and scalable structure:

```
ContextMenu/
├── components/             # Individual UI components
│   ├── ChapterNavigation.tsx  # Chapter name and sidebar toggle
│   └── PageInfo.tsx           # Juz, Hizb, and Page information
├── hooks/                  # Custom hooks for state management
│   └── useContextMenuState.ts # Centralized state management
├── styles/                 # Styles for the component
│   └── ContextMenu.module.scss # Styles (moved from parent directory)
├── index.tsx               # Main component that composes everything
└── README.md               # Documentation
```

## Improvements

1. **Separation of Concerns**:
   - UI components are separated from state management
   - Each component has a single responsibility

2. **Improved Accessibility**:
   - Fixed accessibility issues with proper keyboard navigation
   - Added proper ARIA roles for interactive elements

3. **Maintainability**:
   - Smaller, focused components are easier to understand and modify
   - State management is centralized in a custom hook

4. **Scalability**:
   - New features can be added by creating new components
   - State management is isolated and can be extended easily

5. **Readability**:
   - Clear component naming and organization
   - Consistent code style and patterns

## Usage

The main component can be imported and used the same way as before:

```tsx
import ContextMenu from '@/components/QuranReader/ContextMenu';

// In your component
<ContextMenu />
```

No changes are required to the component's API or usage.
