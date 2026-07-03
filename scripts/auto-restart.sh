#!/bin/bash
# Auto-restart Bun server + artifact generator
# Runs forever, restarts if either process dies

BUN=/usr/local/bin/bun
SERVER_DIR=/home/z/my-project/mini-services/aura-server
SERVER_LOG=$SERVER_DIR/server.log
GEN_SCRIPT=/home/z/my-project/scripts/generate_artifacts.py
GEN_LOG=/home/z/my-project/download/aura_library/_meta/gen_stdout.log

while true; do
  # Check Bun server
  if ! ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "[$(date '+%H:%M:%S')] Starting Bun server..."
    cd "$SERVER_DIR"
    setsid "$BUN" index.ts >> "$SERVER_LOG" 2>&1 &
    disown $! 2>/dev/null || true
    sleep 3
  fi
  
  # Check artifact generator
  if ! pgrep -f "generate_artifacts" > /dev/null 2>&1; then
    echo "[$(date '+%H:%M:%S')] Starting artifact generator..."
    setsid python3 "$GEN_SCRIPT" >> "$GEN_LOG" 2>&1 &
    disown $! 2>/dev/null || true
    sleep 3
  fi
  
  sleep 30
done
