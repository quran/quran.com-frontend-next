---
description:
  Fetch a Jira ticket and recursively collect related tickets (sub-tickets and referenced keys)
---

# Skill: Fetch Jira Ticket (Recursive)

Fetches a Jira ticket (epic/story/task), its sub-tickets, and any **ticket keys mentioned in the
body** of any fetched ticket. This is recursive and continues until no new ticket keys are found.

## Inputs

- `TICKET_KEY` (e.g., `QF-3084`)

## Outputs

- A full set of ticket objects with:
  - key, id, summary, type, status
  - rendered description
  - list of discovered ticket keys (for traceability)

## Steps

### 1) Fetch the root ticket

// turbo

```bash
curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
  "https://quranfoundation.atlassian.net/rest/api/3/issue/${TICKET_KEY}?expand=renderedFields" | \
  jq '{key: .key, id: .id, summary: .fields.summary, type: .fields.issuetype.name, status: .fields.status.name, renderedDescription: .renderedFields.description}'
```

### 2) Find sub-issues (if epic or has children)

// turbo

```bash
curl -s -X POST -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
  -H "Content-Type: application/json" \
  "https://quranfoundation.atlassian.net/rest/api/3/search/jql" \
  -d '{"jql":"\"Epic Link\"='"${TICKET_KEY}"' OR parent='"${TICKET_KEY}"'","maxResults":100}' | \
  jq '.issues[] | {id: .id, key: .key}'
```

### 3) Fetch sub-issue details

// turbo For each issue ID:

```bash
curl -s -u "osama@quran.com:$(cat ~/.jira.d/.api_token)" \
  "https://quranfoundation.atlassian.net/rest/api/3/issue/ISSUE_ID?expand=renderedFields" | \
  jq '{key: .key, summary: .fields.summary, type: .fields.issuetype.name, status: .fields.status.name, renderedDescription: .renderedFields.description}'
```

### 4) Recursively fetch referenced tickets mentioned in the body

**Requirement:** If any ticket key (e.g., `QF-1234`) appears in the **rendered description** of any
fetched ticket, treat it like a sub-ticket and fetch it. Continue recursively.

**Algorithm (BFS/DFS):**

1. Initialize `queue = [TICKET_KEY]`, `visited = {}`.
2. While queue not empty:
   - Pop a key, fetch ticket (steps 1–3)
   - Extract referenced keys from `renderedDescription` using regex: `\bQF-\d+\b`
   - For each new key not in `visited`, add to queue
3. Stop when queue is empty.

**Notes:**

- Always de-duplicate keys across all fetched tickets.
- This should include references in root and sub-ticket descriptions.
- Keep a list of discovered keys for the final SPEC related tickets table.

---

## Key Discoveries

1. **Deprecated Jira API**: Use `/rest/api/3/search/jql` with POST instead of GET
   `/rest/api/3/search`.
