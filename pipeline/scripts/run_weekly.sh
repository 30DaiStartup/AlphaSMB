#!/bin/bash
# AlphaSMB Ad Pipeline — Weekly Generation
# Schedule: Sunday 10 PM ET
# crontab: 0 22 * * 0 /path/to/pipeline/scripts/run_weekly.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIPELINE_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PIPELINE_DIR"

# Activate venv if it exists
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
fi

echo "=== AlphaSMB Weekly Ad Generation — $(date) ==="

python -m src.orchestrator.weekly_generate

echo "=== Generation complete ==="
