---
description: End-to-end workflow to generate a full SPEC.md from a Jira ticket
---

# Jira → SPEC Workflow

## Critical Notes (Lessons Learned)

1. **Figma links are in Jira issue PROPERTIES, not description** - Use `appsplusEmbedTabs:X` keys
2. **Fish shell doesn't support heredocs** - Use bash for complex multi-line scripts
3. **Node ID format differs** - URLs use dashes (`14088-232378`), Figma API uses colons
   (`14088:232378`)
4. **Batch Figma API calls** - Collect all node IDs first, make ONE images API call
5. **Always list issue properties first** - To discover which embed keys exist

## Uses Skills

- `setup-jira-and-figma`
- `fetch-jira-ticket`
- `extract-ticket-references`
- `compile-related-tickets`
- `extract-figma-links` (recursive) ⚠️ **Figma links are in issue properties, not description!**
- `parse-figma-urls`
- `download-figma-designs` (batch download recommended)
- `fetch-jira-attachments` (recursive)
- `generate-spec-document`

## Flow

1. **Setup auth** (`setup-jira-and-figma`)
2. **Fetch ticket recursively** (`fetch-jira-ticket`) with body references included
   - Output: `VISITED_TICKETS` set containing all discovered ticket keys
3. **Extract and normalize related tickets** (`extract-ticket-references`,
   `compile-related-tickets`)
4. **Collect Figma embeds recursively** (`extract-figma-links`)
   - ⚠️ **Check issue properties** (`/rest/api/3/issue/{id}/properties/appsplusEmbedTabs:0`)
   - Input: All ticket keys from `VISITED_TICKETS`
   - Output: JSON map of `{ ticket: key, urls: [...] }` for each ticket
5. **Parse Figma URLs** (`parse-figma-urls`)
   - Convert node IDs from dash format to colon format for API
6. **Batch download designs** (`download-figma-designs`)
   - Collect ALL node IDs first, make ONE Figma images API call
   - Filenames: `{node-name}-{node-id}.png`
7. **Fetch attachments** (`fetch-jira-attachments`)
   - Processes all tickets from `VISITED_TICKETS`
8. **Generate SPEC.md** (`generate-spec-document`)
   - Update image references to match actual downloaded filenames

## Image Naming Convention

Images are named with Figma node name and ID for uniqueness and traceability:

```
docs/specs/QF-3084/images/
├── frame-3643-14088-232378.png       # "Frame 3643" from Figma
├── pinned-bar-14088-233793.png       # "Pinned Bar" frame
├── no-basmallah-11973-120478.png     # "No Basmallah" frame
└── mobile-view-14175-327800.png      # "Mobile View" frame
```

**Why this naming?** Node name is human-readable, node ID ensures uniqueness and traceability.
