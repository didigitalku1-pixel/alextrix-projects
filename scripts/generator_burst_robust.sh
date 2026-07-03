#!/bin/bash
# Robust generator: runs in 90-second bursts, auto-restarts forever
# Each burst processes ~15-30 items, then exits cleanly
# Loop restarts it immediately

cd /home/z/my-project
LOG=/home/z/my-project/download/aura_library/_meta/artifact_generator.log

while true; do
  TS=$(date '+%H:%M:%S')
  echo "[$TS] Starting burst..." >> "$LOG"
  
  # Run for max 90 seconds, then exit
  timeout 90 python3 /home/z/my-project/scripts/generate_artifacts.py >> "$LOG" 2>&1
  EXIT=$?
  
  COUNT_D=$(find /home/z/my-project/download/aura_library/templates/ -name '*.design.md' 2>/dev/null | wc -l)
  COUNT_P=$(find /home/z/my-project/download/aura_library/templates/ -name '*.prompt.md' 2>/dev/null | wc -l)
  echo "[$(date '+%H:%M:%S')] Burst ended (exit=$EXIT, design=$COUNT_D, prompt=$COUNT_P), restarting in 3s..." >> "$LOG"
  
  sleep 3
done
