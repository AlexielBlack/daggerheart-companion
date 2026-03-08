@echo off
REM Purple CLI — Quick Launcher for Daggerheart Companion
REM Place this file wherever you want (Desktop, project root, etc.)

set PURPLE_DIR=%USERPROFILE%\.purple
set OLLAMA_MODEL=qwen3-coder:30b

echo.
echo  === Purple CLI — Daggerheart Companion ===
echo.

REM Activate venv
call "%PURPLE_DIR%\venv\Scripts\activate.bat"

REM Change to purple directory (MCP servers run relative to this)
cd /d "%PURPLE_DIR%"

REM Launch
python cli\purple.py %*
