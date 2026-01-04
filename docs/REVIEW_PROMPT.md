# Frontend Code Review Prompt

## Instructions

1. Fetch the PR from the provided link
2. Extract: title, description, linked Jira ticket, files changed
3. Verify PR template is complete (description, testing plan, checklist)
4. If files changed > 15, flag for potential split before deep review
5. Review the diff against criteria below
6. Output findings in the specified format

**Stack**: Next.js (Pages Router), TypeScript strict, SCSS modules, useSWR, next-translate, Radix UI

---

## 1. 🔴 Critical (Block Merge)

**Security**

- No hardcoded secrets or credentials
- Input validation on user-provided data
- No `dangerouslySetInnerHTML` without sanitization

**Error Handling**

- API failures have fallbacks—never blank screens or crashes
- Don't trust API response shape; validate before accessing nested properties

**Rendering Strategy**

- SSG (`getStaticProps`) for static + SEO content (Surah pages, articles)
- ISR (`revalidate`) for periodic updates + SEO (reflection feeds)
- SSR (`getServerSideProps`) for user-specific + SEO (public profiles)
- CSR (`useSWR` only) for private, no-SEO data (dashboard, bookmarks)

**Correctness**

- Code matches Jira ticket requirements
- UI matches Figma designs
- Can be safely reverted if it breaks production

**Breaking Changes**

- Any API contract changes flagged
- Backend coordination requirements documented
- New env vars listed in PR description

---

## 2. 🟠 Standard Review

**TypeScript**

- No `any` without justification comment
- Interfaces for object shapes
- Enums for categorical/repeated values

**React Patterns**

- No unnecessary `useEffect`—derive state when possible
- `useSWR` for fetching; don't duplicate cached data in useState
- Skeleton loaders for async content
- Optimistic updates for predictable actions (like/unlike)

**Localization & RTL**

- All text via `t('key')`—no hardcoded strings
- CSS logical properties only (`margin-inline-start`, not `margin-left`)
- No changes to non-English locale files

**Performance**

- Lazy load non-critical components (`next/dynamic`)
- New packages < 10kb gzipped (check Bundlephobia)
- No obvious re-render issues

**Accessibility**

- Interactive elements: `<button>` or `<a>`, not `<div onClick>`
- Images have `alt` text
- Form inputs have `<label>`

---

## 3. 🟠 Clean Code

**DRY**

- No repeated logic—extract to utils/hooks if used > 2 times

**KISS**

- Simplest solution that works—no over-engineering

**Single Responsibility**

- Each component/hook does one thing
- Components < 200 lines

**Separation of Concerns**

- Data fetching in hooks, not components
- Business logic in utils, not JSX
- Styling in SCSS modules, not inline

**SOLID**

- Extend via composition, not prop explosion
- Custom components work like native elements (forward refs, spread props)

---

## 4. 🟡 Polish

- Functions < 30 lines
- Comments explain "why", not "what"
- No dead code or commented-out code
- No `console.log`
- Component names self-explanatory
- One `module.scss` per component
- No linting bypasses without justification
- Storybook updated if component changed

---

## 5. ⚠️ Watch Out For

Common patterns that cause bugs:

- [ ] Missing loading state
- [ ] Missing error state
- [ ] Missing empty state
- [ ] Wrong rendering strategy (CSR for SEO pages)
- [ ] `useSWR` + `useState` duplication
- [ ] Array index as `key`
- [ ] Hardcoded strings (not using `t()`)
- [ ] CSS `left`/`right` instead of logical properties
- [ ] `div` with `onClick` instead of `button`
- [ ] Unhandled promise rejection (no try/catch)
- [ ] New package added without size evaluation

---

## 6. 🔍 Bugs & Regressions

**Existing Functionality**

- Modified components still work as before
- Shared hooks/utils don't break other consumers
- Props changes are backward compatible or all usages updated
- Removed/renamed exports don't break imports elsewhere

**Side Effects**

- Changes to shared styles don't affect other components
- Store/context state changes don't break other selectors/consumers
- API changes coordinated with backend
- SVG icons use `currentColor` for theming compatibility

**Runtime Issues**

- No race conditions or timing issues
- No memory leaks (event listeners, subscriptions cleaned up)
- No unhandled promise rejections

**Testing Verification** (based on PR changes)

Identify and verify relevant scenarios:

- **Component variants**: If component has size/type/variant props, test all combinations
- **Themes**: If styles changed, verify in light, dark, and sepia
- **RTL**: If layout/spacing changed, verify RTL languages
- **Responsive**: If layout changed, verify mobile/tablet/desktop breakpoints
- **States**: If data-driven, verify loading, error, empty, and success states
- **User flows**: If behavior changed, verify all user interaction paths
- **Shared dependencies**: If hook/util modified, verify all consumer components
- **Edge cases**: Identify and test boundary conditions specific to the change

---

## Output Format

### Categories

Use these labels to categorize issues:

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
| `[Polish]`      | Naming, formatting, comments, EOF                |

---

### Summary

Brief description of what this PR does, note if part of a PR chain (Part X of Y).

---

### 🔴 CRITICAL ISSUES

#### 1. [Category] Issue Title

**File:** `filename.tsx:line`

```tsx
// code snippet showing the problem
```

**Problem:** Explanation of what's wrong **Fix:** Specific suggestion with code if helpful

---

### 🟠 MEDIUM ISSUES

#### 1. [Category] Issue Title

**File:** `filename.tsx:line`

```tsx
// code snippet showing the problem
```

**Problem:** Explanation of what's wrong **Fix:** Specific suggestion with code if helpful

---

### 🟡 LOW ISSUES

#### 1. [Category] Issue Title

**File:** `filename.tsx:line` **Issue:** Brief description **Fix:** Suggestion

---

### ✅ WHAT'S DONE WELL

- **Pattern name** - Specific praise
- **Pattern name** - Specific praise

---

### 🎯 VERDICT

Write a brief, conversational conclusion like a colleague would:

**Example (changes requested):**

> Good progress on the Study Mode feature! The component structure is solid and accessibility is
> well-handled.
>
> Before merging, please fix the hardcoded SVG colors—they'll break theming. Also worth addressing
> the RTL issues with CSS logical properties.
>
> Nice work on the keyboard navigation 👍

**Example (approved):**

> Clean implementation. DRY principles followed well with the shared component extraction.
>
> Minor: consider memoizing the tabs array, but not blocking.
>
> ✅ Good to merge
