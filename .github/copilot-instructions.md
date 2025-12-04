# Quran.com Frontend Code Review Guidelines

This file defines repository-wide code review standards for GitHub Copilot.

## Purpose & Scope

Copilot should review all pull requests against these standards to ensure code quality,
maintainability, and alignment with the Quran.com mission of helping millions of Muslims engage with
the Qur'an.

---

## PR Structure Requirements

- Flag PRs that appear to contain multiple unrelated changes (should be single-scope)
- Verify PR title follows format: `[QF-XXX] Brief description`
- Check that new environment variables are documented in PR description
- Ensure commits have meaningful, concise messages

## TypeScript Standards

- Flag usage of `any` type - prefer `unknown` or specific types
- Require explicit return types for public/exported functions
- Prefer `interface` over `type` for object definitions
- Use `type` for unions, intersections, and mapped types
- Require enums for repeated raw values of the same category

```typescript
// Good: Use enums for categorical values
enum GoalType {
  QURAN_TIME = 'QURAN_TIME',
  QURAN_PAGES = 'QURAN_PAGES',
  QURAN_RANGE = 'QURAN_RANGE',
}

// Bad: Using raw strings repeatedly
const goalType = 'QURAN_TIME';
```

## Code Quality

- Flag functions exceeding 30 lines - should be split
- Identify duplicated code that should be extracted to reusable functions (DRY principle)
- Flag unused imports, variables, or dead code
- Require proper error handling with meaningful fallbacks
- Flag skipped linting rules without clear justification
- Ensure complex logic has inline comments explaining "why"

## React & Next.js Patterns

- Require functional components only (no class components)
- Flag unnecessary `useEffect` usage
- Ensure proper memoization with `useMemo` and `useCallback` where appropriate
- Flag prop drilling - suggest proper state management
- Require skeleton loaders or placeholders for async data to prevent layout shifts
- Flag JavaScript-based responsive styling - prefer CSS media queries
- Ensure Radix UI components are used instead of custom implementations when available

## API & Data Handling

- Flag unnecessary API calls - suggest caching with `useSWR`
- Require optimistic UI updates for predictable interactions
- Flag redundant state when `useSWR` already manages cached data
- Ensure proper error states and fallbacks for failed API requests
- Flag blind trust in API responses without fallbacks

## Localization & Accessibility

- All user-facing text must use `next-translate` localization
- Flag hardcoded strings that should be localized
- Ensure RTL (right-to-left) support is maintained
- Require semantic HTML elements
- Flag missing ARIA attributes where needed

## Testing Requirements

- Flag PRs with new functionality but no corresponding tests
- Ensure test coverage for edge cases and error scenarios
- Verify test file naming follows `*.test.ts` or `*.test.tsx` pattern
- Flag tests without meaningful assertions

## Security

- Flag any hardcoded credentials or secrets
- Ensure environment variables are used for configuration
- Flag missing input validation or sanitization
- Ensure proper authentication checks for protected routes

## Performance

- Flag large bundle size impacts from new dependencies
- Require lazy loading for non-critical components
- Check for proper memoization to prevent unnecessary re-renders
- Flag components without proper cleanup in `useEffect`

## Documentation

- Require JSDoc comments for complex utility functions
- Ensure README updates when adding new features or setup changes
- Flag undocumented complex business logic

---

## Code Examples

### Error Handling Pattern

```typescript
// Good: Proper error handling with fallback
const fetchData = async () => {
  try {
    const response = await api.getData();
    return response.data;
  } catch (error) {
    logError('Failed to fetch data', error);
    return defaultValue; // Meaningful fallback
  }
};

// Bad: No error handling
const fetchData = async () => {
  const response = await api.getData();
  return response.data;
};
```

### Component Structure

```tsx
// Good: Focused component with proper typing
interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(user.id);
  }, [user.id, onSelect]);

  return (
    <button onClick={handleClick} className={styles.card}>
      {user.name}
    </button>
  );
};

// Bad: Missing types, inline handlers
const UserCard = ({ user, onSelect }) => (
  <button onClick={() => onSelect(user.id)}>{user.name}</button>
);
```

### Localization

```tsx
// Good: Localized text
import useTranslation from 'next-translate/useTranslation';

const WelcomeMessage = () => {
  const { t } = useTranslation('common');
  return <h1>{t('welcome-message')}</h1>;
};

// Bad: Hardcoded text
const WelcomeMessage = () => <h1>Welcome to Quran.com</h1>;
```
