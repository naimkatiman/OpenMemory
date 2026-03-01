import { DatabaseSync } from "node:sqlite";

export interface MemoryRow {
  scope: string;
  fact_key: string;
  fact_value: string;
  source_profile: string;
  updated_at: string;
}

export interface DiaryRow {
  id: number;
  entry_date: string;
  created_at: string;
  profile: string;
  title: string;
  summary: string;
  details: string;
}

export interface CommandLogRow {
  id: number;
  command: string;
  profile: string;
  status: string;
  created_at: string;
}

function utcNowIso(): string {
  return new Date().toISOString();
}

export class SQLiteStore {
  private readonly db: DatabaseSync;

  public constructor(dbPath: string) {
    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA busy_timeout = 3000;");
    this.initializeSchema();
  }

  public close(): void {
    this.db.close();
  }

  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profile_state (
        singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
        active_profile TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memory_facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope TEXT NOT NULL,
        fact_key TEXT NOT NULL,
        fact_value TEXT NOT NULL,
        source_profile TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(scope, fact_key)
      );

      CREATE TABLE IF NOT EXISTS diary_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        profile TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        details TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS command_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        profile TEXT NOT NULL,
        status TEXT NOT NULL,
        result_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS project_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT NOT NULL,
        snapshot TEXT NOT NULL,
        profile TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    const upsert = this.db.prepare(`
      INSERT INTO profile_state (singleton_id, active_profile, updated_at)
      VALUES (1, ?, ?)
      ON CONFLICT(singleton_id) DO NOTHING
    `);
    upsert.run("zaky", utcNowIso());
  }

  public getActiveProfile(): string {
    const stmt = this.db.prepare(
      "SELECT active_profile FROM profile_state WHERE singleton_id = 1"
    );
    const row = stmt.get() as { active_profile: string } | undefined;
    return row?.active_profile ?? "kiyoraka";
  }

  public setActiveProfile(profile: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO profile_state (singleton_id, active_profile, updated_at)
      VALUES (1, ?, ?)
      ON CONFLICT(singleton_id) DO UPDATE SET
        active_profile = excluded.active_profile,
        updated_at = excluded.updated_at
    `);
    stmt.run(profile, utcNowIso());
  }

  public upsertMemory(
    updates: Array<{ scope: string; key: string; value: string }>,
    sourceProfile: string
  ): number {
    if (updates.length === 0) {
      return 0;
    }

    const now = utcNowIso();
    const stmt = this.db.prepare(`
      INSERT INTO memory_facts (scope, fact_key, fact_value, source_profile, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(scope, fact_key) DO UPDATE SET
        fact_value = excluded.fact_value,
        source_profile = excluded.source_profile,
        updated_at = excluded.updated_at
    `);
    this.db.exec("BEGIN");
    try {
      for (const row of updates) {
        stmt.run(row.scope, row.key, row.value, sourceProfile, now);
      }
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    return updates.length;
  }

  public listMemory(scope?: string): MemoryRow[] {
    if (scope) {
      const stmt = this.db.prepare(`
        SELECT scope, fact_key, fact_value, source_profile, updated_at
        FROM memory_facts
        WHERE scope = ?
        ORDER BY scope, fact_key
      `);
      const rows = stmt.all(scope) as unknown[];
      return rows as MemoryRow[];
    }

    const stmt = this.db.prepare(`
      SELECT scope, fact_key, fact_value, source_profile, updated_at
      FROM memory_facts
      ORDER BY scope, fact_key
    `);
    const rows = stmt.all() as unknown[];
    return rows as MemoryRow[];
  }

  public addDiaryEntry(params: {
    profile: string;
    title: string;
    summary: string;
    details: string;
  }): DiaryRow {
    const createdAt = utcNowIso();
    const entryDate = createdAt.slice(0, 10);
    const stmt = this.db.prepare(`
      INSERT INTO diary_entries (entry_date, created_at, profile, title, summary, details)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING id, entry_date, created_at, profile, title, summary, details
    `);
    const row = stmt.get(
      entryDate,
      createdAt,
      params.profile,
      params.title,
      params.summary,
      params.details
    ) as unknown as DiaryRow;
    return row;
  }

  public listDiary(limit = 20, days?: number): DiaryRow[] {
    const safeLimit = Math.max(1, Math.min(200, limit));
    if (typeof days === "number" && days > 0) {
      const start = new Date();
      start.setUTCDate(start.getUTCDate() - days);
      const startDate = start.toISOString().slice(0, 10);
      const stmt = this.db.prepare(`
        SELECT id, entry_date, created_at, profile, title, summary, details
        FROM diary_entries
        WHERE entry_date >= ?
        ORDER BY created_at DESC
        LIMIT ?
      `);
      const rows = stmt.all(startDate, safeLimit) as unknown[];
      return rows as DiaryRow[];
    }

    const stmt = this.db.prepare(`
      SELECT id, entry_date, created_at, profile, title, summary, details
      FROM diary_entries
      ORDER BY created_at DESC
      LIMIT ?
    `);
    const rows = stmt.all(safeLimit) as unknown[];
    return rows as DiaryRow[];
  }

  public addProjectSnapshot(params: {
    projectName: string;
    snapshot: string;
    profile: string;
  }): {
    id: number;
    project_name: string;
    snapshot: string;
    profile: string;
    created_at: string;
  } {
    const createdAt = utcNowIso();
    const stmt = this.db.prepare(`
      INSERT INTO project_snapshots (project_name, snapshot, profile, created_at)
      VALUES (?, ?, ?, ?)
      RETURNING id, project_name, snapshot, profile, created_at
    `);
    return stmt.get(params.projectName, params.snapshot, params.profile, createdAt) as unknown as {
      id: number;
      project_name: string;
      snapshot: string;
      profile: string;
      created_at: string;
    };
  }

  public logCommand(params: {
    command: string;
    payload: unknown;
    profile: string;
    status: "ok" | "error";
    result: unknown;
  }): void {
    const stmt = this.db.prepare(`
      INSERT INTO command_log (command, payload_json, profile, status, result_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      params.command,
      JSON.stringify(params.payload ?? {}),
      params.profile,
      params.status,
      JSON.stringify(params.result ?? {}),
      utcNowIso()
    );
  }

  public listCommandLog(limit = 20): CommandLogRow[] {
    const safeLimit = Math.max(1, Math.min(200, limit));
    const stmt = this.db.prepare(`
      SELECT id, command, profile, status, created_at
      FROM command_log
      ORDER BY id DESC
      LIMIT ?
    `);
    const rows = stmt.all(safeLimit) as unknown[];
    return rows as CommandLogRow[];
  }

  public getSyncState(): {
    active_profile: string;
    memory_fact_count: number;
    diary_entry_count: number;
    last_diary_write: string | null;
  } {
    const memoryRow = this.db
      .prepare("SELECT COUNT(*) AS count FROM memory_facts")
      .get() as { count: number };
    const diaryRow = this.db
      .prepare("SELECT COUNT(*) AS count FROM diary_entries")
      .get() as { count: number };
    const lastDiary = this.db
      .prepare("SELECT created_at FROM diary_entries ORDER BY id DESC LIMIT 1")
      .get() as { created_at: string } | undefined;

    return {
      active_profile: this.getActiveProfile(),
      memory_fact_count: Number(memoryRow.count),
      diary_entry_count: Number(diaryRow.count),
      last_diary_write: lastDiary?.created_at ?? null
    };
  }
}
