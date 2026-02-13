#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 파일명 추출
FILENAME=$(basename "$FILE_PATH" 2>/dev/null)

cd "$CLAUDE_PROJECT_DIR" || exit 0

case "$FILENAME" in
  score.ts)
    RESULT=$(npx vitest run src/lib/__tests__/score.test.ts 2>&1)
    ;;
  outfit.ts)
    RESULT=$(npx vitest run src/lib/__tests__/outfit.test.ts 2>&1)
    ;;
  ai-message.ts)
    RESULT=$(npx vitest run src/lib/__tests__/ai-message.eval.test.ts 2>&1)
    ;;
  *)
    exit 0
    ;;
esac

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "{\"systemMessage\": \"Tests passed for $FILENAME\"}"
else
  echo "{\"systemMessage\": \"Tests FAILED for $FILENAME:\\n$RESULT\"}"
fi
