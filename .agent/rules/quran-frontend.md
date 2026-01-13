---
description: Comprehensive coding standards and review guidelines for Quran.com Frontend
---

# Quran.com Frontend Code Standards

This file defines repository-wide coding standards for Antigravity. Follow these guidelines to
ensure code quality, maintainability, and alignment with the Quran.com mission of helping millions
of Muslims engage with the Qur'an.

---

## General Behavior

- **Seek Clarity First**: Do not make changes until you have 95% confidence in what to build. Ask
  follow-up questions to clarify requirements.
- **Single-scope PRs**: Each PR should contain a single logical change. Flag PRs with multiple
  unrelated changes.
- **Commit Messages**: Write meaningful, concise commit messages.

---

## TypeScript Standards

### Type Safety

- **No `any`**: Flag usage of `any` type—prefer `unknown` or specific types instead
- **Explicit Return Types**: Require explicit return types for all exported/public functions
- **Strict Null Checks**: Handle null/undefined properly throughout

### Interface vs Type

```typescript
// Good - use interface for object shapes
interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
}

// Use type only for unions, intersections, mapped types
type ReadingMode = 'reading' | 'translation' | 'listening';
```

### Enums for Constants

Require enums when the same raw values appear multiple times:

```typescript
// Good
enum GoalType {
  QURAN_TIME = 'QURAN_TIME',
  QURAN_PAGES = 'QURAN_PAGES',
  QURAN_RANGE = 'QURAN_RANGE',
}

// Bad - repeated strings
const goalType = 'QURAN_TIME';
```

### Naming Conventions

- `PascalCase` for types, interfaces, enums, components
- `camelCase` for variables, functions, methods
- `UPPER_SNAKE_CASE` for constants
- Prefix Props interfaces with component name: `ButtonProps`, `ModalProps`

### Import Order

Group order: React → External packages → Internal modules → Types

---

## React & Component Standards

### Component Structure

- **Functional components only**—flag any class components
- **Single responsibility**—one component, one purpose
- Flag components exceeding 150 lines—should be split
- Flag prop drilling beyond 2 levels—suggest context or state management

### Props & Types

```tsx
// Good - explicit Props interface
interface VerseCardProps {
  verse: Verse;
  showTranslation?: boolean;
  onBookmark: (verseKey: string) => void;
}

const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  showTranslation = true, // default value
  onBookmark
}) => {
  // ...
};

// Bad - missing types
const VerseCard = ({ verse, showTranslation, onBookmark }) => { ... };
```

### Hooks Usage

```tsx
// Good - derived value
const isComplete = progress === 100;

// Bad - unnecessary state
const [isComplete, setIsComplete] = useState(false);
useEffect(() => {
  setIsComplete(progress === 100);
}, [progress]);
```

- Flag `useEffect` without cleanup when needed (subscriptions, timers)
- Flag `useEffect` that could be replaced with event handlers
- Require proper dependency arrays

### Memoization

- Use `useCallback` for functions passed to child components
- Use `useMemo` for expensive computations
- Flag over-memoization where unnecessary

### Radix UI Components

- Flag custom implementations of common UI patterns—suggest Radix UI alternatives (Dialog, Dropdown,
  Tooltip, Popover, etc.)

### Loading States

- Require skeleton loaders or placeholders for async data
- Flag missing loading states that could cause layout shifts
- Ensure proper error boundaries

---

## API & Data Handling

### Data Fetching

Use `useSWR` for data fetching—flag raw fetch/axios calls in components:

```typescript
// Good - using useSWR
const { data, error, isLoading } = useSWR(makeVersesUrl(chapterId), fetcher);

// Good - for rarely changing data
const { data } = useSWRImmutable('/api/chapters', fetcher);

// Bad - manual fetching without caching
useEffect(() => {
  fetch(makeVersesUrl(chapterId))
    .then((res) => res.json())
    .then(setData);
}, [chapterId]);
```

### State Management

- Flag using Redux/store when `useSWR` cache is sufficient
- Require optimistic updates for predictable actions:

```typescript
const handleBookmark = async () => {
  mutate(key, optimisticData, false); // Update UI immediately
  await addBookmark(verseKey);
  mutate(key); // Revalidate
};
```

### Error Handling

```typescript
// Good - proper error handling with fallback
const fetchData = async () => {
  try {
    const response = await api.getData();
    return response.data;
  } catch (error) {
    logError('Failed to fetch data', error);
    return defaultValue;
  }
};

// Component error handling
if (error) {
  return <ErrorMessage message={t('error.failed-to-load')} />;
}
if (!data) {
  return <VersesSkeleton />;
}
```

### Response Validation

```typescript
// Good - null checks with fallback
const versesCount = response?.pagination?.totalRecords ?? 0;

// Bad - no null checks
const versesCount = response.pagination.totalRecords;
```

---

## Localization & RTL

### Text Content

- **All user-facing text must use `next-translate`**—flag hardcoded strings
- Only English locale files should be modified—other locales use Lokalise

```tsx
// Good
import useTranslation from 'next-translate/useTranslation';

const { t } = useTranslation('common');
return <p>{t('verse.bookmark-added')}</p>;

// Bad - hardcoded string
return <p>Bookmark added successfully</p>;
```

### Translation Keys

Use descriptive, hierarchical key names:

```typescript
// Good
t('reading.settings.font-size');
t('reading.settings.theme');

// Bad
t('fontSize');
t('themeOption');
```

### Dynamic Content

```typescript
// Good - interpolation
t('verse.ayah-number', { number: verseNumber });

// Bad - string concatenation
t('verse.ayah') + ' ' + verseNumber;
```

### RTL Support

Use logical CSS properties:

```scss
// Good - logical properties
margin-inline-start: 1rem;
padding-inline-end: 0.5rem;

// Bad - physical properties (breaks RTL)
margin-left: 1rem;
padding-right: 0.5rem;
```

---

## Styling Standards

### File Structure

- Each component should have its own `.module.scss` file
- Co-locate styles with their components
- Flag shared stylesheets that should be component-specific

### Responsive Design

- Use CSS media queries for responsive styling (mobile-first approach)
- Flag JavaScript-based responsive logic that should be CSS

```scss
// Good - CSS media queries
.container {
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}
```

### Design Tokens

Use CSS variables:

```scss
// Good
.text {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

// Bad - hardcoded values
.text {
  color: #333333;
  font-size: 16px;
}
```

### Layout Shifts

- Ensure elements have explicit dimensions when needed
- Flag layouts that may cause CLS (Cumulative Layout Shift)
- Use aspect-ratio for media containers

---

## Security

### Credentials & Secrets

- Flag ANY hardcoded credentials, API keys, or secrets
- Ensure all sensitive values use environment variables

```typescript
// Good
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// Bad - NEVER do this
const apiKey = 'sk-1234567890abcdef';
```

### Environment Variables

- Document new environment variables in PR description
- Use `NEXT_PUBLIC_` prefix only for client-side variables
- Flag sensitive data exposed to client

### Input Validation

```typescript
// Good
const sanitizedInput = DOMPurify.sanitize(userInput);

// Bad - XSS vulnerability
dangerouslySetInnerHTML={{ __html: userInput }}
```

### Authentication

- Flag protected routes without auth checks
- Ensure proper session validation

---

## Testing Standards

### Test Coverage

- Flag new functionality without corresponding tests
- Require tests for utility functions and custom hooks
- Ensure edge cases and error scenarios are covered

### Test Structure

Follow AAA pattern: Arrange, Act, Assert

```typescript
describe('BookmarkButton', () => {
  describe('when user is logged in', () => {
    it('should add bookmark when clicked', async () => {
      // Arrange
      const onBookmark = vi.fn();
      render(<BookmarkButton onBookmark={onBookmark} />);

      // Act
      await userEvent.click(screen.getByRole('button'));

      // Assert
      expect(onBookmark).toHaveBeenCalledOnce();
    });
  });
});
```

### Assertions

- Flag tests without meaningful assertions
- Test user-visible behavior, not implementation details
- Prefer user-centric queries (getByRole, getByText)

### File Naming

- Test files: `*.test.ts` or `*.test.tsx`
- Co-locate unit tests with source files
- Place integration tests in `tests/integration/`

---

## Playwright Integration Tests

### Where Things Live

- Integration tests: `tests/integration/**`
- Logged-in tests: `tests/integration/loggedin/**`
- Page objects (POM): `tests/POM/**`
- Shared helpers: `tests/helpers/**`
- Central test ids: `tests/test-ids.ts`

### Running Tests

```bash
yarn test:integration                                    # All tests
yarn test:integration tests/integration/<path>.spec.ts   # Single file
```

### Selector Strategy

Prefer stable, user-facing queries:

- `page.getByRole(...)` for buttons/links/inputs
- `page.getByTestId(...)` with `TestId` from `tests/test-ids.ts`

### Logged-in Prerequisites

Always set prerequisites explicitly before assertions:

- Call `ensureEnglishLanguage(page)` if test asserts English text
- Reset translations via `clearSelectedTranslations(page, { isMobile })`
- Do not rely on previous test state

### Test Template

```typescript
import { expect, test } from '@playwright/test';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

test.describe('Feature X', () => {
  test('does Y', async ({ page, context }) => {
    const home = new Homepage(page, context);
    await home.goTo('/');

    await page.getByTestId(TestId.NAVIGATE_QURAN_BUTTON).click();
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER)).toBeVisible();
  });
});
```

---

## Accessibility

- Require semantic HTML elements (`button`, `a` not `div onClick`)
- Flag missing ARIA labels on interactive elements
- Ensure keyboard navigation support
- Flag images without alt text
- Ensure focus states are visible

---

## Performance

- Flag large bundle size impacts from new dependencies (max ~10kb gzipped)
- Require lazy loading for non-critical components
- Check for proper memoization to prevent unnecessary re-renders
- Flag components without proper cleanup in `useEffect`

---

## Documentation

- Require JSDoc comments for complex utility functions
- Update README when adding new features or setup changes
- Flag undocumented complex business logic

---

## Code Review Categories

When reviewing code, use these labels:

| Category        | Covers                                           |
| --------------- | ------------------------------------------------ |
| `[Security]`    | Secrets, XSS, input validation                   |
| `[Correctness]` | Logic bugs, wrong behavior, missing requirements |
| `[Regression]`  | Breaking existing functionality                  |
| `[Performance]` | Re-renders, bundle size, memoization             |
| `[Theming]`     | Colors, dark/light/sepia mode                    |
| `[RTL]`         | Logical properties, layout direction             |
| `[i18n]`        | Hardcoded strings, localization                  |
| `[A11y]`        | Accessibility issues                             |
| `[Testing]`     | Missing tests, untested scenarios                |
| `[TypeScript]`  | Types, any usage, interfaces                     |
| `[React]`       | Patterns, hooks, state management                |
| `[Clean Code]`  | DRY, KISS, SOLID violations                      |
| `[Polish]`      | Naming, formatting, comments                     |
