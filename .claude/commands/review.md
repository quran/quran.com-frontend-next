Review PR(s) using the comprehensive review guidelines.

## Arguments

`$ARGUMENTS` can be:

- Single PR: `2732`
- Multiple PRs: `2732 2700 2699` (space-separated)
- Multiple PRs: `2732,2700,2699` (comma-separated)

## Steps

### For Each PR:

1. Read the review prompt from `docs/REVIEW_PROMPT.md` for all criteria
2. Fetch PR details: `gh pr view {PR_NUMBER} --json title,body,files,additions,deletions,author`
3. Fetch PR diff: `gh pr diff {PR_NUMBER}`
4. If files changed > 15, flag for potential split before deep review
5. **Check for previous reviews** (see Re-review Protocol below)

## Re-review Protocol

Before reviewing, check if this PR has been previously reviewed:

1. **Fetch previous reviews and comments:**

   ```bash
   gh pr view {PR_NUMBER} --json reviews,comments
   ```

2. **If previous reviews exist:**
   - Summarize previous review status (APPROVED, CHANGES_REQUESTED, COMMENTED)
   - List key issues raised in previous reviews
   - Check commits since last review: `gh pr view {PR_NUMBER} --json commits`
   - Focus on:
     - Whether previous feedback was addressed
     - New changes introduced since last review
     - Any regressions caused while fixing previous issues
   - In the review output, add a "📋 Previous Review Status" section

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
- **📋 Previous Review Status** (only for re-reviews: what was raised, what's addressed)
- **🔴 Critical Issues** - Use `[Category]` in title (e.g.,
  `#### 1. [Regression] Theme Settings Removed`)
- **🟠 Medium Issues** - Use `[Category]` in title
- **🟡 Low Issues** - Use `[Category]` in title
- **✅ What's Done Well**
- **🎯 Verdict** (conversational conclusion)

## Multi-PR Workflow

When reviewing multiple PRs:

1. Review each PR individually following all steps above
2. After each review, ask whether to:
   - Post review to GitHub
   - Make adjustments
   - Continue to next PR
3. After all PRs are reviewed, provide a brief summary of all reviews

## Final Step

Ask me whether to post the review or make adjustments before posting to GitHub.
