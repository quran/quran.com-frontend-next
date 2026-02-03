---
description: Parse Figma URLs into file key and node id
---

# Skill: Parse Figma URLs

## ⚠️ Critical: Node ID Format Conversion

**URLs use dashes, API uses colons!**

- URL format: `node-id=14088-232378`
- API format: `ids=14088:232378`

## Parsing Examples

```bash
URL="https://www.figma.com/design/RgJTH4su68l8K54RMzdnhR/Quran.com?node-id=14088-232378&t=TOKEN"

# Extract file key
FILE_KEY=$(echo "$URL" | sed -n 's|.*design/\([^/]*\)/.*|\1|p')
# Result: RgJTH4su68l8K54RMzdnhR

# Extract node ID (as-is from URL, with dashes)
NODE_ID_URL=$(echo "$URL" | sed -n 's|.*node-id=\([^&]*\).*|\1|p')
# Result: 14088-232378

# Convert to API format (colons)
NODE_ID_API=$(echo "$NODE_ID_URL" | tr '-' ':')
# Result: 14088:232378
```

## Batch Conversion

When collecting multiple node IDs for a batch API call:

```bash
# Comma-separated for API
NODE_IDS="14088:232378,14088:233793,11973:120478"

# Use in Figma API
curl -H "X-Figma-Token: $(cat ~/.figma_token)" \
  "https://api.figma.com/v1/images/${FILE_KEY}?ids=${NODE_IDS}&format=png&scale=2"
```

## Common Quran.com Figma File

The main Quran.com design file key is: `RgJTH4su68l8K54RMzdnhR`
