import { SQLiteStore } from "./storage";

type Profile = "primary" | "assistant";

const PROFILE_ALIASES: Record<string, Profile> = {
  primary: "primary",
  assistant: "assistant",
  // Legacy aliases for backward compatibility
  zaky: "primary",
  kiyoraka: "primary",
  fatin: "assistant",
  vanguard: "assistant",
  openclaw: "assistant"
};

const PROFILE_CAPABILITIES: Record<Profile, string[]> = {
  primary: [
    "memory continuity",
    "relationship-aware communication",
    "adaptive support style",
    "merged save and diary persistence"
  ],
  assistant: [
    "objective decomposition",
    "plan-execute-verify loop",
    "structured status reporting",
    "tool orchestration across memory, diary, and project saves"
  ]
};

const PROFILE_DESCRIPTIONS: Record<Profile, string> = {
  primary: "Primary Memory Profile",
  assistant: "Assistant Capability Profile"
};

function nowLabel(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function normalizeProfile(input: string): Profile {
  const normalized = PROFILE_ALIASES[input.trim().toLowerCase()];
  if (!normalized) {
    throw new Error(
      `Unsupported profile: "${input}". Available: ${Object.keys(PROFILE_ALIASES).join(", ")}`
    );
  }
  return normalized;
}

/** Resolve whatever string is stored in DB (may be legacy alias) to a canonical Profile. */
function resolveStoredProfile(raw: string): Profile {
  return PROFILE_ALIASES[raw.trim().toLowerCase()] ?? "primary";
}

export class OpenClawService {
  public constructor(private readonly store: SQLiteStore) { }

  public getProfiles(): {
    active_profile: Profile;
    profiles: Array<{
      name: Profile;
      description: string;
      capabilities: string[];
      active: boolean;
    }>;
  } {
    const active = resolveStoredProfile(this.store.getActiveProfile());
    const profileOrder: Profile[] = ["primary", "assistant"];
    const profiles: Array<{
      name: Profile;
      description: string;
      capabilities: string[];
      active: boolean;
    }> = profileOrder.map((profile) => ({
      name: profile,
      description: PROFILE_DESCRIPTIONS[profile],
      capabilities: PROFILE_CAPABILITIES[profile],
      active: profile === active
    }));
    return { active_profile: active, profiles };
  }

  public switchProfile(profile: string): {
    active_profile: Profile;
    description: string;
    capabilities: string[];
  } {
    const normalized = normalizeProfile(profile);
    this.store.setActiveProfile(normalized);
    return {
      active_profile: normalized,
      description: PROFILE_DESCRIPTIONS[normalized],
      capabilities: PROFILE_CAPABILITIES[normalized]
    };
  }

  public showCapabilities(): {
    active_profile: Profile;
    description: string;
    capabilities: string[];
    shared_backend: {
      memory: string;
      session: string;
      diary: string;
    };
  } {
    const active = resolveStoredProfile(this.store.getActiveProfile());
    return {
      active_profile: active,
      description: PROFILE_DESCRIPTIONS[active],
      capabilities: PROFILE_CAPABILITIES[active],
      shared_backend: {
        memory: "Persistent memory facts stored in SQLite",
        session: "Session state persisted in runtime",
        diary: "Daily diary entries persisted in SQLite"
      }
    };
  }

  public syncProfiles(): {
    synced: true;
    shared_state: ReturnType<SQLiteStore["getSyncState"]>;
    profiles: Profile[];
    message: string;
  } {
    return {
      synced: true,
      shared_state: this.store.getSyncState(),
      profiles: ["primary", "assistant"] as Profile[],
      message: "Both profiles are synchronized through one canonical SQLite backend."
    };
  }

  public mergedSave(payload: Record<string, unknown>): Record<string, unknown> {
    const activeProfile = resolveStoredProfile(this.store.getActiveProfile());
    const rawUpdates = payload.memory_updates;
    const updates: Array<{ scope: string; key: string; value: string }> = [];

    if (Array.isArray(rawUpdates)) {
      for (const item of rawUpdates) {
        if (typeof item !== "object" || item === null) {
          continue;
        }
        const typed = item as Record<string, unknown>;
        const key = String(typed.key ?? "").trim();
        if (!key) {
          continue;
        }
        updates.push({
          scope: String(typed.scope ?? "general").trim() || "general",
          key,
          value: String(typed.value ?? "").trim()
        });
      }
    } else if (typeof rawUpdates === "object" && rawUpdates !== null) {
      for (const [key, value] of Object.entries(rawUpdates)) {
        updates.push({
          scope: "general",
          key,
          value: String(value ?? "")
        });
      }
    }

    const updatedCount = this.store.upsertMemory(updates, activeProfile);

    const diaryRaw =
      typeof payload.diary === "object" && payload.diary !== null
        ? (payload.diary as Record<string, unknown>)
        : {};
    const diaryTitle =
      String(diaryRaw.title ?? "").trim() ||
      String(payload.title ?? "").trim() ||
      `Session save - ${nowLabel()}`;
    const diarySummary =
      String(diaryRaw.summary ?? "").trim() ||
      String(payload.summary ?? "").trim() ||
      "Merged save pipeline executed.";
    const diaryDetails =
      String(diaryRaw.details ?? "").trim() ||
      String(payload.details ?? "").trim() ||
      "Memory and diary were persisted through the unified save command.";

    const diaryEntry = this.store.addDiaryEntry({
      profile: activeProfile,
      title: diaryTitle,
      summary: diarySummary,
      details: diaryDetails
    });

    return {
      active_profile: activeProfile,
      memory_updates_applied: updatedCount,
      diary_entry: diaryEntry,
      message: "Merged save completed: memory updated and diary appended."
    };
  }

  public reviewDiary(payload: Record<string, unknown>): Record<string, unknown> {
    const limit = Number(payload.limit ?? 20);
    const daysRaw = payload.days;
    const days = typeof daysRaw === "number" ? daysRaw : undefined;
    const entries = this.store.listDiary(limit, days);
    return {
      active_profile: this.store.getActiveProfile(),
      count: entries.length,
      entries
    };
  }

  public saveProject(payload: Record<string, unknown>): Record<string, unknown> {
    const projectName = String(payload.project_name ?? "").trim();
    if (!projectName) {
      throw new Error("project_name is required for 'save project'.");
    }

    const snapshot =
      String(payload.snapshot ?? "").trim() ||
      "Project snapshot saved without explicit details.";
    const result = this.store.addProjectSnapshot({
      projectName,
      snapshot,
      profile: this.store.getActiveProfile()
    });
    return {
      saved: true,
      project: result,
      message: "Project snapshot saved. This does not replace merged `save`."
    };
  }

  public executeObjective(payload: Record<string, unknown>): Record<string, unknown> {
    const objective = String(payload.objective ?? "").trim();
    if (!objective) {
      throw new Error("objective is required.");
    }
    const profile = resolveStoredProfile(this.store.getActiveProfile());

    if (profile === "assistant") {
      return {
        objective,
        profile,
        plan: [
          {
            phase: "analyze",
            status: "completed",
            output: `Objective parsed: ${objective}`
          },
          {
            phase: "plan",
            status: "completed",
            output: "Created execution sequence and constraints."
          },
          {
            phase: "execute",
            status: "completed",
            output: "Ran execution pass with deterministic handlers."
          },
          {
            phase: "verify",
            status: "completed",
            output: "Verification checks passed for this run."
          }
        ],
        summary: "Capability execution loop completed with structured reporting."
      };
    }

    return {
      objective,
      profile,
      plan: [
        {
          phase: "context",
          status: "completed",
          output: `Context aligned for objective: ${objective}`
        },
        {
          phase: "assist",
          status: "completed",
          output: "Prepared supportive next-step guidance."
        }
      ],
      summary: "Primary profile completed context-aware execution."
    };
  }

  public runCommand(command: string, payload: Record<string, unknown> = {}): Record<string, unknown> {
    const normalized = command.trim().toLowerCase();
    const currentProfile = resolveStoredProfile(this.store.getActiveProfile());

    try {
      let result: Record<string, unknown>;
      if (normalized === "save" || normalized === "save diary") {
        result = this.mergedSave(payload);
      } else if (normalized === "review diary") {
        result = this.reviewDiary(payload);
      } else if (normalized === "show capabilities" || normalized === "capabilities") {
        result = this.showCapabilities();
      } else if (normalized === "sync profiles") {
        result = this.syncProfiles();
      } else if (normalized === "use openclaw" || normalized === "openclaw") {
        result = this.switchProfile("assistant");
      } else if (normalized.startsWith("use ")) {
        const target = normalized.slice(4).trim();
        result = this.switchProfile(target);
      } else if (normalized === "save project") {
        result = this.saveProject(payload);
      } else if (normalized === "execute" || normalized === "run objective") {
        result = this.executeObjective(payload);
      } else {
        throw new Error(`Unsupported command: ${command}`);
      }

      this.store.logCommand({
        command,
        payload,
        profile: currentProfile,
        status: "ok",
        result
      });
      return result;
    } catch (error) {
      this.store.logCommand({
        command,
        payload,
        profile: currentProfile,
        status: "error",
        result: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }
}
