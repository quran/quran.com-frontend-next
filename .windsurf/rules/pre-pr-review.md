# Pre-PR Code Review Standards

When reviewing code changes, check against these Quran.com project guidelines:

## TypeScript

- Flag any `any` types - use `unknown` or specific types
- Require explicit return types on exported functions
- Use interfaces for object shapes, types for unions
- Use enums for repeated categorical values

## React Components

- Functional components only - no class components
- Props interface must be defined
- Use proper memoization (useCallback, useMemo) for callbacks/expensive computations
- Flag unnecessary useEffect - prefer event handlers or derived state
- Require skeleton loaders for async data to prevent layout shifts

## Code Quality

- Functions should be under 30 lines
- Flag duplicated code - extract to reusable functions (DRY)
- Require proper error handling with meaningful fallbacks
- Flag unused imports, variables, or dead code
- Comments should explain "why" not "what"

## API & Data Handling

- Use useSWR for data fetching, not raw fetch in components
- Handle error states with user-friendly messages
- Provide fallbacks for API responses - don't blindly trust data
- Use optimistic updates for predictable actions (bookmark, like)

## Localization

- All user-facing text must use `t('key')` from next-translate
- No hardcoded strings in UI
- Use RTL-safe CSS logical properties (margin-inline-start, not margin-left)

## Accessibility

- Use semantic HTML elements
- Add ARIA attributes where needed
- Ensure keyboard navigation works

## Security

- No hardcoded secrets or credentials
- Use environment variables for configuration
- Validate and sanitize user inputs

## Testing

- New functionality needs tests
- Cover edge cases and error scenarios
- Test file naming: `*.test.ts` or `*.test.tsx`

## Review Output Format

When providing review feedback:

1. 🚨 **Critical** - Must fix before PR
2. 💡 **Suggestions** - Improvements to consider
3. ✅ **Good** - What's done well

Include file paths and line numbers in feedback.
