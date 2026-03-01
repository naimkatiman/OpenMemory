# Daily Diary Protocol - Unified Memory-Diary Core
*Canonical diary format and archival protocol*

## Canonical Diary Layout
```text
daily-diary/
├── current/
│   └── YYYY-MM-DD.md              # Active daily files (append-only)
├── archived/
│   ├── YYYY-MM/
│   │   └── YYYY-MM-DD.md          # Monthly archives
│   └── legacy/
│       └── Daily-Diary-001.md     # Legacy numbered diaries (preserved)
└── daily-diary-protocol.md        # This format authority
```

## Core Rules
- One diary file per day: `daily-diary/current/YYYY-MM-DD.md`.
- Multiple entries per day are allowed.
- All writes are append-only.
- Monthly archival runs before each write.

## Write Protocol (used by `save` and `save diary`)
1. **Archive check**
- For each file in `daily-diary/current/`, if month is not current month:
  - create `daily-diary/archived/YYYY-MM/` if needed,
  - move the file to that month archive.

2. **Find or create today file**
- Target path: `daily-diary/current/YYYY-MM-DD.md`.
- Create file with date header if missing.

3. **Append entry**
- Add timestamped section with:
  - session summary,
  - topics discussed,
  - key insights,
  - decisions and next steps,
  - memory updates applied.

4. **Update session linkage**
- Write diary metadata into `main/current-session.md`:
  - last diary write timestamp,
  - file path,
  - entry heading/title.

## Review Protocol (`review diary`)
Read in order:
1. `daily-diary/current/` (most recent first)
2. recent `daily-diary/archived/YYYY-MM/` months
3. `daily-diary/archived/legacy/` as fallback for historical recall

## Legacy Compatibility
- Numbered diaries are deprecated as canonical storage.
- Keep old files in `daily-diary/archived/legacy/` for discoverability only.
- Do not write new entries into legacy files.

## Format Authority
This file is the canonical diary format authority for the unified core.
All diary entry generation must follow this protocol.

---

Status: Active canonical protocol
Version: Unified Memory-Diary Core v1.0
