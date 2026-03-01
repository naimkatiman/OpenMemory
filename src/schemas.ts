import { z } from "zod";

// ── Profile ──────────────────────────────────────────────────────────────────

export const SwitchProfileBody = z.object({
    profile: z.string().min(1, "profile is required")
});

// ── Memory update item ────────────────────────────────────────────────────────

const MemoryUpdateItem = z.object({
    scope: z.string().default("general"),
    key: z.string().min(1, "key is required"),
    value: z.string()
});

// ── Diary entry ───────────────────────────────────────────────────────────────

const DiaryPayload = z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    details: z.string().optional()
}).optional();

// ── Save ─────────────────────────────────────────────────────────────────────

export const SaveBody = z.object({
    memory_updates: z.array(MemoryUpdateItem).optional(),
    diary: DiaryPayload,
    title: z.string().optional(),
    summary: z.string().optional(),
    details: z.string().optional()
});

// ── Execute ───────────────────────────────────────────────────────────────────

export const ExecuteBody = z.object({
    objective: z.string().min(1, "objective is required"),
    context: z.record(z.string(), z.unknown()).optional()
});

// ── Command ───────────────────────────────────────────────────────────────────

export const CommandBody = z.object({
    command: z.string().min(1, "command is required"),
    payload: z.record(z.string(), z.unknown()).optional()
});

// ── Helper ────────────────────────────────────────────────────────────────────

export function zodError(error: z.ZodError): { error: string; details: z.ZodIssue[] } {
    return {
        error: "Validation failed",
        details: error.issues
    };
}
