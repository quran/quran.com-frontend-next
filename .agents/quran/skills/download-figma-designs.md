---
description: Export Figma nodes and download design images
---

# Skill: Download Figma Designs (Recursive)

Download design images from Figma for inclusion in specs. Supports batch downloading of multiple
nodes in a single API call for efficiency.

## Critical Notes

1. **Node ID format differs**: URLs use dashes (`14088-232378`), API uses colons (`14088:232378`)
2. **Batch API calls**: Collect all node IDs first, then make ONE images API call (more efficient)
3. **Fish shell limitation**: Fish doesn't support heredocs - use bash for complex scripts
4. **Recommended naming**: `{node-name}-{node-id}.png` for uniqueness and traceability

## Inputs

- `FIGMA_URLS` - Array of Figma URLs with node IDs
- `FILE_KEY` - Figma file key (usually `RgJTH4su68l8K54RMzdnhR` for Quran.com)
- `ROOT_TICKET` - The root ticket key for the spec directory

## Outputs

- Images saved to `docs/specs/ROOT_TICKET_KEY/images/`
- Filenames: `{node-name}-{node-id}.png` (e.g., `frame-3643-14088-232378.png`)

## Steps

### 1) Parse file key and node ID from a Figma URL

```bash
URL="https://www.figma.com/design/RgJTH4su68l8K54RMzdnhR/Quran.com?node-id=14088-232378&t=TOKEN"
FILE_KEY=$(echo "$URL" | sed -n 's|.*design/\([^/]*\)/.*|\1|p')
NODE_ID=$(echo "$URL" | sed -n 's|.*node-id=\([^&]*\).*|\1|p')

# IMPORTANT: Convert dash to colon for API calls
NODE_ID_API=$(echo "$NODE_ID" | tr '-' ':')
```

### 2) Batch download (RECOMMENDED - most efficient)

Collect all unique node IDs first, then make one API call:

```bash
ROOT_TICKET="QF-3084"
SPECS_DIR="docs/specs/${ROOT_TICKET}/images"
mkdir -p "${SPECS_DIR}"
FILE_KEY="RgJTH4su68l8K54RMzdnhR"

# Collect all node IDs (comma-separated, using colons for API)
# Example: "14088:232378,14088:233793,11973:120478"
NODE_IDS="14088:232378,14088:233793,11973:120478"

# Fetch ALL image URLs in one API call
IMAGES_JSON=$(curl -s -H "X-Figma-Token: $(cat ~/.figma_token)" \
  "https://api.figma.com/v1/images/${FILE_KEY}?ids=${NODE_IDS}&format=png&scale=2")

# Fetch node metadata for naming (also batch)
NODES_JSON=$(curl -s -H "X-Figma-Token: $(cat ~/.figma_token)" \
  "https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${NODE_IDS}")

# Download each image with descriptive naming
echo "$IMAGES_JSON" | jq -r '.images | to_entries[] | "\(.key) \(.value)"' | while read -r node_id url; do
  [ -z "$url" ] || [ "$url" = "null" ] && continue

  # Get node name, sanitize for filename
  node_name=$(echo "$NODES_JSON" | jq -r --arg id "$node_id" \
    '.nodes[$id].document.name // "unnamed"' | \
    tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

  # Convert node_id colons to dashes for filename
  node_id_safe=$(echo "$node_id" | tr ':' '-')

  # Final filename: {node-name}-{node-id}.png
  filename="${node_name}-${node_id_safe}.png"

  curl -s -o "${SPECS_DIR}/${filename}" "$url"
  echo "Downloaded: ${filename}"
done
```

### 3) Full bash script for extracting from URLs

```bash
#!/bin/bash
# Usage: ./download-figma.sh "QF-3084" "url1" "url2" "url3" ...

ROOT_TICKET="$1"
shift
URLS=("$@")

SPECS_DIR="docs/specs/${ROOT_TICKET}/images"
mkdir -p "${SPECS_DIR}"

# Extract file key from first URL
FILE_KEY=$(echo "${URLS[0]}" | sed -n 's|.*design/\([^/]*\)/.*|\1|p')

# Collect all node IDs (convert dashes to colons)
NODE_IDS=""
for url in "${URLS[@]}"; do
  node_id=$(echo "$url" | sed -n 's|.*node-id=\([^&]*\).*|\1|p' | tr '-' ':')
  [ -n "$node_id" ] && NODE_IDS="${NODE_IDS:+$NODE_IDS,}$node_id"
done

echo "File key: $FILE_KEY"
echo "Node IDs: $NODE_IDS"

# Fetch images and metadata in batch
IMAGES_JSON=$(curl -s -H "X-Figma-Token: $(cat ~/.figma_token)" \
  "https://api.figma.com/v1/images/${FILE_KEY}?ids=${NODE_IDS}&format=png&scale=2")

NODES_JSON=$(curl -s -H "X-Figma-Token: $(cat ~/.figma_token)" \
  "https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${NODE_IDS}")

# Download each
echo "$IMAGES_JSON" | jq -r '.images | to_entries[] | "\(.key) \(.value)"' | while read -r node_id url; do
  [ -z "$url" ] || [ "$url" = "null" ] && continue

  node_name=$(echo "$NODES_JSON" | jq -r --arg id "$node_id" \
    '.nodes[$id].document.name // "unnamed"' | \
    tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

  node_id_safe=$(echo "$node_id" | tr ':' '-')
  filename="${node_name}-${node_id_safe}.png"

  curl -s -o "${SPECS_DIR}/${filename}" "$url"
  echo "Downloaded: ${filename}"
done
```

---

## Naming Convention

Images are named with node name and ID for uniqueness:

```
docs/specs/QF-3084/images/
├── frame-3643-14088-232378.png       # Frame "Frame 3643" with node ID 14088:232378
├── frame-3645-14088-232379.png       # Frame "Frame 3645" with node ID 14088:232379
├── no-basmallah-11973-120478.png     # Frame "No Basmallah" with node ID 11973:120478
├── pinned-bar-14088-233793.png       # Frame "Pinned Bar" with node ID 14088:233793
└── mobile-view-14175-327800.png      # Frame "Mobile View" with node ID 14175:327800
```

**Why this naming?**

- Node name provides human-readable context
- Node ID ensures uniqueness (multiple frames can have similar names)
- Easy to trace back to Figma (search for node ID)

---

## Integration Notes

1. This skill expects Figma URLs from `extract-figma-links` skill
2. All images go into the **root ticket's** spec directory
3. **Batch API calls** - collect all node IDs, make ONE request (faster, fewer API calls)
4. Node names are sanitized (lowercase, hyphens, alphanumeric only)
5. **Always convert node ID format**: URLs use dashes, API uses colons
