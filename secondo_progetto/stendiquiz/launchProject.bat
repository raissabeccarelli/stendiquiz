@echo off
setlocal EnableExtensions

set "TAB="
((for /L %%P in (1,1,70) do pause>nul)&set /p "TAB=")<"%COMSPEC%"
set "TAB=%TAB:~0,1%"

echo Stendiquiz
echo.
echo Risoluzione delle dipendenze in corso...
REM Verifica installazione di Python
python --version > nul 2>&1
if errorlevel 1 (
    echo Non e' stata trovata un'installazione di Python sulla macchina
    echo Per installare Python:
    echo ,%TAB%1. Visita il sito https://www.python.org/downloads/
    echo ,%TAB%2. Scarica il programma di installazione per la versione più recente
    echo ,%TAB%3. Esegui il programma di installazione e segui le istruzioni mostrate sullo schermo
    pause
    exit /b
) else (
    echo Trovata un'installazione di Python valida
)

REM Verifica installazione di Django
python -c "import django" > nul 2>&1
if errorlevel 1 (
    echo Non e' stata trovata un'installazione di Django sulla macchina 
    echo Installazione di Django in corso...
    pip install django
    if errorlevel 1 (
        echo Errore durante l'installazione di Django
        pause
        exit /b
    ) else (
        echo Django e' stato installato correttamente!
    )
) else (
    echo Trovato Django
)

REM Verifica presenza del modulo requests
python -c "import requests" > nul 2>&1
if errorlevel 1 (
    echo Il modulo requests non e' installato
    echo Installazione del modulo request in corso...
    pip install requests
    if errorlevel 1 (
        echo Errore durante l'installazione del modulo requests
        pause
        exit /b
    ) else (
        echo Il modulo requests e' stato installato correttamente!
    )
) else (
    echo Modulo requests installato
)

echo.
echo Avvio del server in corso...
python manage.py runserver