#!/bin/bash
# Keep FAST generator alive - restart if dies
cd /home/z/my-project
LOG=/home/z/my-project/download/aura_library/_meta/fast_generator.log

while true; do
  if ! pgrep -f "fast_generator" > /dev/null 2>&1; then
    echo "[$(date '+%H:%M:%S')] Generator died, restarting..." >> "$LOG"
    setsid nohup python3 /home/z/my-project/scripts/fast_generator.py >> "$LOG" 2>&1 < /dev/null &
    disown
    sleep 5
  fi
  sleep 30
done
