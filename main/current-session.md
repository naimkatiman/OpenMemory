# Current Session Memory - RAM
*Temporary working memory with recap continuity for AI MemoryCore*

## Session Status
- **Current Session**: Active
- **Last Activity**: `[AUTO_TIMESTAMP]`
- **Session Focus**: `[CURRENT_FOCUS]`
- **Context State**: `[CONTEXT_DESCRIPTION]`

## Working Memory
- **Current Topic**: `[TOPIC]`
- **Immediate Goals**: `[GOALS]`
- **Recent Progress**: `[PROGRESS]`
- **Next Steps**: `[NEXT_STEPS]`

## Session Recap (Persistence Window)
- **Previous Session Summary**: `[SUMMARY]`
- **Where We Left Off**: `[CHECKPOINT]`
- **Important Context**: `[CONTEXT]`
- **User Current State**: `[STATE]`

## Diary Continuity
- **Last Diary Write Timestamp**: `[ISO_TIMESTAMP]`
- **Last Diary File**: `[PATH]`
- **Last Diary Entry Linkage**: `[ENTRY_REFERENCE]`

## 500-Line Hard Limit and Reset Rules
- **Hard limit**: `main/current-session.md` must stay at or under 500 lines.
- **When line count exceeds 500**:
  1. Preserve only `Session Recap` and `Diary Continuity` sections.
  2. Clear detailed working memory and temporary session logs.
  3. Rebuild structure using `main/session-format.md`.
  4. Continue with recap-only persistence from prior context.
- **Never remove** recap continuity fields during reset.

## Session Close Rules
- Write durable learnings to `main/main-memory.md`.
- Run merged save pipeline (`save`) for memory + diary persistence.
- Keep recap concise for restart continuity.

---

Memory type: Session RAM (temporary)
Persistence scope: Recap-only + diary continuity metadata
Format reference: `main/session-format.md`
