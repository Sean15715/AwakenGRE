#!/bin/bash
# Start backend, frontend, and database

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    # Optional: Stop database when exiting? Usually better to keep it running.
    # docker-compose down 
    exit
}

# Trap Ctrl+C
trap cleanup INT

echo "🚀 Starting GRE Drill Sergeant..."

# 1. Start Database (Docker)
echo "📦 Checking Database..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start Postgres in background if not already running
docker-compose up -d
echo "✅ Database is ready."

# 2. Start Backend
echo "🐍 Starting Backend..."
cd backend

# Check if venv exists and activate it
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "⚠️  No venv found, assuming system python or conda env is active."
fi

# Run FastAPI app
python main.py &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to initialize
sleep 2

# 3. Start Frontend
echo "⚛️  Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All systems operational!"
echo "---------------------------------------"
echo "🔌 Backend:  http://localhost:8000"
echo "💻 Frontend: http://localhost:5173"
echo "🗄️  Database: localhost:5432 (Postgres)"
echo "---------------------------------------"
echo "Press Ctrl+C to stop servers."

# Keep script running
wait