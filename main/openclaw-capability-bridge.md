# OpenClaw Capability Bridge
*Unified integration layer for OpenMemory + OpenClaw behaviors*

## Purpose
Enable OpenClaw-style capabilities on top of Unified Memory-Diary Core without splitting storage.

## Shared Backend (Canonical)
Both assistant profiles read/write the same canonical files:
- `main/main-memory.md`
- `main/current-session.md`
- `save-protocol.md`
- `daily-diary/daily-diary-protocol.md`

Runtime implementation:
- `src/service.ts`
- `src/storage.ts`
- `src/api.ts`

## Assistant Profiles
### `Zaky` (Native Memory Profile)
- Relationship-first conversational memory behavior
- Preference-aware communication and continuity focus
- Uses merged `save` pipeline by default

### `Fatin` (OpenClaw Capability Profile)
- Execution-first workflow (plan, execute, verify, summarize)
- Structured task decomposition and explicit status reporting
- Uses same merged `save` pipeline and same diary backend

## OpenClaw Capability Set
1. **Execution Loop**
- Define objective
- Break into steps
- Execute with verification
- Report outcome and next action

2. **Feature Orchestration**
- Use Time-aware behavior when temporal context matters
- Use LRU project commands for project-only context
- Use Echo Recall for evidence-based memory lookup

3. **Consistency Rules**
- Never fork separate memory files for OpenClaw mode
- Never bypass `save` merged pipeline
- Keep `save project` strictly project-only

## Mode Commands
| Command | Behavior |
| --- | --- |
| `use zaky` | Switch active assistant profile to native memory mode. |
| `use fatin` | Switch active assistant profile to OpenClaw capability mode. |
| `use openclaw` | Alias to `use fatin`. |
| `show capabilities` | Show active profile + enabled capability set. |
| `sync profiles` | Confirm both profiles share current canonical memory and diary state. |

## Save and Diary in Both Modes
- `save`: memory + diary + session recap linkage
- `save diary`: exact alias to `save`
- `review diary`: read current, archived months, then legacy fallback

## Compatibility
- `Load save-diary` remains alias with deprecation guidance.
- No feature folder deletion required for OpenClaw integration.

---

Status: Active integration layer
Version: OpenMemory + OpenClaw Bridge v1.0
