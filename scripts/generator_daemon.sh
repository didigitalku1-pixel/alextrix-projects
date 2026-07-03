#!/bin/bash
# Robust generator daemon
cd /home/z/my-project
LOG=/home/z/my-project/download/aura_library/_meta/artifact_generator.log

while true; do
  TS=$(date '+%H:%M:%S')
  echo "[$TS] Starting generator (PID $$)..." >> "$LOG"
  exec python3 /home/z/my-project/scripts/generate_artifacts.py >> "$LOG" 2>&1
  EXIT=$?
  echo "[$TS] Generator exited with $EXIT, restarting in 10s..." >> "$LOG"
  sleep 10
done
