## Summary

<!-- Brief description of what this PR does -->

Closes: [QF-XXXX](https://quranfoundation.atlassian.net/browse/QF-XXXX)

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as
      expected)
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring (no functional changes)

## Environment Variables

<!-- List any new environment variables introduced. Remove this section if not applicable. -->

| Variable      | Description      | Required |
| ------------- | ---------------- | -------- |
| `EXAMPLE_VAR` | Description here | Yes/No   |

## Test Plan

<!-- Describe how this PR has been tested -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

**Testing steps:**

1. Step one
2. Step two

## Pre-Review Checklist

<!-- Complete ALL items before requesting review. Ready for review = Ready to release! -->

### Code Quality

- [ ] I have performed a **self-review** of my code (file by file)
- [ ] My code follows the [project style guidelines](/.github/copilot-instructions.md)
- [ ] No `any` types used (or justified if unavoidable)
- [ ] No unused code, imports, or dead code included
- [ ] Complex logic has inline comments explaining "why"
- [ ] Functions are under 30 lines and follow single responsibility

### Testing & Validation

- [ ] All tests pass locally (`yarn test`)
- [ ] Linting passes (`yarn lint`)
- [ ] Build succeeds (`yarn build`)
- [ ] Edge cases and error scenarios are handled

### Documentation

- [ ] Code is self-documenting with clear naming
- [ ] README updated (if adding features or setup changes)
- [ ] Inline comments added for complex logic

### Localization (if UI changes)

- [ ] All user-facing text uses `next-translate`
- [ ] Only English locale files modified (Lokalise handles others)
- [ ] RTL layout verified

### Accessibility (if UI changes)

- [ ] Semantic HTML elements used
- [ ] ARIA attributes added where needed
- [ ] Keyboard navigation works

## Screenshots/Videos

<!-- Add screenshots or videos for UI changes. Remove if not applicable. -->

| Before | After |
| ------ | ----- |
|        |       |

## Related PRs

<!-- Link any related PRs here. Remove if not applicable. -->

## AI Assistance Disclosure

<!-- If AI tools were used, confirm you have reviewed and understand all generated code -->

- [ ] AI tools were NOT used for this PR
- [ ] AI tools were used, and I have **thoroughly reviewed and validated** all generated code
