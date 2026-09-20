#!/usr/bin/env bash
set -e

# scripts/update-spec-version.sh
# Hook & utility script to ensure spec.md is updated with each development iteration.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC_FILE="$REPO_ROOT/spec.md"

if [ ! -f "$SPEC_FILE" ]; then
  echo "[spec-hook] Warning: spec.md not found at $SPEC_FILE"
  exit 0
fi

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
CURRENT_BRANCH=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
COMMIT_COUNT=$(git -C "$REPO_ROOT" rev-list --count HEAD 2>/dev/null || echo "1")
NEXT_ITERATION=$((COMMIT_COUNT + 1))

echo "[spec-hook] Synchronizing spec.md metadata (Iteration #$NEXT_ITERATION @ $TIMESTAMP)..."

# Ensure Last Synchronized header exists in spec.md
if grep -q "\*\*Last Synchronized:\*\*" "$SPEC_FILE"; then
  # Replace existing Last Synchronized line
  sed -i "s|> \*\*Last Synchronized:\*\*.*|> \*\*Last Synchronized:\*\* $TIMESTAMP (Branch: \`$CURRENT_BRANCH\`, Iteration #$NEXT_ITERATION)|g" "$SPEC_FILE"
else
  # Insert after Repository line
  sed -i "/\*\*Repository:\*\*/a > \*\*Last Synchronized:\*\* $TIMESTAMP (Branch: \`$CURRENT_BRANCH\`, Iteration #$NEXT_ITERATION)" "$SPEC_FILE"
fi

echo "[spec-hook] spec.md header updated successfully."
