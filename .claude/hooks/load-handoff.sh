#!/bin/bash
HANDOFF="$CLAUDE_PROJECT_DIR/HANDOFF.md"

if [ -f "$HANDOFF" ]; then
  echo "## Previous Session Handoff"
  cat "$HANDOFF"
fi

exit 0
