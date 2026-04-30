@echo off
REM Rehome Depot — Photo Importer (Windows wrapper)
REM Double-click this file to scan images/gallery/ and update data/inventory.js.

setlocal
cd /d "%~dp0\.."
python "tools\import_photos.py"
echo.
pause
endlocal
