@echo off
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://127.0.0.1:5000

cd /d %~dp0\..

if not exist app.py (
    echo ERREUR : app.py introuvable dans %cd%
    pause
    exit /b
)

call .venv\Scripts\activate
python app.py

pause