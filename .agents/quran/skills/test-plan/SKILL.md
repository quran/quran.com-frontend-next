---
name: test-plan
description:
  Generates a comprehensive testing plan based on the current branch changes or a specific PR. Use
  when creating QA checklists, test plans, or verifying PR readiness.
---

# Generate Testing Plan for PR

Generate a comprehensive testing plan based on the current branch changes or a specific PR.

## Arguments

`$ARGUMENTS` can be:

- Empty: Uses current branch diff against `production`
- PR number: `2732` - fetches that PR's diff

## Steps

1. **Get the diff:**

   - If `$ARGUMENTS` is empty: `git diff production...HEAD`
   - If `$ARGUMENTS` is a PR number: `gh pr diff {PR_NUMBER}`

2. **Read `docs/COMMON_MISTAKES.md`** for patterns that have caused production bugs

3. **Analyze the changes:**

   - Identify files changed and their types (components, hooks, utils, styles, pages)
   - Categorize the change (new feature, bug fix, refactor, styling)
   - Assess risk level based on scope and what's touched

4. **Generate the testing plan** using the criteria below and output format

## Testing Criteria

### Critical Checks

- **Security**: No hardcoded secrets, input validation, no unsanitized `dangerouslySetInnerHTML`
- **Error Handling**: API failures have fallbacks, validate API response shape before accessing
- **Rendering Strategy**: SSG for static+SEO, ISR for periodic+SEO, SSR for user-specific+SEO, CSR
  for private/no-SEO
- **Correctness**: Code matches requirements, UI matches designs, safely revertible

### Standard Checks

- **TypeScript**: No unjustified `any`, interfaces for objects, enums for categoricals
- **React**: No unnecessary `useEffect`, use `useSWR` cache directly, skeleton loaders, optimistic
  updates
- **i18n/RTL**: All text via `t()`, CSS logical properties only (`margin-inline-start` not
  `margin-left`)
- **Performance**: Lazy load non-critical components, new packages <10kb gzipped
- **A11y**: Semantic elements (`button`/`a` not `div onClick`), images have `alt`, inputs have
  `label`

### Regression Checks

- Modified components still work as before
- Shared hooks/utils don't break other consumers
- Style changes don't affect other components
- No race conditions, memory leaks, or unhandled promise rejections

### Visual Verification

- **Themes**: Light, dark, sepia
- **RTL**: Arabic layout mirrors correctly
- **Responsive**: Mobile, tablet, desktop breakpoints

## Output Format

Generate a testing plan with sections proportional to the change. Skip sections that don't apply.

```markdown
## Testing Plan

### Change Summary

- **Type:** [New Feature | Bug Fix | Refactor | Styling | Config]
- **Risk Level:** [Low | Medium | High]
- **Files Changed:** X files
- **What it does:** Brief description

---

### Critical Path Tests

<!-- Primary functionality that MUST work -->

- [ ] [Specific test based on what the PR does]
- [ ] [Another specific test]

### State Verification

<!-- Only include states relevant to the change -->

- [ ] Loading state displays correctly
- [ ] Error state displays correctly (simulate: disconnect network / return 500)
- [ ] Empty state displays correctly (no data scenario)
- [ ] Success state displays correctly

### Visual & Theme Tests

<!-- Only if UI changes -->

| Theme | Verified |
| ----- | -------- |
| Light |          |
| Dark  |          |
| Sepia |          |

| Breakpoint      | Verified |
| --------------- | -------- |
| Mobile (<768px) |          |
| Tablet          |          |
| Desktop         |          |

| Direction | Verified |
| --------- | -------- |
| LTR       |          |
| RTL (AR)  |          |

### Regression Tests

<!-- Based on what files were modified, what else might break -->

- [ ] [Component X that imports this file still works]
- [ ] [Feature Y that uses this hook still works]

### Edge Cases

<!-- Specific to this change type -->

- [ ] [Relevant edge case 1]
- [ ] [Relevant edge case 2]

### Accessibility

<!-- Only if interactive elements changed -->

- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus states visible
- [ ] Screen reader compatible

---

### Pre-Merge Checks

- [ ] `yarn lint` passes
- [ ] `yarn test` passes
- [ ] `yarn build` succeeds
- [ ] No console.log statements
- [ ] No hardcoded strings (using `t()`)
```

## Guidelines

### Be Specific, Not Generic

```markdown
// Bad - too generic

- [ ] Component works correctly

// Good - specific and actionable

- [ ] Clicking "Add Bookmark" shows success toast and updates bookmark icon
- [ ] Removing bookmark while offline shows error message
```

### Scale to Change Size

| Change Size       | Testing Depth                       |
| ----------------- | ----------------------------------- |
| Tiny (1-2 LOC)    | Critical path only, 2-3 tests       |
| Small (<50 LOC)   | Critical + states, 5-8 tests        |
| Medium            | Full plan minus irrelevant sections |
| Large (>15 files) | Full plan + flag for splitting      |

### Derive from Common Mistakes

Apply patterns from `docs/COMMON_MISTAKES.md`:

- Fetches data → verify loading/error/empty states
- Uses arrays → verify empty, single item, many items
- User input → verify validation, empty submit, error handling
- Touches styles → verify RTL, themes, responsive
- Modifies shared code → verify all consumers still work

## Final Output

After generating the plan:

1. Display the testing plan in markdown format
2. Tell the user they can copy/paste it into their PR description
3. Offer to help test any specific scenarios they're unsure about
