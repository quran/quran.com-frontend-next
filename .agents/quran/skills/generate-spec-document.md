---
description: Compile tickets, designs, and rules into a single SPEC.md
---

# Skill: Generate Spec Document

Create the AI-readable specification document for a Jira ticket and its related artifacts.

## Output

- `docs/specs/QF-XXXX/SPEC.md`

## Directory structure

```
docs/specs/
└── QF-XXXX/
    ├── SPEC.md
    └── images/
```

## SPEC.md Template

````markdown
# [TICKET_KEY]: [Epic/Story Title]

## 📋 Overview

**Ticket:** [TICKET_KEY] **Type:** Epic/Story/Task **Status:** [Status] **Summary:** [One-line
description]

[Detailed description of the feature from Jira]

---

## 🎯 User Stories

### [CHILD_TICKET_KEY] - [Story Title]

**Status:** [Status] | **Type:** Story

**User Story:**

> As a [user type] I want to [action] So that [benefit]

**Acceptance Criteria:**

- [ ] Criterion 1
- [ ] Criterion 2

**Design Mockups:**

![Feature Design](./images/feature-name.png) _Caption: Description of what this design shows_

---

## 🔗 Related Tickets

| Ticket  | Summary | Type | Status | Relationship            |
| ------- | ------- | ---- | ------ | ----------------------- |
| QF-XXXX | Title   | Type | Status | Parent/Child/Referenced |

---

## 🎨 Design Reference

| File               | Description | Related Story |
| ------------------ | ----------- | ------------- |
| `feature-name.png` | Description | QF-XXXX       |

---

## 🏗️ Technical Considerations

### State Management

- [Key state management decisions]

### Data Structures

```typescript
interface ExampleType {
  field: string;
}
```

### API Endpoints

- `GET /api/endpoint` - Description
- `POST /api/endpoint` - Description

### Entry Points

1. Entry point 1 - description
2. Entry point 2 - description

---

## 📝 Implementation Notes

- [Key implementation note 1]
- [Key implementation note 2]

---

## ✅ Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Integration tests for critical flows
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Localization strings added
- [ ] Accessibility verified
- [ ] RTL support verified
````
