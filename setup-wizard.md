# Setup Wizard
*Fast personalization for Unified Memory-Diary Core*

## Wizard Flow
1. Ask assistant name (`[AI_NAME]`).
2. Ask user name (`[YOUR_NAME]`).
3. Ask relationship style (`[RELATIONSHIP_STYLE]`).
4. Apply values to:
- `main/main-memory.md`
- `main/current-session.md`
- `master-memory.md`
- `main/openclaw-capability-bridge.md` (if dual profile commands are customized)

Optional preset example:
- Native memory assistant: `Zaky`
- OpenClaw assistant: `Fatin`

## Activation Test
Run:
- `[AI_NAME]`

Expected behavior:
- loads `main/main-memory.md`
- loads `main/current-session.md`
- confirms restore readiness

## Save Behavior Test
Run:
- `save`
- `save diary`
- `review diary`

Expected behavior:
- `save` and `save diary` perform identical merged persistence
- diary writes to `daily-diary/current/YYYY-MM-DD.md`
- recap linkage updates in `main/current-session.md`

## Profile Mode Test
Run:
- `use zaky`
- `use fatin` (or `use openclaw`)
- `show capabilities`
- `sync profiles`

Expected behavior:
- profile switch confirmed without changing canonical storage paths
- both profiles report same memory and diary backend

## Compatibility Test
Run:
- `Load save-diary`

Expected behavior:
- returns deprecation guidance and points to canonical unified core docs

---

Status: Active wizard spec
Version: Unified Memory-Diary Core v1.0
