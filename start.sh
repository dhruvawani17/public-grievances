#!/bin/bash

# ============================================
# LocalGrievance Agent - Complete Startup
# ============================================

echo ""
echo "🏛️  LocalGrievance Agent - Complete Startup"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Python and Node.js are installed"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd "$(dirname "$0")/grievance-agent/server"
if [ -f requirements.txt ]; then
    pip install -q -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✅ Python dependencies installed"
    else
        echo "❌ Failed to install Python dependencies"
        exit 1
    fi
else
    echo "⚠️  requirements.txt not found"
fi

# Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
cd "$(dirname "$0")/grievance-agent"
if [ -f package.json ]; then
    npm install --silent
    if [ $? -eq 0 ]; then
        echo "✅ npm dependencies installed"
    else
        echo "⚠️  npm install completed with warnings"
    fi
else
    echo "⚠️  package.json not found"
fi

echo ""
echo "============================================"
echo "🚀 Starting Services..."
echo "============================================"
echo ""

# Start backend in background
echo "📡 Starting FastAPI Backend (Port 8000)..."
cd "$(dirname "$0")/grievance-agent/server"
python3 app.py &
BACKEND_PID=$!
sleep 3

# Start frontend in background
echo "🎨 Starting Frontend Server (Port 3000)..."
cd "$(dirname "$0")/grievance-agent"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "✅ Services Started!"
echo "============================================"
echo ""
echo "🌐 Frontend:  http://localhost:3000"
echo "📡 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
