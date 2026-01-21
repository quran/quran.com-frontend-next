---
description: Extract Figma embed URLs from Jira issue properties (supports recursive extraction)
---

# Skill: Extract Figma Links (Recursive)

Extract Figma embed URLs stored in Jira issue properties (AppsPlus Embed app) for a ticket and all
its related tickets (sub-tickets and referenced tickets).

## Critical Notes

1. **Figma links are NOT in the ticket description** - they're stored in Jira issue properties
2. **Property keys vary** - use `appsplusEmbedTabs:0`, `appsplusEmbedTabs:1`, etc.
3. **Fish shell limitation** - Fish doesn't support heredocs, use bash for complex scripts
4. **Always list properties first** - to discover which embed keys exist

## Inputs

- `TICKET_KEYS` - Array of ticket keys from recursive fetch (e.g., `QF-3084`, `QF-3085`, ...)
- Or single `TICKET_KEY` for non-recursive extraction

## Outputs

- Map of `{ ticketKey: [figmaUrls] }` for traceability
- Used by `download-figma-designs` skill to name files with ticket prefixes

## Steps

### 0) List available property keys (recommended first step)

```bash
TICKET_KEY="QF-3084"

# First, list all property keys to see what's available
curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
  "https://quranfoundation.atlassian.net/rest/api/3/issue/${TICKET_KEY}/properties" | \
  jq '.keys[].key'
```

This reveals keys like:

- `appsplusEmbedTabs:0`
- `appsplusEmbedTabs:1`
- `appsplus-figma-jira_appsplus-figma-panel`

### 1) Extract Figma links for a single ticket

```bash
TICKET_KEY="QF-3084"

# Get issue ID (needed for properties endpoint)
ISSUE_ID=$(curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
  "https://quranfoundation.atlassian.net/rest/api/3/issue/${TICKET_KEY}" | jq -r '.id')

# Pull embed URLs - check multiple possible property indices
FIGMA_URLS=$(for i in 0 1 2 3 4; do
  curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
    "https://quranfoundation.atlassian.net/rest/api/3/issue/${ISSUE_ID}/properties/appsplusEmbedTabs:${i}" 2>/dev/null | \
    jq -r '.. | strings | select(startswith("https://www.figma.com"))' 2>/dev/null
done | sort -u)

echo "{\"ticket\": \"${TICKET_KEY}\", \"urls\": $(echo "$FIGMA_URLS" | jq -R -s 'split("\n") | map(select(length > 0))')}"
```

### 2) Recursive extraction for multiple tickets

Given an array of ticket keys from `fetch-jira-ticket` skill:

**Fish shell:**

```fish
# Input: TICKET_KEYS array from recursive ticket fetch
set TICKET_KEYS QF-3084 QF-3085 QF-3086

for TICKET_KEY in $TICKET_KEYS
  set ISSUE_ID (curl -s -u "osama@quran.com:(cat ~/.jira.d/.api_token)" \
    "https://quranfoundation.atlassian.net/rest/api/3/issue/$TICKET_KEY" | jq -r '.id')

  echo "=== $TICKET_KEY ==="
  for i in 0 1 2 3 4
    curl -s -u "osama@quran.com:(cat ~/.jira.d/.api_token)" \
      "https://quranfoundation.atlassian.net/rest/api/3/issue/$ISSUE_ID/properties/appsplusEmbedTabs:$i" 2>/dev/null | \
      jq -r '.. | strings | select(startswith("https://www.figma.com"))' 2>/dev/null
  end | sort -u
end
```

**Bash:**

```bash
# Input: TICKET_KEYS array from recursive ticket fetch
TICKET_KEYS=("QF-3084" "QF-3085" "QF-3086")

# Output file to collect all Figma links with ticket mapping
OUTPUT_FILE="/tmp/figma_links_map.json"
echo "[" > "$OUTPUT_FILE"

FIRST=true
for TICKET_KEY in "${TICKET_KEYS[@]}"; do
  ISSUE_ID=$(curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
    "https://quranfoundation.atlassian.net/rest/api/3/issue/${TICKET_KEY}" | jq -r '.id')

  FIGMA_URLS=$(for i in 0 1 2 3 4; do
    curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
      "https://quranfoundation.atlassian.net/rest/api/3/issue/${ISSUE_ID}/properties/appsplusEmbedTabs:${i}" 2>/dev/null | \
      jq -r '.. | strings | select(startswith("https://www.figma.com"))' 2>/dev/null
  done | sort -u | jq -R -s 'split("\n") | map(select(length > 0))')

  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    echo "," >> "$OUTPUT_FILE"
  fi

  echo "{\"ticket\": \"${TICKET_KEY}\", \"urls\": ${FIGMA_URLS}}" >> "$OUTPUT_FILE"
done

echo "]" >> "$OUTPUT_FILE"
cat "$OUTPUT_FILE"
```

### 3) Output format

The output is a JSON array mapping tickets to their Figma URLs:

```json
[
  {
    "ticket": "QF-3084",
    "urls": [
      "https://www.figma.com/design/RgJTH4su68l8K54RMzdnhR/Quran.com?node-id=14088-232378",
      "https://www.figma.com/design/RgJTH4su68l8K54RMzdnhR/Quran.com?node-id=14088-233793"
    ]
  },
  {
    "ticket": "QF-3085",
    "urls": ["https://www.figma.com/design/RgJTH4su68l8K54RMzdnhR/Quran.com?node-id=15000-100000"]
  }
]
```

---

## Integration with fetch-jira-ticket

This skill should be called **after** `fetch-jira-ticket` completes its recursive fetch. The ticket
keys from the visited set should be passed to this skill.

```bash
# After fetch-jira-ticket completes:
# VISITED_TICKETS contains all discovered ticket keys
TICKET_KEYS=("${!VISITED_TICKETS[@]}")
# Then run the recursive extraction above
```

---

## Key Discovery

Figma embeds are stored in Jira issue properties under `appsplusEmbedTabs:X`.
