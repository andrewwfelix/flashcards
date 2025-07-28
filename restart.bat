@echo off
echo 🔄 Restarting flashcard server...

echo 🔍 Looking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 💀 Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo ✅ Port 3000 is now free
echo 🚀 Starting development server...
npm run dev 