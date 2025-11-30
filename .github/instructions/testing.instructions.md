---
applyTo: '**/*.test.ts,**/*.test.tsx,tests/**/*'
---

# Testing Review Standards

Guidelines for tests in the Quran.com frontend.

## Test Coverage

- Flag new functionality without corresponding tests
- Require tests for utility functions
- Require tests for custom hooks
- Ensure edge cases and error scenarios are covered

## Test Structure

- Follow AAA pattern: Arrange, Act, Assert
- Use descriptive test names that explain the expected behavior
- Group related tests with `describe` blocks

```typescript
// Good
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

// Bad - vague test name
it('should work', () => {
  // ...
});
```

## Assertions

- Flag tests without meaningful assertions
- Ensure assertions test the actual behavior, not implementation details
- Prefer user-centric queries (getByRole, getByText)

```typescript
// Good - testing user-visible behavior
expect(screen.getByText('Bookmarked')).toBeInTheDocument();

// Bad - testing implementation
expect(component.state.isBookmarked).toBe(true);
```

## Mocking

- Mock external dependencies (API calls, third-party services)
- Flag tests that make real network requests
- Use MSW for API mocking when appropriate

## File Naming

- Test files must follow `*.test.ts` or `*.test.tsx` pattern
- Co-locate unit tests with source files
- Place integration tests in `tests/integration/`
