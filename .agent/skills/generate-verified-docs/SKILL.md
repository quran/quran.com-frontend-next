---
name: generate-verified-docs
description:
  Generates audit-grade, hallucination-free documentation from codebase features with full
  traceability. Use when documenting features, creating technical specs, or generating verified
  documentation with code references.
---

# Verified Documentation Generator

Generate audit-grade documentation from a codebase feature with full traceability and zero
hallucination.

## Arguments

`$ARGUMENTS` should be:

- Feature name and description (e.g., "User Registration", "Bookmark System", "Reading Progress")

## Prerequisites

- Clear feature name and description from user
- Access to the codebase root directory

## Hard Rules

- ❌ No assumptions or inferred behavior
- ❌ No undocumented states or transitions
- ✅ Every claim must link to file:line
- ✅ Unknowns must be explicitly reported
- ✅ Halt if verification fails

---

## Stage 1: Scope Resolution

**Goal**: Define feature boundaries and reject ambiguous scopes.

1. Parse the feature description to identify expected entry points (API routes, UI components, CLI
   commands)
2. Search codebase for matching routes, exported functions/classes, and test files
3. Validate at least one concrete code location exists

**Gate**:

- If no code locations found → HALT with failure report
- If scope is ambiguous → Ask user to narrow scope
- If confirmed → Proceed with `entry_point_candidates` list

**Output**: `scope_definition`, `entry_point_candidates`, `scope_confidence`

---

## Stage 2: Codebase Discovery

**Goal**: Map all code artifacts related to the feature.

1. Verify each entry point exists and classify as: `API` | `UI` | `JOB` | `EVENT` | `CLI`
2. Trace dependencies (imports, injected dependencies, runtime-resolved modules)
3. Build dependency graph (DAG)
4. Classify artifacts: Controllers, Services, Repositories, Models, Utils, External
5. Extract data models with types, relationships, and validation rules

**Gate**:

- Every entry point must be verifiable (`file_exists`, `line_exists`, `callable`)
- If no verifiable entry points → HALT

**Output**: `entry_points`, `dependency_graph`, `artifacts_by_type`, `data_models`,
`external_integrations`, `discovery_gaps`

---

## Stage 3: Execution Flow Tracing

**Goal**: Trace complete execution paths from entry to exit.

1. **Synchronous paths**: Follow function call chains, record decision branches, track variable
   transformations
2. **Async boundaries**: Identify Promise/async-await, event emitters, message queues, webhooks
3. **Side effects**: Catalog DATABASE_WRITE, DATABASE_READ, EXTERNAL_CALL, FILE_SYSTEM, CACHE_OP,
   EVENT_EMIT, LOGGING
4. **Flow enumeration**: Build all paths, tag as `HAPPY_PATH` | `ERROR_PATH` | `EDGE_CASE`

**Gate**:

- Every flow step must have a code reference
- If coverage below threshold → Ask user to accept partial or HALT

**Output**: `execution_flows`, `async_boundaries`, `side_effects`, `flow_coverage`,
`untraced_branches`

---

## Stage 4: State & Transition Extraction

**Goal**: Extract explicit state machines; reject inferred states.

1. Search for status/state enums, FSM patterns, status columns in schemas
2. Map transitions: `STATE_A --[condition]--> STATE_B @ file:line`
3. Verify each state value exists in code (enum, constant, or literal)
4. Identify orphan states (no inbound) and terminal states (no outbound)

**Gate**:

- Every state must have a code reference
- Every transition must link verified states
- If undocumented states found → HALT with failure report

**Output**: `states`, `transitions`, `state_machine`, `orphan_states`, `terminal_states`

---

## Stage 5: Failure & Edge Case Analysis

**Goal**: Identify error handling coverage and missing failure modes.

1. Locate try/catch blocks, error callbacks, error boundaries, middleware handlers
2. Trace exception propagation paths
3. Detect edge cases: NULL_INPUT, EMPTY_ARRAY, BOUNDARY_VALUES, PERMISSION, TIMEOUT, CONFLICT
4. Score risk: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

**No hard gate** – outputs are informational.

**Output**: `handled_failures`, `unhandled_failures`, `silent_failures`, `edge_cases`, `risk_areas`

---

## Stage 6: Diagram Generation

**Goal**: Produce diagrams strictly matching verified flows.

1. Generate **State Diagram** (Mermaid stateDiagram-v2) from `state_machine`
2. Generate **Sequence Diagrams** (Mermaid sequenceDiagram) from `execution_flows`
3. Generate **Dependency Diagram** (Mermaid flowchart) from `dependency_graph`
4. Cross-check every diagram element against source stage outputs

**Gate**:

- Remove any unverified elements
- Log warnings for removed elements

**Output**: `state_diagram`, `sequence_diagrams`, `dependency_diagram`, `diagram_verification_log`

---

## Stage 7: Documentation Assembly

**Goal**: Produce structured documentation.

Generate markdown with these sections:

```markdown
# [Feature Name] Documentation

## Overview

## Entry Points

## Data Models

## Execution Flows

## State Machine

## Error Handling

## Known Gaps & Limitations

## Appendix: Code References
```

1. Every claim gets `[ref: file:line]` annotation
2. Build clickable traceability index
3. Generate two views: **Technical** (full detail) and **Non-Technical** (simplified)

**Output**: `documentation_technical`, `documentation_summary`, `traceability_index`,
`confidence_report`

---

## Stage 8: Verification & Validation

**Goal**: Cross-check all claims; fail if verification cannot pass.

1. Extract all factual claims from documentation
2. Verify each claim against `traceability_index`:
   - File exists
   - Line content matches claim basis
3. Check diagram-flow consistency
4. Verify all gaps appear in Known Limitations
5. **Hallucination detection**: Flag claims without code references or contradicting code

**Gate**:

- If hallucination detected → HALT immediately
- If too many unverifiable claims → HALT
- If passed → Output final documentation

**Output**: `verification_passed`, `verified_claims`, `failed_claims`, `hallucination_report`,
`final_documentation` or `failure_report`

---

## Failure Behavior

When any stage encounters a blocking failure:

1. STOP execution immediately
2. PRESERVE all partial outputs
3. Generate failure report:
   ```json
   {
     "stage_failed": "<stage_name>",
     "failure_type": "<failure_enum>",
     "failure_reason": "<explanation>",
     "partial_outputs": { ... },
     "recovery_suggestions": [...]
   }
   ```
4. AWAIT user intervention

---

## Example Usage

```
User: Generate documentation for the "User Registration" feature

Stage 1: Found POST /auth/register, /signup page
Stage 2: Traced AuthController → AuthService → UserRepository, EmailService
Stage 3: Mapped registration flow with email verification async boundary
Stage 4: Extracted UserStatus enum { PENDING, ACTIVE, SUSPENDED }
Stage 5: Identified missing timeout handling on EmailService
Stage 6: Generated state diagram and sequence diagram
Stage 7: Assembled full technical documentation
Stage 8: Verified 24/24 claims, no hallucinations → SUCCESS
```
