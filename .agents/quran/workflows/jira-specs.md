---
description: Fetch Jira ticket specs and compile into a consolidated product specification document
---

# Jira Ticket Specs Workflow

This workflow has been refactored into reusable **skills** plus a small set of **composed
workflows**. Use the workflows for end-to-end runs and the skills for targeted tasks.

## Critical Notes (Lessons Learned)

1. **Figma links are in Jira issue PROPERTIES** - Not in description! Check `appsplusEmbedTabs:X`
2. **Fish shell limitations** - Doesn't support heredocs `<<`, use bash for complex scripts
3. **Node ID format conversion** - URLs use dashes (`14088-232378`), Figma API uses colons
   (`14088:232378`)
4. **Batch API calls** - Collect all Figma node IDs, make ONE images API call for efficiency
5. **List issue properties first** - Run `/rest/api/3/issue/{key}/properties` to discover embed keys

## Workflows

- `jira-to-spec` → Full end-to-end run (recommended)
- `update-designs` → Refresh Figma images only (recursive)
- `sync-ticket` → Re-fetch tickets and regenerate SPEC

## Quick Start

1. Run `jira-to-spec`
2. Provide the root `TICKET_KEY` (e.g., `QF-3084`)
3. The workflow will:
   - Recursively fetch sub-tickets **and** ticket keys mentioned in descriptions
   - Pull Figma embeds from issue properties (not description!) for **all** discovered tickets
   - Export designs with **node-name + node-id filenames** for traceability
   - Generate `docs/specs/QF-XXXX/SPEC.md`

## Inputs & Outputs

**Inputs**

- `TICKET_KEY` (required)
- Jira API token at `~/.jira.d/.api_token`
- Figma token at `~/.figma_token`

**Outputs**

- `docs/specs/QF-XXXX/SPEC.md`
- `docs/specs/QF-XXXX/images/*` (named as `{node-name}-{node-id}.png`)

## Image Naming Convention

All images are named with Figma node name and ID for uniqueness:

```
docs/specs/QF-3084/images/
├── frame-3643-14088-232378.png       # "Frame 3643" from Figma
├── pinned-bar-14088-233793.png       # "Pinned Bar" design
├── no-basmallah-11973-120478.png     # "No Basmallah" variant
└── mobile-view-14175-327800.png      # "Mobile View" frame
```

This makes it easy to trace images back to Figma (search by node ID).

## Skills

- `setup-jira-and-figma`
- `fetch-jira-ticket` (recursive)
- `extract-ticket-references`
- `compile-related-tickets`
- `extract-figma-links` (recursive, with ticket mapping)
- `parse-figma-urls`
- `download-figma-designs` (recursive, ticket-prefixed naming)
- `fetch-jira-attachments` (recursive, ticket-prefixed naming)
- `generate-spec-document`

## Critical Behavior (Recursive Ticket Fetching)

If any ticket key is mentioned in the **rendered description** of a fetched ticket, it must be
fetched recursively and treated like a sub-ticket. This continues until no new keys are discovered.

**Regex:** `\bQF-\d+\b`

**Loop guard:** Always de-duplicate keys and track a `visited` set to prevent cycles.

## Critical Behavior (Recursive Design Fetching)

Figma embeds and attachments are fetched from **all** discovered tickets, not just the root ticket.
This ensures the spec includes all relevant designs from:

- The root ticket
- Sub-tickets (epics/children)
- Referenced tickets (mentioned in descriptions)

## Where the details live

- Skills are in `.agent/skills/`
- Workflows are in `.agent/workflows/`
