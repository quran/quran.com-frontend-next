# Create Pull Request

Create a PR using the project template with comprehensive, well-documented summaries that explain
the problem context, root causes, and solution approach.

## Arguments

`$ARGUMENTS` can be:

- Empty: Creates PR against `production` branch
- Branch name: `master` or `main` - target branch for the PR

## Steps

### 1. Gather Information

Run these commands in parallel:

```bash
# Get current branch name
git branch --show-current

# Get commit history for this branch
git log production..HEAD --oneline

# Get the diff stats
git diff production...HEAD --stat

# Get detailed changes
git diff production...HEAD
```

### 2. Deep Analysis of Changes

Go beyond surface-level "what changed" to understand the **why** and **how**:

#### 2.1 Identify the Problems Being Solved

For each significant change, ask:

- **What bug or issue does this fix?** Look for:

  - Conditional logic changes (fixing edge cases)
  - New validation/checks (preventing errors)
  - State management changes (fixing race conditions, stale data)
  - UI/styling fixes (layout, RTL, theming issues)

- **What was the root cause?** Analyze:

  - Why did the bug exist in the first place?
  - What assumption was wrong?
  - What edge case wasn't handled?

- **What user-facing problem did this cause?** Think about:
  - What would users experience before this fix?
  - Broken UI? Wrong data? Crashes? Poor UX?

#### 2.2 Understand the Solution Approach

For each fix, document:

- **What pattern or technique was used?**

  - New selector/hook for data validation
  - CSS changes for layout/RTL
  - State management refactoring
  - Error boundary/fallback handling

- **Why was this approach chosen?**

  - What alternatives existed?
  - Why is this solution better?

- **What are the key code changes?**
  - Include small, relevant code snippets
  - Highlight the "before vs after" logic

#### 2.3 Identify Affected Areas

- Components modified and their relationships
- Shared utilities/hooks that might affect other features
- State/Redux changes and their consumers
- Styling changes and theme implications

### 3. Extract Ticket Number

- Look for ticket references in branch name (e.g., `QF-1234`, `feature/QF-1234-description`)
- Look for ticket references in commit messages
- If no ticket found, leave as `QF-XXXX` placeholder

### 4. Generate PR Content

Use this enhanced template structure:

```markdown
## Summary

[1-2 sentence high-level description of what this PR accomplishes]

Closes: [QF-XXXX](https://quranfoundation.atlassian.net/browse/QF-XXXX)

---

## Problems & Root Causes

<!-- For each problem fixed, document what was broken and WHY -->

### 1. [Problem Name]

**Problem:** [What users experienced / what was broken]

**Root Cause:** [Technical explanation of why the bug existed]

**Example scenario:** (if helpful)

1. User does X
2. System state becomes Y
3. Bug manifests as Z

### 2. [Problem Name]

**Problem:** [Description]

**Root Cause:** [Explanation]

<!-- Add more problems as needed -->

---

## Solution Approach

<!-- For each problem, explain HOW it was fixed -->

### 1. [Solution Name]

[Explanation of the approach taken]

` ` `typescript // Key code snippet showing the solution (if helpful) ` ` `

### 2. [Solution Name]

[Explanation]

<!-- Add more solutions as needed -->

---

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as
      expected)
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring (no functional changes)

## Scope Confirmation

- [ ] This PR addresses **one** feature/fix only
- [ ] If multiple changes were needed, they are split into separate PRs

## Test Plan

- [ ] Manual testing performed

**Testing steps:**

<!-- Generate specific, actionable steps based on the problems fixed -->

1. **[Problem 1] test:**

   - [Step to reproduce the original issue]
   - [Step to verify it's now fixed]

2. **[Problem 2] test:**
   - [Steps...]

### Edge Cases Verified

- [ ] Empty state handled
- [ ] Loading state handled
- [ ] Error state handled
- [ ] RTL layout verified (if UI changes)
- [ ] Logged-in vs guest behavior (if auth-related)

## Pre-Review Checklist

### Code Quality

- [ ] I have performed a **self-review** of my code (file by file)
- [ ] My code follows the project style guidelines
- [ ] No \`any\` types used (or justified if unavoidable)
- [ ] No unused code, imports, or dead code included

### Testing & Validation

- [ ] All tests pass locally (\`yarn test\`)
- [ ] Linting passes (\`yarn lint\`)
- [ ] Build succeeds (\`yarn build\`)

### Localization (if UI changes)

- [ ] All user-facing text uses \`next-translate\`
- [ ] RTL layout verified

## AI Assistance Disclosure

- [ ] AI tools were used, and I have **thoroughly reviewed and validated** all generated code
```

### 5. Create the PR

Ask the user to confirm the generated content, then:

```bash
gh pr create --base {TARGET_BRANCH} --title "{GENERATED_TITLE}" --body "{GENERATED_BODY}"
```

## Guidelines

### Important: No AI Attribution

**NEVER mention "Claude", "Claude Code", "AI", or any AI tool in:**

- PR titles
- PR descriptions/body
- Commit messages

The AI Assistance Disclosure checkbox in the template is sufficient.

### Title Format

Generate concise titles following conventional commits style:

- \`fix: resolve translation dropdown appearing on mode switch\`
- \`feat: add reading translation mode\`
- \`fix(QF-1234): resolve orphaned translation ID bug\`

### Writing Great Problem Descriptions

**Bad (too vague):**

> Problem: The dropdown was broken.

**Good (specific and contextual):**

> **Problem:** When a user selects a reading translation, then removes that translation from their
> selected translations list in settings, the UI would break or show unexpected behavior.
>
> **Root Cause:** The \`selectedReadingTranslation\` preference was stored independently from the
> \`selectedTranslations\` list. When the referenced translation was removed, the stored ID became
> "orphaned" — pointing to a translation that no longer exists in the user's selection.

### Writing Great Solution Descriptions

**Bad (just describes the code):**

> Added a new selector.

**Good (explains the approach and why):**

> **Validated Selector Pattern:** Created \`selectValidatedReadingTranslation\` — a new Redux
> selector that:
>
> - Returns the stored translation ID **only if** it exists in \`selectedTranslations\`
> - Falls back to the first selected translation if the stored value is invalid
> - Returns \`null\` if no translations are selected
>
> This ensures consumers always get a valid translation ID, preventing UI breaks from orphaned
> references.

### Test Plan Guidelines

Generate specific, actionable test steps that:

1. **Reproduce the original issue** (to verify it existed)
2. **Verify the fix works** (happy path)
3. **Test edge cases** (empty states, error states, boundaries)
4. **Test related functionality** (ensure no regressions)

### Section Omission

Remove these sections if not applicable:

- **Problems & Root Causes** - only if it's a trivial change (typo fix, simple addition)
- **Solution Approach** - only if the solution is self-evident from the diff
- **Breaking Changes** - if not a breaking change
- **Environment Variables** - if no new env vars

## Output

1. Display the generated PR title and body in markdown format
2. Ask the user to:
   - Review and edit the content
   - Confirm the target branch (default: \`production\`)
   - Confirm they want to create the PR
3. After confirmation, create the PR using \`gh pr create\`
4. Return the PR URL

## Example: Great PR Summary

Here's an example of a well-documented PR:

---

**Title:** \`fix(QF-4006): improve Reading Translation mode stability and RTL support\`

**Summary:**

> This PR fixes multiple stability and UX issues in the Reading Translation mode, focusing on
> orphaned translation state, RTL support, and proper localization.

**Problems & Root Causes:**

> ### 1. Orphaned Translation ID Bug
>
> **Problem:** When a user selects a reading translation, then later removes that translation from
> their selected translations list in settings, the UI would break.
>
> **Root Cause:** The \`selectedReadingTranslation\` preference was stored independently from the
> \`selectedTranslations\` list. When the referenced translation was removed, the stored ID became
> "orphaned."

**Solution Approach:**

> ### 1. Validated Selector Pattern
>
> Created \`selectValidatedReadingTranslation\` — a new Redux selector that returns the stored value
> only if it exists in \`selectedTranslations\`, otherwise falls back to the first selected
> translation.
>
> \`\`\`typescript export const selectValidatedReadingTranslation = (state: RootState): number |
> null => { const { selectedReadingTranslation } = state.readingPreferences; const {
> selectedTranslations } = state.translations; // ... validation logic }; \`\`\`

---

This level of documentation helps reviewers understand the context without needing to
reverse-engineer it from the diff.
