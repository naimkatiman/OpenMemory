#!/bin/bash
# AI MemoryCore — Example API calls
# Start the server first: npm run dev

BASE="http://localhost:8787"

echo "=== Health Check ==="
curl -s "$BASE/health" | jq .

echo ""
echo "=== Save Memory + Diary ==="
curl -s -X POST "$BASE/v1/save" \
  -H "Content-Type: application/json" \
  -d '{
    "memory_updates": [
      {"scope": "preferences", "key": "language", "value": "TypeScript"},
      {"scope": "preferences", "key": "editor", "value": "VS Code"},
      {"scope": "identity", "key": "name", "value": "Developer"}
    ],
    "summary": "Initial setup — saved dev preferences",
    "title": "First save"
  }' | jq .

echo ""
echo "=== Recall All Memory ==="
curl -s "$BASE/v1/memory" | jq .

echo ""
echo "=== Recall by Scope ==="
curl -s "$BASE/v1/memory?scope=preferences" | jq .

echo ""
echo "=== Review Diary ==="
curl -s "$BASE/v1/diary/recent?limit=5" | jq .

echo ""
echo "=== List Profiles ==="
curl -s "$BASE/v1/profiles" | jq .

echo ""
echo "=== Switch Profile ==="
curl -s -X POST "$BASE/v1/profiles/switch" \
  -H "Content-Type: application/json" \
  -d '{"profile": "assistant"}' | jq .

echo ""
echo "=== Show Capabilities ==="
curl -s "$BASE/v1/capabilities" | jq .

echo ""
echo "=== Execute Objective ==="
curl -s -X POST "$BASE/v1/execute" \
  -H "Content-Type: application/json" \
  -d '{"objective": "Summarize today progress"}' | jq .

echo ""
echo "=== Run Named Command ==="
curl -s -X POST "$BASE/v1/command" \
  -H "Content-Type: application/json" \
  -d '{"command": "review diary", "payload": {"limit": 3}}' | jq .

echo ""
echo "Done!"
