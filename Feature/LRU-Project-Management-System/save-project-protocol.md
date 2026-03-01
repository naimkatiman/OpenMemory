# Save Project Protocol
*Project-only save workflow (separate from unified `save`)*

## Trigger
`save project`

## Steps
1. Read active project reference from `main/current-session.md`.
2. Gather project progress from current session.
3. Update active project file in `projects/[type]-projects/active/`.
4. Update `projects/project-list.md` save timestamp.
5. Confirm saved project summary.

## Rule
`save project` never replaces the core `save` pipeline.
Core `save` still handles memory + diary persistence.
