#!/bin/bash
# Add local node to PATH
export PATH=$PWD/node_env/bin:$PATH

echo "🎅 Starting Santa's Wishing Machine..."
cd santa-react

# Start backend in background
echo "🎄 Starting Backend Server on port 3001..."
node server.js &
BACKEND_PID=$!

# Start frontend
echo "❄️ Starting Frontend..."
npm run dev

# Cleanup when frontend stops
kill $BACKEND_PID
