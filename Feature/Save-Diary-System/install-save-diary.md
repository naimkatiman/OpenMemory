# Deprecated: install-save-diary

This installer is deprecated. Diary setup is now core behavior.

Canonical workflow:
1. Ensure `daily-diary/current/` and `daily-diary/archived/` exist.
2. Use `save` (or `save diary`) to run merged memory+diary persistence.
3. Follow `daily-diary/daily-diary-protocol.md` for format and archival.

Compatibility:
- `Load save-diary` should redirect users to:
  - `save-protocol.md`
  - `daily-diary/daily-diary-protocol.md`
  - `master-memory.md`
