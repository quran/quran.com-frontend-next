Review my code changes against the Quran.com frontend project guidelines.

## Context

- Next.js (Pages Router), TypeScript strict mode, SCSS modules
- next-translate for i18n, useSWR for data fetching, Radix UI components

## Check For

**TypeScript**: No `any` types, explicit return types on exports, interfaces for objects, enums for
repeated values

**React**: Functional components only, Props interface, proper memoization, no unnecessary
useEffect, skeleton loaders for async data

**Code Quality**: Functions <30 lines, DRY code, proper error handling with fallbacks, no unused
code, comments explain "why"

**API/Data**: useSWR for fetching, error states handled, API response fallbacks, optimistic updates

**Localization**: All text uses `t('key')` from next-translate, no hardcoded strings, RTL-safe CSS
(logical properties like margin-inline-start)

**Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation

**Security**: No hardcoded secrets, env vars for config, input validation

**Testing**: Tests for new functionality, edge cases, error scenarios

## Output Format

1. **🚨 Critical** - Must fix before PR
2. **💡 Suggestions** - Improvements to consider
3. **✅ Good** - What's done well

Include file paths and line numbers.
