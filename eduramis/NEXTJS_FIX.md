# Next.js Lock Error Fix

This repository includes scripts to automatically fix the common Next.js development server lock error:

```
⨯ Unable to acquire lock at /Users/path/to/project/.next/dev/lock, is another instance of next dev running?
```

## 🚀 Quick Fix Methods

### Method 1: Use npm script (Recommended)
```bash
npm run fix-dev        # For macOS/Linux
npm run fix-dev-win     # For Windows
```

### Method 2: Run script directly
```bash
# macOS/Linux
./fix-nextjs.sh

# Windows
./fix-nextjs.bat
```

### Method 3: Manual commands
```bash
# Kill existing processes
ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | xargs kill -9

# Remove lock files
rm -rf .next

# Free up ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Start fresh
npm run dev
```

## 📝 What the script does:

1. **Kills existing Next.js processes** - Terminates any running `next dev`, `next start`, or `next build`
2. **Frees up ports** - Kills processes using ports 3000-3002
3. **Removes cache files** - Deletes `.next` directory and cache folders
4. **Waits for cleanup** - Ensures all processes are fully terminated
5. **Starts fresh server** - Runs `npm run dev` with a clean slate

## 🔧 Why this happens:

- Previous Next.js process didn't shut down properly
- System crash or force-quit while dev server was running
- Multiple terminals trying to run the same project
- Lock file wasn't cleaned up after abnormal termination

## 💡 Prevention tips:

- Always use `Ctrl+C` to stop the dev server properly
- Don't force-quit terminals while Next.js is running
- Only run one dev server per project at a time
- Use the fix script whenever you see the lock error

## 🚨 If scripts don't work:

1. **Check you're in the project directory**: Make sure you're in `/eduramis/` folder
2. **Run with full path**: `/Users/augustas/Documents/GitHub/Education/eduramis/fix-nextjs.sh`
3. **Manual cleanup**: Follow Method 3 above
4. **Restart VS Code**: Sometimes helps clear locked processes
5. **Restart terminal**: Fresh terminal session can resolve issues
