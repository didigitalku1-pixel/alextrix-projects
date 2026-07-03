#!/bin/bash
BUN=/usr/local/bin/bun
DIR=/home/z/my-project/mini-services/aura-server
LOG=$DIR/server.log

while true; do
  fuser -k 3000/tcp 2>/dev/null
  sleep 1
  echo "[$(date '+%H:%M:%S')] Starting Bun..." >> "$LOG"
  cd "$DIR"
  setsid "$BUN" index.ts >> "$LOG" 2>&1 &
  PID=$!
  disown $PID 2>/dev/null || true
  # Wait for it to die
  while kill -0 $PID 2>/dev/null; do
    sleep 5
  done
  echo "[$(date '+%H:%M:%S')] Bun exited (was PID $PID), restarting in 3s..." >> "$LOG"
  sleep 3
done
