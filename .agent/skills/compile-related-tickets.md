---
description: Normalize and de-duplicate related ticket list for the spec
---

# Skill: Compile Related Tickets

Normalize the related tickets list for the spec table by merging:

- Sub-tickets (epics/parent)
- References found in ticket bodies
- Linked issues (if present)

## Rules

- De-duplicate by key
- Capture relationship type: `Parent`, `Child`, or `Referenced`
- Always include the root ticket

## Output

- A single table-ready list of related tickets
