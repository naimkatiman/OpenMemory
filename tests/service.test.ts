import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { OpenClawService } from "../src/service";
import { SQLiteStore } from "../src/storage";

type FixtureOptions = ConstructorParameters<typeof OpenClawService>[1];

function createFixture(): {
  service: OpenClawService;
  store: SQLiteStore;
  cleanup: () => void;
};
function createFixture(options: FixtureOptions): {
  service: OpenClawService;
  store: SQLiteStore;
  cleanup: () => void;
};
function createFixture(options: FixtureOptions = {}): {
  service: OpenClawService;
  store: SQLiteStore;
  cleanup: () => void;
} {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "memorycore-test-"));
  const dbPath = path.join(tempDir, "test.db");
  const store = new SQLiteStore(dbPath);
  const service = new OpenClawService(store, options);
  return {
    service,
    store,
    cleanup: () => {
      store.close();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  };
}

test("profile switch supports openclaw alias", () => {
  const fx = createFixture();
  try {
    const initial = fx.service.getProfiles();
    assert.equal(initial.active_profile, "primary");

    const switched = fx.service.switchProfile("openclaw");
    assert.equal(switched.active_profile, "assistant");
  } finally {
    fx.cleanup();
  }
});

test("profile switch supports legacy aliases", () => {
  const fx = createFixture();
  try {
    const switched = fx.service.switchProfile("zaky");
    assert.equal(switched.active_profile, "primary");

    const switched2 = fx.service.switchProfile("fatin");
    assert.equal(switched2.active_profile, "assistant");

    const switched3 = fx.service.switchProfile("kiyoraka");
    assert.equal(switched3.active_profile, "primary");
  } finally {
    fx.cleanup();
  }
});

test("merged save updates memory and diary", () => {
  const fx = createFixture();
  try {
    const result = fx.service.runCommand("save", {
      memory_updates: [
        { scope: "identity", key: "assistant_name", value: "Atlas" },
        { scope: "user", key: "preferred_tone", value: "concise" }
      ],
      diary: {
        title: "Integration session",
        summary: "Built TS stack",
        details: "Service and API are implemented in TypeScript."
      }
    });
    assert.equal(Number(result.memory_updates_applied), 2);
    assert.equal((result.diary_entry as { title: string }).title, "Integration session");

    const review = fx.service.runCommand("review diary", { limit: 10 });
    assert.equal(Number(review.count), 1);
  } finally {
    fx.cleanup();
  }
});

test("save diary alias uses merged save pipeline", () => {
  const fx = createFixture();
  try {
    const result = fx.service.runCommand("save diary", {
      diary: { title: "Alias check", summary: "Alias works", details: "" }
    });
    assert.equal((result.diary_entry as { title: string }).title, "Alias check");
  } finally {
    fx.cleanup();
  }
});

test("execute objective uses assistant capability flow", () => {
  const fx = createFixture();
  try {
    fx.service.switchProfile("assistant");
    const result = fx.service.executeObjective({ objective: "Ship API service" });
    assert.equal(result.profile, "assistant");
    assert.equal((result.plan as Array<{ phase: string }>).length, 4);
  } finally {
    fx.cleanup();
  }
});

test("sync profiles reports shared state", () => {
  const fx = createFixture();
  try {
    fx.service.runCommand("save", { diary: { title: "sync" } });
    const sync = fx.service.runCommand("sync profiles");
    assert.equal(sync.synced, true);
    assert.ok(
      Number((sync.shared_state as { diary_entry_count: number }).diary_entry_count) >= 1
    );
  } finally {
    fx.cleanup();
  }
});

test("scope policy blocks disallowed project updates", () => {
  const fx = createFixture({
    instanceName: "project-a",
    defaultScope: "project",
    allowedScopePrefixes: ["project"]
  });
  try {
    assert.throws(() => {
      fx.service.runCommand("save", {
        memory_updates: [{ scope: "preferences", key: "tone", value: "concise" }]
      });
    });
  } finally {
    fx.cleanup();
  }
});

test("scope policy applies default scope for project instance", () => {
  const fx = createFixture({
    instanceName: "project-a",
    defaultScope: "project",
    allowedScopePrefixes: ["project"]
  });
  try {
    const result = fx.service.runCommand("save", {
      memory_updates: [{ key: "milestone", value: "MVP alpha" }]
    });
    assert.equal(Number(result.memory_updates_applied), 1);
    const items = fx.store.listMemory();
    assert.equal(items[0].scope, "project");
  } finally {
    fx.cleanup();
  }
});
