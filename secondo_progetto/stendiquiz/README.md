# Scelte progettuali Stendiquiz

## Organizzazione del codice sorgente

L’archivio ZIP con il codice sorgente del sito web contiene, tra gli altri, le seguenti cartelle e i seguenti file:

- **/static**: cartella contenente i file statici del sito web;
- **/stendiquiz**: cartella contenente il codice _Python_ del controller del sito web;
- **/templates**: cartella contenente i file HTML dei template processati da _Django_;
- **avviaProgetto.bat**: script batch per avviare rapidamente il server di sviluppo in ambiente _Windows_;
- **manage.py**: file a riga di comando per interagire in maniera conveniente con il progetto _Django_, ad esempio per avviare manualmente il server di sviluppo;
- **manualeUtenteStendiquiz.pdf**: manuale utente riportante le istruzioni per l'avvio del progetto in locale;
- **README.md**: il documento _markdown_ che state leggendo.

In **static** sono presenti le cartelle contenenti le dipendenze esterne usate dal sito (_Bootstrap_ 4.3.1, _jQuery_ 3.3.1, _DataTables_ 2.3.2, _FontAwesome_ 6.7.2, _jQueryUI_ 1.14.1), i font speciali impiegati nella stampa dei caratteri (cartella **fonts**), i file multimediali (cartella **images**), il codice _Javascript_ del sito web (cartella **js**), le pagine HTML da includere direttamente attraverso jQuery senza dover essere processate da _Django_ (cartella **assets**) e i fogli di stile CSS utilizzati per definire l’aspetto delle pagine web (cartella **css**). 

La cartella **stendiquiz** contiene (tra gli altri) il file di configurazione del server (_settings.py_), la mappatura dei templates ai corrispondenti URL sul server (_urls.py_), il codice _Python_ di funzioni di utilità del progetto (come quelle per la conversione delle date dal formato _dd/MM/yyyy_ richiamate durante la costruzione dell'interfaccia grafica, al formato _yyyy-MM-dd_, impiegato dal DBMS - _utilities.py_), i file sorgente _Python_ dei controller di ogni template (_controller.py_) e il modulo _Python_ per interfacciarsi con il database MySQL di _Stendiquiz_ usato nel primo progetto (_data_layer.py_). 

La sottocartella **commons** in **templates** ospita il codice HTML dei template sfruttati in più pagine web, mentre il file _impostazioni.html_ centralizza l'inclusione di fogli di stile CSS e file _Javascript_ comuni a tutte le pagine web.

### Scelte progettuali

Abbiamo progettato questa versione ristrutturata di Stendiquiz avendo in mente come profilo di utente tipico della piattaforma un _superuser_ (a cui è stato assegnato nome utente **demo**); questa decisione giustifica alcuni aspetti relativi alle funzionalità presenti, tra cui
- Le funzionalità di login e registrazione non sono presenti, in quanto durante l'utilizzo di _Stendiquiz_ viene forzato l'accesso come _superuser_;
- La funzionalità di logout è disabilitata, in quanto durante l'utilizzo di _Stendiquiz_ viene forzato l'accesso come _superuser_;
- L'aggiunta della possibilità di visualizzare la lista completa degli utenti registrati su _Stendiquiz_;
- L'aggiunta della possibilità di vedere le partecipazioni ai quiz di ogni utente, inclusi i risultati;

Abbiamo però deciso che possono essere eliminati solo i quiz che siano stati creati dal _superuser_ e che non abbiano già registrato delle partecipazioni: i quiz con delle partecipazioni collegate, nonchè quelli creati da altri utenti della piattaforma, non possono essere eliminati (e la corrispondente opzione nella pagina _I miei quiz_ è nascosta).Inoltre è possibile modificare solo le informazioni generali relative ai quiz creati dal superuser, ovvero titolo, data di apertura e data di chiusura.