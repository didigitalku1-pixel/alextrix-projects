#!/bin/bash
# Continuous Edge Function generator — runs batches until all templates processed
cd /home/z/my-project/web-library-fresh

BATCH_SIZE=200
MAX_ITERATIONS=200

echo "[$(date)] Starting continuous Edge Function generator"
echo "[$(date)] Batch size: $BATCH_SIZE, max iterations: $MAX_ITERATIONS"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "[$(date)] === Iteration $i/$MAX_ITERATIONS ==="
  
  # Run one batch
  python3 scripts/aura_edge_generate.py --batch=$BATCH_SIZE 2>&1 | tail -8
  
  # Check progress
  PROCESSED=$(python3 -c "import json; d=json.load(open('/home/z/my-project/download/edge_gen_progress.json')); print(d.get('processed', 0))" 2>/dev/null || echo 0)
  SUCCESS=$(python3 -c "import json; d=json.load(open('/home/z/my-project/download/edge_gen_progress.json')); print(d.get('success', 0))" 2>/dev/null || echo 0)
  
  echo "[$(date)] Total processed: $PROCESSED, success: $SUCCESS"
  
  # Refresh token periodically (every 10 iterations = ~30 min)
  if [ $((i % 10)) -eq 0 ]; then
    echo "[$(date)] 🔄 Refreshing aura.build token..."
    REFRESH=$(cat /tmp/aura_refresh_token.txt)
    AURA_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c"
    NEW_TOKENS=$(curl -s -X POST "https://hoirqrkdgbmvpwutwuwj.supabase.co/auth/v1/token?grant_type=refresh_token" \
      -H "apikey: $AURA_ANON" -H "Content-Type: application/json" \
      -d "{\"refresh_token\": \"$REFRESH\"}")
    
    NEW_ACCESS=$(echo "$NEW_TOKENS" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null)
    NEW_REFRESH=$(echo "$NEW_TOKENS" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('refresh_token',''))" 2>/dev/null)
    
    if [ -n "$NEW_ACCESS" ] && [ "$NEW_ACCESS" != "" ]; then
      echo "$NEW_ACCESS" > /tmp/aura_access_token.txt
      echo "$NEW_REFRESH" > /tmp/aura_refresh_token.txt
      echo "[$(date)] ✅ Token refreshed"
    else
      echo "[$(date)] ⚠️ Token refresh failed — using old token"
    fi
  fi
  
  # Check if we should stop (all templates processed)
  # Total templates: 21,563
  if [ "$PROCESSED" -ge 21000 ]; then
    echo "[$(date)] ✅ All templates processed!"
    break
  fi
  
  # Short pause between batches
  sleep 5
done

echo "[$(date)] === FINAL ==="
cat /home/z/my-project/download/edge_gen_progress.json
