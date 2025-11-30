---
applyTo: 'src/components/**/*.tsx,src/pages/**/*.tsx'
---

# React Component Review Standards

Guidelines for React component reviews in the Quran.com frontend.

## Component Structure

- Require functional components only - flag any class components
- Flag components exceeding 150 lines - should be split
- Ensure single responsibility - one component, one purpose
- Flag prop drilling beyond 2 levels - suggest context or state management

## Props & Types

- Require explicit Props interface for all components
- Flag missing or incomplete prop types
- Ensure default values for optional props when appropriate

```tsx
// Good
interface VerseCardProps {
  verse: Verse;
  showTranslation?: boolean;
  onBookmark: (verseKey: string) => void;
}

const VerseCard: React.FC<VerseCardProps> = ({ verse, showTranslation = true, onBookmark }) => {
  // ...
};

// Bad - missing types
const VerseCard = ({ verse, showTranslation, onBookmark }) => {
  // ...
};
```

## Hooks Usage

- Flag `useEffect` without cleanup when needed (subscriptions, timers)
- Flag `useEffect` that could be replaced with event handlers
- Require proper dependency arrays - flag missing dependencies
- Flag unnecessary state - derive values when possible

```tsx
// Good - derived value
const isComplete = progress === 100;

// Bad - unnecessary state
const [isComplete, setIsComplete] = useState(false);
useEffect(() => {
  setIsComplete(progress === 100);
}, [progress]);
```

## Memoization

- Require `useCallback` for functions passed to child components
- Require `useMemo` for expensive computations
- Flag over-memoization where unnecessary

## Radix UI Components

- Flag custom implementations of common UI patterns
- Suggest Radix UI alternatives: Dialog, Dropdown, Tooltip, Popover, etc.

## Loading States

- Require skeleton loaders or placeholders for async data
- Flag missing loading states that could cause layout shifts
- Ensure proper error boundaries for error states

## Accessibility

- Require semantic HTML elements
- Flag missing ARIA labels on interactive elements
- Ensure keyboard navigation support
- Flag images without alt text
