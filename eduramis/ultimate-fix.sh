#!/bin/bash

echo "🔧 Ultimate Next.js Reset - Fixing Persistent Build Issues"
echo "=========================================================="

cd /Users/augustas/Documents/GitHub/Education/eduramis

# Step 1: Kill all Node.js and Next.js processes
echo "Step 1: Killing all Node.js processes..."
pkill -f node 2>/dev/null || true
pkill -f next 2>/dev/null || true
pkill -f npm 2>/dev/null || true
sleep 3

# Step 2: Remove all build and cache directories
echo "Step 2: Removing all build and cache files..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf ~/.npm/_cacache
rm -rf ~/.npm/_logs
rm -rf /tmp/.next-*
rm -rf package-lock.json

# Step 3: Clear system caches
echo "Step 3: Clearing system caches..."
sudo dscacheutil -flushcache 2>/dev/null || true
sudo killall -HUP mDNSResponder 2>/dev/null || true

# Step 4: Reinstall Node modules completely
echo "Step 4: Reinstalling all dependencies..."
npm cache clean --force
npm install

# Step 5: Initialize Next.js properly
echo "Step 5: Initializing Next.js build system..."
npm run build 2>/dev/null || echo "Build failed, will try dev mode"

# Step 6: Start development server
echo "Step 6: Starting development server..."
npm run dev
