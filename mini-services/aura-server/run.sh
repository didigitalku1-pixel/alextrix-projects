#!/bin/bash
cd /home/z/my-project/mini-services/aura-server
while true; do
  echo "[$(date '+%H:%M:%S')] Starting aura-server..."
  bun index.ts >> server.log 2>&1
  echo "[$(date '+%H:%M:%S')] Exited with $?, restarting in 2s..."
  sleep 2
done
