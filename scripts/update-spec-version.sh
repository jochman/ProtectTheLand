#!/usr/bin/env bash
set -euo pipefail

# scripts/update-spec-version.sh
# Hook & utility script to ensure spec.md is updated with each development iteration.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC_FILE="$REPO_ROOT/spec.md"

# Both agy and Codex call this utility from their respective Stop hooks.  The
# caller is optional for direct/manual use, but validating it catches a broken
# hook configuration before it silently updates the specification.
SYNC_AGENT="${SPEC_SYNC_AGENT:-${1:-manual}}"
case "$SYNC_AGENT" in
  agy|codex|manual) ;;
  *)
    echo "[spec-hook] Unsupported synchronization agent: $SYNC_AGENT" >&2
    echo "[spec-hook] Use agy, codex, or manual." >&2
    exit 64
    ;;
esac

# Codex parses command-hook stdout as its JSON response. Status messages remain
# on stderr, and successful Codex runs end with an explicit continuation JSON
# response. agy and manual invocations retain their normal stdout logs.
log() {
  if [ "$SYNC_AGENT" = "codex" ]; then
    printf '%s\n' "$*" >&2
  else
    printf '%s\n' "$*"
  fi
}

finish() {
  if [ "$SYNC_AGENT" = "codex" ]; then
    printf '{"continue":true}\n'
  fi
}

if [ ! -f "$SPEC_FILE" ]; then
  log "[spec-hook:$SYNC_AGENT] Warning: spec.md not found at $SPEC_FILE"
  finish
  exit 0
fi

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
CURRENT_BRANCH=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
COMMIT_COUNT=$(git -C "$REPO_ROOT" rev-list --count HEAD 2>/dev/null || echo "1")
NEXT_ITERATION=$((COMMIT_COUNT + 1))

log "[spec-hook:$SYNC_AGENT] Synchronizing spec.md metadata (Iteration #$NEXT_ITERATION @ $TIMESTAMP)..."

# Ensure Last Synchronized header exists in spec.md
if grep -q "\*\*Last Synchronized:\*\*" "$SPEC_FILE"; then
  # Replace existing Last Synchronized line
  sed -i "s|> \*\*Last Synchronized:\*\*.*|> \*\*Last Synchronized:\*\* $TIMESTAMP (Branch: \`$CURRENT_BRANCH\`, Iteration #$NEXT_ITERATION)|g" "$SPEC_FILE"
else
  # Insert after Repository line
  sed -i "/\*\*Repository:\*\*/a > \*\*Last Synchronized:\*\* $TIMESTAMP (Branch: \`$CURRENT_BRANCH\`, Iteration #$NEXT_ITERATION)" "$SPEC_FILE"
fi

log "[spec-hook:$SYNC_AGENT] spec.md header updated successfully."
finish
