# ContextMenu Component

This directory contains the refactored version of the ContextMenu component for the Quran reader application.

## Structure

The component has been refactored into a more maintainable and scalable structure:

```
ContextMenu/
├── components/                 # Individual UI components
│   ├── ChapterNavigation.tsx   # Chapter name and sidebar toggle
│   ├── MobileReadingTabs.tsx   # Mobile-specific reading tabs
│   ├── PageBookmarkAction.tsx  # Bookmark functionality
│   ├── PageInfo.tsx            # Juz, Hizb, and Page information
│   ├── ProgressBar.tsx         # Reading progress visualization
│   └── styles/                 # Component-specific styles
├── hooks/                      # Custom hooks for state management
│   └── useContextMenuState.ts  # Centralized state management
├── styles/                     # Styles for the component
│   └── ContextMenu.module.scss # Main styles
├── index.tsx                   # Main component that composes everything
└── README.md                   # Documentation
```

## Improvements

1. **Separation of Concerns**:
   - UI components are separated from state management
   - Each component has a single responsibility
   - Mobile and desktop experiences are handled separately

2. **Improved Accessibility**:
   - Fixed accessibility issues with proper keyboard navigation
   - Added proper ARIA roles for interactive elements
   - Enhanced focus management for interactive components

3. **Maintainability**:
   - Smaller, focused components are easier to understand and modify
   - State management is centralized in a custom hook
   - Responsive behavior is clearly separated

4. **Scalability**:
   - New features can be added by creating new components
   - State management is isolated and can be extended easily
   - Responsive design patterns are established for future components

5. **Readability**:
   - Clear component naming and organization
   - Consistent code style and patterns
   - Well-documented component responsibilities

## Features

- **Chapter Navigation**: Toggle sidebar and display current chapter
- **Page Information**: Display Juz, Hizb, and Page numbers
- **Reading Preferences**: Switch between different reading modes
- **Progress Tracking**: Visual indicator of reading progress
- **Mobile Optimization**: Specialized components for mobile experience
- **Responsive Layout**: Adapts to different screen sizes and orientations

## Usage

The main component can be imported and used the same way as before:

```tsx
import ContextMenu from '@/components/QuranReader/ContextMenu';

// In your component
<ContextMenu />
```

No changes are required to the component's API or usage.
