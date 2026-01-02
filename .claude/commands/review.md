Review PR #$ARGUMENTS using the comprehensive review guidelines.

## Steps

1. Read the review prompt from `docs/REVIEW_PROMPT.md` for all criteria
2. Fetch PR details: `gh pr view $ARGUMENTS --json title,body,files,additions,deletions,author`
3. Fetch PR diff: `gh pr diff $ARGUMENTS`
4. If files changed > 15, flag for potential split before deep review

## Review Criteria

Apply all sections from the review prompt:

1. **Critical**: Security, error handling, rendering strategy, correctness, breaking changes
2. **Standard**: TypeScript, React patterns, localization/RTL, performance, accessibility
3. **Clean Code**: DRY, KISS, single responsibility, separation of concerns, SOLID
4. **Polish**: Function size, comments, dead code, console.log, naming
5. **Watch Out For**: Common bug patterns
6. **Bugs & Regressions**:
   - Existing functionality still works
   - Side effects on shared code/styles/state
   - Runtime issues (race conditions, memory leaks)
   - Testing verification based on what the PR changes (variants, themes, RTL, responsive, states,
     user flows)

## Issue Categories

Use these labels when categorizing issues:

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

## Output Format

Use the format from `docs/REVIEW_PROMPT.md`:

- **Summary** (brief, note if part of PR chain)
- **🔴 Critical Issues** - Use `[Category]` in title (e.g.,
  `#### 1. [Regression] Theme Settings Removed`)
- **🟠 Medium Issues** - Use `[Category]` in title
- **🟡 Low Issues** - Use `[Category]` in title
- **✅ What's Done Well**
- **🎯 Verdict** (conversational conclusion)

## Final Step

Ask me whether to post the review or make adjustments before posting to GitHub.
