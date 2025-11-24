@echo off
echo 🔧 Next.js Dev Server Reset Script (Windows)
echo ========================================

echo Step 1: Killing existing Next.js processes...
taskkill /f /im node.exe 2>nul
echo ✓ Killed Node.js processes

echo Step 2: Cleaning Next.js cache...
if exist ".next" (
    rmdir /s /q .next
    echo ✓ Removed .next directory
)

if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache
    echo ✓ Removed node_modules cache
)

echo Step 3: Waiting for cleanup...
timeout /t 2 /nobreak >nul

echo Step 4: Starting development server...
npm run dev
