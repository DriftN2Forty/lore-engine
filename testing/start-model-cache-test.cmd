@echo off
setlocal
set "LLAMA_SERVER=D:\AI\llama.cpp\llama-b11046-bin-win-vulkan-x64\llama-server.exe"
set "MODEL=%USERPROFILE%\.lmstudio\models\0bserverx\RVN-IQ2_M\RVN-IQ2_M.gguf"
set "CACHE_FLAGS="
if /I "%~1"=="default" goto ready
if /I "%~1"=="disabled" (
    set "CACHE_FLAGS=--cache-ram 0"
    goto ready
)
echo Usage: start-model-cache-test.cmd default^|disabled
exit /b 1
:ready
if not exist "%LLAMA_SERVER%" exit /b 1
if not exist "%MODEL%" exit /b 1
rem Clear this override only in this child process so default means the build default.
set "LLAMA_ARG_CACHE_RAM="
echo Cache comparison: %~1. Stop the existing model server before starting this launcher.
"%LLAMA_SERVER%" -m "%MODEL%" --alias rvn-iq2m-base --host 127.0.0.1 --port 8080 -c 8192 -np 1 -ngl 99 --jinja %CACHE_FLAGS%
exit /b %ERRORLEVEL%
