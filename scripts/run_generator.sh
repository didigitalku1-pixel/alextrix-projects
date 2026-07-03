#!/bin/bash
# Auto-restart generator if it dies
cd /home/z/my-project
LOG=/home/z/my-project/download/aura_library/_meta/artifact_generator.log

while true; do
  echo "[$(date '+%H:%M:%S')] Starting generator..." >> "$LOG"
  python3 /home/z/my-project/scripts/generate_artifacts.py >> "$LOG" 2>&1
  EXIT=$?
  echo "[$(date '+%H:%M:%S')] Generator exited with $EXIT, restarting in 5s..." >> "$LOG"
  sleep 5
done
