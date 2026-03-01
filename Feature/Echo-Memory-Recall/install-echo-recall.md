# Echo Memory Recall Installation Protocol
*Unified Core compatible recall setup*

## Trigger
`Load echo-recall`

## Prerequisites
- Diary directories exist under `daily-diary/`.
- Best results with unified save pipeline active.

## Install Steps
1. Confirm recall system name.
2. Verify search paths:
- `daily-diary/current/`
- `daily-diary/archived/`
- `daily-diary/archived/legacy/`
3. Add recall behavior guidance to `main/main-memory.md`.
4. Ensure `daily-diary/recall-format.md` is available.
5. Update `master-memory.md` optional features listing.

## Recall Rule Set
- Search current first, then archives, then legacy.
- Narrate from evidence.
- Use ask-user fallback when no match is found.
