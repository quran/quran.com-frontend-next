---
description: Fetch Jira attachments for tickets (supports recursive fetching)
---

# Skill: Fetch Jira Attachments (Recursive)

Download attachments from Jira tickets. Supports recursive fetching from multiple tickets with
ticket-prefixed filenames.

## Inputs

- `TICKET_KEYS` - Array of ticket keys from recursive fetch
- Or single `TICKET_KEY` for non-recursive extraction
- `ROOT_TICKET` - The root ticket key for the spec directory

## Outputs

- Attachments saved to `docs/specs/ROOT_TICKET/images/` (or `/attachments/` for non-images)
- Filenames prefixed with ticket key: `{TICKET_KEY}-{original-filename}`

## Steps

### 1) Fetch attachments for a single ticket

```bash
TICKET_KEY="QF-3084"
ROOT_TICKET="QF-3084"
SPECS_DIR="docs/specs/${ROOT_TICKET}/images"
mkdir -p "${SPECS_DIR}"

# Get attachment list
ATTACHMENTS=$(curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
  "https://quranfoundation.atlassian.net/rest/api/3/issue/${TICKET_KEY}?fields=attachment" | \
  jq '.fields.attachment[] | {id, filename, mimeType}')

# Download each attachment with ticket prefix
echo "$ATTACHMENTS" | jq -c '.' | while read attachment; do
  ATTACHMENT_ID=$(echo "$attachment" | jq -r '.id')
  FILENAME=$(echo "$attachment" | jq -r '.filename')

  # Prefix with ticket key
  PREFIXED_FILENAME="${TICKET_KEY}-${FILENAME}"

  curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
    -o "${SPECS_DIR}/${PREFIXED_FILENAME}" \
    "https://quranfoundation.atlassian.net/rest/api/3/attachment/content/${ATTACHMENT_ID}"

  echo "Downloaded: ${SPECS_DIR}/${PREFIXED_FILENAME}"
done
```

### 2) Recursive fetch for multiple tickets

```bash
TICKET_KEYS=("QF-3084" "QF-3085" "QF-3086")
ROOT_TICKET="QF-3084"
SPECS_DIR="docs/specs/${ROOT_TICKET}/images"
mkdir -p "${SPECS_DIR}"

for TICKET_KEY in "${TICKET_KEYS[@]}"; do
  echo "Fetching attachments for ${TICKET_KEY}..."

  curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
    "https://quranfoundation.atlassian.net/rest/api/3/issue/${TICKET_KEY}?fields=attachment" | \
    jq -c '.fields.attachment[]' 2>/dev/null | while read attachment; do

    ATTACHMENT_ID=$(echo "$attachment" | jq -r '.id')
    FILENAME=$(echo "$attachment" | jq -r '.filename')

    # Prefix with ticket key for traceability
    PREFIXED_FILENAME="${TICKET_KEY}-${FILENAME}"

    curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
      -o "${SPECS_DIR}/${PREFIXED_FILENAME}" \
      "https://quranfoundation.atlassian.net/rest/api/3/attachment/content/${ATTACHMENT_ID}"

    echo "Downloaded: ${SPECS_DIR}/${PREFIXED_FILENAME}"
  done
done
```

---

## Naming Convention

Attachments are prefixed with their source ticket:

```
docs/specs/QF-3084/images/
├── QF-3084-mockup.png           # From root ticket
├── QF-3084-flow-diagram.png     # From root ticket
├── QF-3085-detail-view.png      # From sub-ticket
└── QF-3086-edge-case.png        # From referenced ticket
```
