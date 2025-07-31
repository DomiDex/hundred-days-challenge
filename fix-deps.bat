@echo off
echo Fixing dependencies and build issues...
echo.

echo Step 1: Cleaning up old files...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules 2>nul
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del /f /q package-lock.json 2>nul
)
if exist .next (
    echo Removing .next build directory...
    rmdir /s /q .next 2>nul
)

echo.
echo Step 2: Clearing npm cache...
call npm cache clean --force

echo.
echo Step 3: Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo Failed to install dependencies. Trying with legacy peer deps...
    call npm install --legacy-peer-deps
)

echo.
echo Step 4: Building the project...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo Build failed. Trying safe build...
    call npm run build:safe
)

echo.
echo Done! You can now run 'npm run dev' to start the development server.
pause