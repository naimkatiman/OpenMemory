/**
 * AI MemoryCore — JavaScript Client Example
 * 
 * Usage: node examples/js-client.mjs
 * Requires: server running at http://localhost:8787
 */

const BASE = "http://localhost:8787";

async function request(method, path, body) {
    const opts = {
        method,
        headers: { "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    return res.json();
}

async function main() {
    console.log("--- Health Check ---");
    console.log(await request("GET", "/health"));

    console.log("\n--- Save Memory ---");
    console.log(
        await request("POST", "/v1/save", {
            memory_updates: [
                { scope: "preferences", key: "theme", value: "dark" },
                { scope: "preferences", key: "timezone", value: "Asia/Kuala_Lumpur" },
            ],
            summary: "Saved user preferences via JS client",
        })
    );

    console.log("\n--- Recall Memory ---");
    console.log(await request("GET", "/v1/memory?scope=preferences"));

    console.log("\n--- Review Diary ---");
    console.log(await request("GET", "/v1/diary/recent?limit=3"));

    console.log("\n--- List Profiles ---");
    console.log(await request("GET", "/v1/profiles"));

    console.log("\n--- Switch to Assistant ---");
    console.log(
        await request("POST", "/v1/profiles/switch", { profile: "assistant" })
    );

    console.log("\n--- Execute Objective ---");
    console.log(
        await request("POST", "/v1/execute", {
            objective: "Review today's development progress",
        })
    );

    console.log("\nDone!");
}

main().catch(console.error);
