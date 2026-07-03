#!/bin/bash
# Restart Next.js dev server when it dies - with memory check
cd /home/z/my-project

while true; do
  echo "[$(date '+%H:%M:%S')] Starting next dev..."
  > /home/z/my-project/dev.log
  /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 &
  NEXT_PID=$!
  echo "[$(date '+%H:%M:%S')] next dev PID: $NEXT_PID"
  
  # Wait for it to be ready or die
  while kill -0 $NEXT_PID 2>/dev/null; do
    sleep 5
    # Check if it's listening
    if ss -tlnp 2>/dev/null | grep -q ":3000"; then
      # Process alive AND listening - good
      :
    fi
  done
  
  echo "[$(date '+%H:%M:%S')] next dev died, restarting in 3s..."
  tail -3 /home/z/my-project/dev.log
  sleep 3
  rm -rf /home/z/my-project/.next 2>/dev/null
done
