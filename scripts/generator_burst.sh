#!/bin/bash
# Run generator in short bursts (2 min each) then restart
# This avoids session timeout issues

cd /home/z/my-project
LOG=/home/z/my-project/download/aura_library/_meta/artifact_generator.log

while true; do
  TS=$(date '+%H:%M:%S')
  echo "[$TS] Starting generator burst..." >> "$LOG"
  # Run for max 100 seconds, then exit
  timeout 100 python3 /home/z/my-project/scripts/generate_artifacts.py >> "$LOG" 2>&1
  EXIT=$?
  COUNT_DESIGN=$(find /home/z/my-project/download/aura_library -name '*.design.md' 2>/dev/null | wc -l)
  echo "[$(date '+%H:%M:%S')] Burst ended (exit=$EXIT, design.md count=$COUNT_DESIGN), sleeping 5s..." >> "$LOG"
  sleep 5
done
