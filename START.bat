@echo off
REM ============================================
REM LocalGrievance Agent - Complete Startup
REM ============================================

echo.
echo 🏛️  LocalGrievance Agent - Complete Startup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Python and Node.js are installed
echo.

REM Install Python dependencies
echo 📦 Installing Python dependencies...
cd /d "%~dp0grievance-agent\server"
if exist requirements.txt (
    pip install -q -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install Python dependencies
        pause
        exit /b 1
    )
    echo ✅ Python dependencies installed
) else (
    echo ⚠️  requirements.txt not found, skipping pip install
)

REM Install npm dependencies
echo.
echo 📦 Installing npm dependencies...
cd /d "%~dp0grievance-agent"
if exist package.json (
    call npm install --silent
    if errorlevel 1 (
        echo ⚠️  npm install completed with warnings
    ) else (
        echo ✅ npm dependencies installed
    )
) else (
    echo ⚠️  package.json not found
)

echo.
echo ============================================
echo 🚀 Starting Services...
echo ============================================
echo.

REM Start backend in a new window
echo 📡 Starting FastAPI Backend (Port 8000)...
cd /d "%~dp0grievance-agent\server"
start "LocalGrievance Backend" cmd /k "python app.py"
timeout /t 3 /nobreak

REM Start frontend in a new window
echo 🎨 Starting Frontend Server (Port 3000)...
cd /d "%~dp0grievance-agent"
start "LocalGrievance Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo ✅ Services Started!
echo ============================================
echo.
echo 🌐 Frontend:  http://localhost:3000
echo 📡 Backend:   http://localhost:8000
echo 📚 API Docs:  http://localhost:8000/docs
echo.
echo Press any key to close this window...
pause
