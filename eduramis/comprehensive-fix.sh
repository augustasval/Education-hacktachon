#!/bin/bash
echo "🔧 Comprehensive Next.js Reset"
echo "=============================="

cd /Users/augustas/Documents/GitHub/Education/eduramis

# Kill any existing processes
echo "Killing Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Remove all caches
echo "Cleaning caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf ~/.npm/_cacache
rm -rf package-lock.json

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Start dev server
echo "Starting fresh server..."
npm run dev
