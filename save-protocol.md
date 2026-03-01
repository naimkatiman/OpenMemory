# Save Protocol - Unified Memory-Diary Core
*Canonical merged save pipeline for memory and diary persistence*

## Trigger Commands
- `save`
- `save diary` (exact alias to `save`)

Both commands run the same pipeline and produce the same persistence result.
This protocol is profile-agnostic and applies equally in `Kiyoraka` and `Vanguard` modes.

## Merged Save Pipeline
1. **Detect trigger**
- User invokes `save` or `save diary`.

2. **Update canonical memory**
- Review durable learnings from current session.
- Update `main/main-memory.md` with identity, preference, or relationship changes.

3. **Monthly archive check (before diary write)**
- Scan `daily-diary/current/` for files not in the current month.
- Move prior-month files into `daily-diary/archived/YYYY-MM/`.
- Keep legacy numbered diaries in `daily-diary/archived/legacy/` unchanged.

4. **Append diary entry for today**
- Determine today: `daily-diary/current/YYYY-MM-DD.md`.
- Create file if missing.
- Append a new structured entry using `daily-diary/daily-diary-protocol.md`.
- Never overwrite existing content.

5. **Update session recap linkage**
- Update `main/current-session.md` with:
  - recap summary,
  - last diary write timestamp,
  - diary file path,
  - diary entry linkage/title.

6. **Confirm outcome**
- Report memory file updated, diary file written, and recap linkage refreshed.

## Command Semantics
| Command | Result |
| --- | --- |
| `save` | Memory update + diary append + session recap linkage update |
| `save diary` | Alias to `save` (identical pipeline) |
| `review diary` | Read entries from current and recent archives |
| `save project` | Project-only save (LRU feature), separate from this pipeline |

## Compatibility Alias
`Load save-diary` remains supported as a compatibility alias. It should return:
- deprecation notice for legacy feature docs,
- pointer to `save-protocol.md`,
- pointer to `daily-diary/daily-diary-protocol.md`.

## Quality Rules
- Persist only evidence-based and durable information.
- Keep diary append-only.
- Keep command behavior consistent with `main/main-memory.md` and `master-memory.md`.

---

Status: Active canonical protocol
Version: Unified Memory-Diary Core v1.0
