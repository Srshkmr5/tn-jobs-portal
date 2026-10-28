@echo off
REM ============================================================
REM Tamil Nadu Job Portal - Auto Maintenance & Sync Script
REM Runs deadline check, archives expired jobs, and shows live stats
REM ============================================================

echo [INFO] Running TN Job Portal Daily Automation...
cd /d "%~dp0\.."

node portal\update-jobs.mjs --archive
node portal\update-jobs.mjs --stats

echo [INFO] Completed successfully at %DATE% %TIME%.
