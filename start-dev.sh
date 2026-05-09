#!/bin/bash
# Start MongoDB, Express API server, and Vite dev server together

# Create MongoDB data directory
mkdir -p /tmp/mongodb-data

# Start MongoDB in background (if not already running)
if ! pgrep -x mongod > /dev/null; then
  mongod --dbpath /tmp/mongodb-data --bind_ip 127.0.0.1 --port 27017 --quiet &
  sleep 2
  echo "[startup] MongoDB started"
else
  echo "[startup] MongoDB already running"
fi

# Run API server and Vite concurrently
npx concurrently \
  --names "server,vite" \
  --prefix-colors "yellow,cyan" \
  --kill-others \
  "tsx watch server/index.ts" \
  "vite"
