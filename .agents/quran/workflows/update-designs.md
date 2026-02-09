---
description: Refresh Figma images for an existing SPEC (recursive)
---

# Update Designs Workflow

Refreshes Figma images for an existing spec, fetching designs from all related tickets.

## Critical Notes

1. **Figma links are in Jira issue properties** - Check `appsplusEmbedTabs:X` keys
2. **Convert node ID format** - URLs use dashes, API uses colons
3. **Batch API calls** - Collect all node IDs, make ONE Figma images API call

## Flow

1. **Fetch tickets recursively** (`fetch-jira-ticket`)
   - Collects all ticket keys (root, sub-tickets, referenced)
2. **Extract Figma embeds recursively** (`extract-figma-links`)
   - ⚠️ Check issue PROPERTIES, not description
   - Endpoint: `/rest/api/3/issue/{id}/properties/appsplusEmbedTabs:0`
   - Output: JSON map with ticket-to-URLs mapping
3. **Parse URLs** (`parse-figma-urls`)
   - Convert node IDs from dash to colon format
4. **Batch download designs** (`download-figma-designs`)
   - Collect ALL node IDs first
   - Make ONE Figma images API call
   - Filenames: `{node-name}-{node-id}.png`

## Usage

```bash
# Input
ROOT_TICKET="QF-3084"

# This workflow will:
# 1. Find all related tickets (QF-3084, QF-3085, QF-3086, etc.)
# 2. Extract Figma links from issue PROPERTIES (appsplusEmbedTabs:X)
# 3. Download all designs to docs/specs/QF-3084/images/
# 4. Name files as {node-name}-{node-id}.png
```

## Output Structure

```
docs/specs/QF-3084/images/
├── frame-3643-14088-232378.png       # "Frame 3643" from Figma
├── pinned-bar-14088-233793.png       # "Pinned Bar" design
├── no-basmallah-11973-120478.png     # "No Basmallah" variant
└── mobile-view-14175-327800.png      # "Mobile View" frame
```
