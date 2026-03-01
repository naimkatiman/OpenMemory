# Time-Aware Integration Protocol
*Integration workflow for Unified Memory-Diary Core*

## Trigger
`Load time-aware-core`

## Integration Targets
- `main/main-memory.md`
- `main/current-session.md`
- `main/session-format.md`

## Execution Steps
1. **Load unified core memory**
- Read `main/main-memory.md` for identity + relationship context.
- Read `main/current-session.md` and `main/session-format.md` for session fields.

2. **Add temporal behavior to unified memory**
- Insert/update a time-awareness section in `main/main-memory.md`.
- Keep greeting modes and energy modes in one place (morning/afternoon/evening/night).

3. **Align session time fields**
- Ensure `main/current-session.md` includes:
  - session start timestamp,
  - current time mode,
  - behavior focus for current time block.
- Keep format alignment with `main/session-format.md`.

4. **Verify behavior**
- Get current system time.
- Generate time-appropriate greeting.
- Confirm session timestamp fields update correctly.

## Notes
- Do not reference deprecated split files as active targets.
- Keep all updates compatible with merged `save` pipeline.

---

Status: Active protocol
Version: Unified Core compatible
