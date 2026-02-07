# Pre-PR Code Review

Run an AI code review before opening a PR.

## Quick Commands

| IDE          | Command                             |
| ------------ | ----------------------------------- |
| **VS Code**  | Open Copilot Chat -> Type `/review` |
| **Cursor**   | Open Chat (Cmd+L) -> Type `/review` |
| **Windsurf** | Open Cascade -> Type `/review`      |

## Alternative: VS Code Task

All IDEs support VS Code tasks:

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "Tasks: Run Task"
3. Select **"Pre-PR Review"** (staged changes) or **"Pre-PR Review (All Changes)"**

## How It Works

Canonical prompt sources live in `.agents/quran/prompts/`. Compatibility symlinks expose the same
prompt at tool-specific paths:

- VS Code: `.github/prompts/review.prompt.md`
- Cursor: `.cursor/prompts/review.prompt.md`
- Windsurf: `.windsurf/prompts/review.prompt.md`

Project rules are applied from canonical standards and linked into:

- `.cursor/rules/`
- `.windsurf/rules/`

---

## Manual Prompt (for other AI tools)

```text
You are a code reviewer for the Quran.com frontend project. Review my changes against our project guidelines before I open a PR.

## Project Context
- Next.js application with Pages Router
- TypeScript with strict mode
- SCSS modules for styling
- next-translate for i18n
- useSWR for data fetching
- Radix UI for accessible components

## Review Checklist

### TypeScript
- [ ] No `any` types (use `unknown` or specific types)
- [ ] Explicit return types on exported functions
- [ ] Interfaces for object shapes, types for unions
- [ ] Enums for repeated categorical values

### React Components
- [ ] Functional components only
- [ ] Props interface defined
- [ ] Proper memoization (useCallback, useMemo)
- [ ] No unnecessary useEffect
- [ ] Skeleton loaders for async data

### Code Quality
- [ ] Functions under 30 lines
- [ ] No duplicated code (DRY)
- [ ] Proper error handling with fallbacks
- [ ] No unused imports/variables
- [ ] Comments explain "why" not "what"

### API & Data
- [ ] Using useSWR for data fetching
- [ ] Error states handled
- [ ] Fallbacks for API responses
- [ ] Optimistic updates where appropriate

### Localization
- [ ] All text uses next-translate (t('key'))
- [ ] No hardcoded user-facing strings
- [ ] RTL-safe CSS (logical properties)

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation works

### Security
- [ ] No hardcoded secrets
- [ ] Environment variables for config
- [ ] Input validation present

### Testing
- [ ] Tests for new functionality
- [ ] Edge cases covered
- [ ] Error scenarios tested

## My Changes
[DESCRIBE YOUR CHANGES HERE]

## Files Changed
[PASTE YOUR DIFF OR LIST FILES]

---

Please review and provide:
1. **Critical Issues** - Must fix before PR
2. **Suggestions** - Improvements to consider
3. **Positive Feedback** - What's done well

Format issues with file paths and line numbers when possible.
```

---

## Quick Terminal Command

Add this alias to your shell config for quick reviews:

```bash
# Fish shell (~/.config/fish/config.fish)
alias prereview="git diff --staged | pbcopy && echo 'Staged changes copied. Paste into AI chat with the review prompt.'"

# Bash/Zsh (~/.bashrc or ~/.zshrc)
alias prereview="git diff --staged | pbcopy && echo 'Staged changes copied. Paste into AI chat with the review prompt.'"
```

Then run `prereview` before opening a PR to copy your staged changes.
