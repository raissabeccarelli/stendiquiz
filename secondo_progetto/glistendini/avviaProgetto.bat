@echo off
setlocal EnableExtensions

set "TAB="
((for /L %%P in (1,1,70) do pause>nul)&set /p "TAB=")<"%COMSPEC%"
set "TAB=%TAB:~0,1%"

echo Stendiquiz
echo.

REM Verifica installazione di Python
echo Verifica installazione di Python in corso...
python --version > nul 2>&1
if errorlevel 1 (
    echo Non e' stata trovata un'installazione di Python sulla macchina
    echo Per installare Python:
    echo ,%TAB%1. Visita il sito https://www.python.org/downloads/
    echo ,%TAB%2. Scarica il programma di installazione per la versione piu' recente
    echo ,%TAB%3. Esegui il programma di installazione e segui le istruzioni mostrate sullo schermo
    pause
    exit /b
) else (
    echo Trovata un'installazione di Python valida
	echo.
)

REM Controlla se l'ambiente virtuale "venv" esiste
IF NOT EXIST venv (
    echo Creazione dell'ambiente virtuale in corso...
    python -m venv venv
)

REM Attiva l'ambiente virtuale e installa le dipendenze
echo Attivazione ambiente virtuale...
call .\venv\Scripts\activate
echo.

echo Verifica e installazione delle dipendenze in corso (Django, Requests)...
echo.
pip install -r requirements.txt
echo Dipendenze risolte correttamente
echo.
echo Avvio del server in corso...
python manage.py runserver