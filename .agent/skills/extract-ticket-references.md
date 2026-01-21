---
description: Extract ticket keys from Jira descriptions
---

# Skill: Extract Ticket References

Extract Jira ticket keys from a rendered description.

## Input

- `renderedDescription` HTML

## Output

- Unique list of keys (e.g., `QF-1234`)

## Regex

- `\bQF-\d+\b`

## Notes

- Run on all fetched tickets to find referenced tickets recursively.
- De-duplicate across all results before fetching.
