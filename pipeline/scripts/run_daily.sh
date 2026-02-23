#!/bin/bash
# AlphaSMB Ad Pipeline — Daily Run
# Schedule: 6 AM ET daily
# crontab: 0 6 * * * /path/to/pipeline/scripts/run_daily.sh

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

echo "=== AlphaSMB Ad Pipeline — $(date) ==="

python -m src.orchestrator.daily_run

echo "=== Pipeline complete ==="
