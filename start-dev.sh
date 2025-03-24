#!/bin/bash

# Start beide servers (frontend en backend) tegelijk
echo "Starting RPM App development servers..."

# Eerst eventuele bestaande processen stoppen
echo "Stopping any existing processes..."
pkill -f "npm run dev" || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

# Start backend
cd backend
npm install
npm run dev &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Start frontend
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

# Wacht tot een van de servers eindigt
wait $BACKEND_PID $FRONTEND_PID

# Cleanup
echo "Stopping servers..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null

echo "Development servers stopped" 