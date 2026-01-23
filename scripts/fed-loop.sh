#!/bin/bash

# Fed Loop - Continuous AI Development
# Usage: ./scripts/fed-loop.sh [max-iterations]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MAX_ITERATIONS=${1:-100}
ITERATION=0
STATE_FILE="$PROJECT_DIR/.fed-state"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         FED LOOP - fed-news            ║${NC}"
echo -e "${BLUE}║   Continuous AI Development System     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "Max iterations: ${YELLOW}$MAX_ITERATIONS${NC}"
echo -e "Project: ${GREEN}$PROJECT_DIR${NC}"
echo ""

# Initialize state file
echo "0" > "$STATE_FILE"

cd "$PROJECT_DIR"

# Ensure dev server is running
if ! lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting dev server...${NC}"
    npm run dev > /tmp/fed-news-dev.log 2>&1 &
    sleep 5
fi

# Main loop
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo "$ITERATION" > "$STATE_FILE"

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ITERATION $ITERATION / $MAX_ITERATIONS${NC}"
    echo -e "${GREEN}  $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Feed prompt to Claude
    cat "$PROJECT_DIR/PROMPT.md" | claude --continue

    # Small delay between iterations
    echo ""
    echo -e "${YELLOW}Iteration complete. Starting next in 5 seconds...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the loop.${NC}"
    sleep 5
done

echo ""
echo -e "${GREEN}Fed loop completed after $ITERATION iterations.${NC}"
rm -f "$STATE_FILE"
