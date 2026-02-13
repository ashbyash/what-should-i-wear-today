#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# .ts/.tsx 파일만 린트
if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]]; then
  RESULT=$(cd "$CLAUDE_PROJECT_DIR" && npx next lint --quiet 2>&1)
  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    echo "{\"systemMessage\": \"Lint errors found:\\n$RESULT\"}"
  fi
fi

exit 0
