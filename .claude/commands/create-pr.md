# Create Pull Request

Create a PR using the project template with auto-filled sections based on branch changes.

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

# Get the diff
git diff production...HEAD --stat

# Get detailed changes
git diff production...HEAD
```

### 2. Analyze the Changes

Based on the diff:

- Identify the type of change (bug fix, feature, refactor, docs, breaking change)
- Summarize what the PR does
- Identify affected components/files
- Detect any new environment variables
- Check for potential breaking changes
- Identify edge cases that need testing

### 3. Extract Ticket Number

- Look for ticket references in branch name (e.g., `QF-1234`, `feature/QF-1234-description`)
- Look for ticket references in commit messages
- If no ticket found, leave as `QF-XXXX` placeholder

### 4. Generate PR Content

Use this template structure from `.github/pull_request_template.md`:

```markdown
## Summary

<!-- Auto-generated based on diff analysis -->

[Brief description of what this PR does]

Closes: [QF-XXXX](https://quranfoundation.atlassian.net/browse/QF-XXXX)

## Type of Change

<!-- Check the appropriate box based on analysis -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as
      expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Scope Confirmation

- [ ] This PR addresses **one** feature/fix only
- [ ] If multiple changes were needed, they are split into separate PRs

## Test Plan

<!-- Auto-generated based on what changed -->

- [ ] Manual testing performed

**Testing steps:**

1. [Generated based on changes]
2. [Generated based on changes]

### Edge Cases Verified

<!-- Check applicable items based on what the code does -->

- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Logged-in vs guest behavior (if applicable)

## Pre-Review Checklist

### Code Quality

- [ ] I have performed a **self-review** of my code (file by file)
- [ ] My code follows the project style guidelines
- [ ] No `any` types used (or justified if unavoidable)
- [ ] No unused code, imports, or dead code included

### Testing & Validation

- [ ] All tests pass locally (`yarn test`)
- [ ] Linting passes (`yarn lint`)
- [ ] Build succeeds (`yarn build`)

### Localization (if UI changes)

- [ ] All user-facing text uses `next-translate`
- [ ] RTL layout verified

### Accessibility (if UI changes)

- [ ] Semantic HTML elements used
- [ ] Keyboard navigation works

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

The AI Assistance Disclosure checkbox in the template is sufficient. Do not add any other references
to AI assistance.

### Title Format

Generate concise titles following conventional commits style:

- `fix: resolve translation dropdown appearing on mode switch`
- `feat: add reading translation mode`
- `refactor: simplify audio player state management`
- `docs: update README with new setup instructions`

Include ticket number if found: `fix(QF-1234): resolve translation dropdown issue`

### Summary Guidelines

- Keep it to 1-3 sentences
- Focus on the "what" and "why", not the "how"
- Be specific about user-facing changes

### Test Plan Guidelines

Generate specific, actionable test steps based on:

- Components modified (test their functionality)
- State changes (test loading, error, empty states)
- UI changes (test themes, RTL, responsive)
- New features (test happy path and edge cases)

### Section Omission

Remove these sections if not applicable:

- **If Breaking Change** - if not a breaking change
- **Environment Variables** - if no new env vars
- **Screenshots/Videos** - if no UI changes (but include if UI changed)
- **Related PRs** - if no related PRs
- **Rollback Safety special steps** - if straightforward rollback

## Output

1. Display the generated PR title and body in markdown format
2. Ask the user to:
   - Review and edit the content
   - Confirm the target branch (default: `production`)
   - Confirm they want to create the PR
3. After confirmation, create the PR using `gh pr create`
4. Return the PR URL
