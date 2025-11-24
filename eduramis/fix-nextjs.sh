#!/bin/bash

# Next.js Dev Server Reset Script
# This script fixes the "Unable to acquire lock" error by cleaning up processes and files

echo "🔧 Next.js Dev Server Reset Script"
echo "=================================="

# Function to print colored output
print_status() {
    echo -e "\033[1;34m$1\033[0m"
}

print_success() {
    echo -e "\033[1;32m✓ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m✗ $1\033[0m"
}

# Step 1: Kill any existing Next.js processes
print_status "Step 1: Killing existing Next.js processes..."

# Find and kill Next.js processes
NEXT_PIDS=$(ps aux | grep -i "next dev\|next start\|next build" | grep -v grep | awk '{print $2}')

if [ -n "$NEXT_PIDS" ]; then
    echo "Found Next.js processes: $NEXT_PIDS"
    echo "$NEXT_PIDS" | xargs kill -9 2>/dev/null
    print_success "Killed existing Next.js processes"
else
    print_success "No existing Next.js processes found"
fi

# Step 2: Kill processes using common Next.js ports (3000, 3001, 3002)
print_status "Step 2: Freeing up ports 3000-3002..."

for port in 3000 3001 3002; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null
        print_success "Freed port $port (killed process $PID)"
    fi
done

# Step 3: Remove Next.js lock files and cache
print_status "Step 3: Cleaning Next.js cache and lock files..."

# Remove .next directory if it exists
if [ -d ".next" ]; then
    rm -rf .next
    print_success "Removed .next directory"
fi

# Remove specific lock files
LOCK_FILES=(
    ".next/dev/lock"
    ".next/cache/lock"
    "node_modules/.cache"
)

for lock_file in "${LOCK_FILES[@]}"; do
    if [ -f "$lock_file" ] || [ -d "$lock_file" ]; then
        rm -rf "$lock_file"
        print_success "Removed $lock_file"
    fi
done

# Step 4: Wait a moment for processes to fully terminate
print_status "Step 4: Waiting for cleanup to complete..."
sleep 2

# Step 5: Start the development server
print_status "Step 5: Starting fresh development server..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the correct project directory."
    exit 1
fi

# Start the development server
print_success "Starting npm run dev..."
npm run dev
