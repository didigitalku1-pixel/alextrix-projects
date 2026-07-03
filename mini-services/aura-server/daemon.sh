#!/bin/bash
# Robust keep-alive for Bun server - survives parent shell exit
# Uses disown + setsid + exec for maximum detachment

BUN=/usr/local/bin/bun
DIR=/home/z/my-project/mini-services/aura-server
LOG=$DIR/server.log
PID_FILE=$DIR/server.pid

# Detach from parent
cd "$DIR"

while true; do
  # Kill anything on port 3000
  fuser -k 3000/tcp 2>/dev/null
  sleep 1
  
  echo "[$(date '+%H:%M:%S')] Starting Bun..." >> "$LOG"
  
  # Start bun with full detachment
  setsid "$BUN" index.ts >> "$LOG" 2>&1 &
  PID=$!
  echo $PID > "$PID_FILE"
  disown $PID 2>/dev/null || true
  
  # Wait for it to exit
  while kill -0 $PID 2>/dev/null; do
    sleep 5
  done
  
  echo "[$(date '+%H:%M:%S')] Bun exited (was PID $PID), restarting in 3s..." >> "$LOG"
  sleep 3
done
