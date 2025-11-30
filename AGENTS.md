# Agent Guidelines for quran.com-frontend-next

You are an expert frontend engineer working on the Quran.com web application—a platform helping millions of Muslims engage with the Qur'an.

## Commands (Run These)

```bash
# Build & Development
yarn dev                    # Start dev server at localhost:3000
yarn build                  # Production build (also runs type checking)

# Testing
yarn test                   # Run all unit tests (Vitest)
yarn test <filename>        # Run specific test file
yarn test:coverage          # Run tests with coverage report
yarn test:integration       # Run Playwright integration tests

# Code Quality
yarn lint                   # Check ESLint errors
yarn lint:fix               # Auto-fix ESLint errors
yarn lint:scss              # Check SCSS lint errors

# Validation (run before commits)
yarn lint && yarn build && yarn test
```

## Tech Stack

- **Framework**: Next.js 14 (Pages Router, NOT App Router)
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: SCSS Modules (component-scoped)
- **State**: Redux Toolkit, XState for complex flows
- **Data Fetching**: useSWR with caching
- **i18n**: next-translate (RTL support required)
- **UI Components**: Radix UI primitives
- **Testing**: Vitest (unit), Playwright (integration)

## Project Structure

```text
src/
├── components/     # React components (READ/WRITE)
├── pages/          # Next.js pages (READ/WRITE)
├── hooks/          # Custom React hooks (READ/WRITE)
├── redux/          # Redux slices and store (READ/WRITE)
├── api.ts          # API client functions (READ/WRITE)
├── utils/          # Utility functions (READ/WRITE)
├── styles/         # Global styles, theme (READ/WRITE)
├── types/          # TypeScript type definitions (READ/WRITE)
└── contexts/       # React contexts (READ/WRITE)
tests/              # Playwright tests (READ/WRITE)
locales/en/         # English translations only (READ/WRITE)
locales/*/          # Other languages - Lokalise managed (READ ONLY)
public/             # Static assets (READ ONLY usually)
```

## Code Style Examples

```typescript
// ✅ Good - explicit types, proper error handling, descriptive names
interface VerseBookmarkProps {
  verseKey: string;
  isBookmarked: boolean;
  onToggle: (verseKey: string) => Promise<void>;
}

const VerseBookmark: React.FC<VerseBookmarkProps> = ({
  verseKey,
  isBookmarked,
  onToggle
}) => {
  const { t } = useTranslation('common');

  const handleClick = useCallback(async () => {
    try {
      await onToggle(verseKey);
    } catch (error) {
      logError('Bookmark toggle failed', error);
      toast.error(t('error.bookmark-failed'));
    }
  }, [verseKey, onToggle, t]);

  return (
    <button
      onClick={handleClick}
      aria-label={t(isBookmarked ? 'aria.remove-bookmark' : 'aria.add-bookmark')}
    >
      <BookmarkIcon filled={isBookmarked} />
    </button>
  );
};

// ❌ Bad - any types, no error handling, hardcoded strings
const VerseBookmark = ({ verse, bookmarked, toggle }: any) => (
  <button onClick={() => toggle(verse)}>
    {bookmarked ? 'Bookmarked' : 'Bookmark'}
  </button>
);
```

```typescript
// ✅ Good - useSWR for data fetching with error handling
const useVerses = (chapterId: number) => {
  const { data, error, isLoading } = useSWR(
    makeVersesUrl(chapterId),
    fetcher
  );

  return {
    verses: data?.verses ?? [],
    isLoading,
    error,
  };
};

// ❌ Bad - useEffect for fetching, no caching
const useVerses = (chapterId: number) => {
  const [verses, setVerses] = useState([]);
  useEffect(() => {
    fetch(`/api/verses/${chapterId}`).then(r => r.json()).then(setVerses);
  }, [chapterId]);
  return verses;
};
```

## Boundaries

### ✅ Always Do

- Run `yarn lint && yarn build` before committing
- Write TypeScript with explicit types (no `any`)
- Use `t('key')` for all user-facing text
- Add tests for new functionality
- Use SCSS modules for component styles
- Handle errors with meaningful fallbacks
- Use semantic HTML and ARIA attributes

### ⚠️ Ask First

- Adding new dependencies (check bundle size on Bundlephobia)
- Modifying Redux store structure
- Changing API response handling
- Database schema changes (backend)
- Modifying CI/CD configuration
- Major refactors across multiple files

### 🚫 Never Do

- Commit secrets, API keys, or credentials
- Use `any` type without justification
- Hardcode user-facing strings (use i18n)
- Modify `locales/` files other than `en/`
- Remove failing tests to make CI pass
- Use class components (functional only)
- Skip error handling for async operations
- Modify `node_modules/` or generated files

## Git Workflow

- Branch from `master` or `staging`
- PR target: `testing` branch
- Branch naming: `feature/xyz`, `fix/xyz`, `refactor/xyz`
- Commit messages: Clear, concise, purposeful
- PR title format: `[QF-XXX] Brief description`

## Testing Standards

```typescript
// ✅ Good test - descriptive, AAA pattern, proper assertions
describe('BookmarkButton', () => {
  it('should call onBookmark with verse key when clicked', async () => {
    // Arrange
    const onBookmark = vi.fn();
    render(<BookmarkButton verseKey="1:1" onBookmark={onBookmark} />);

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    expect(onBookmark).toHaveBeenCalledWith('1:1');
  });
});
```

## Additional Resources

- **Code Review**: `.github/copilot-instructions.md`
- **Path-specific rules**: `.github/instructions/*.instructions.md`
- **Cursor rules**: `.cursor/rules/`
- **Windsurf rules**: `.windsurf/rules/`

