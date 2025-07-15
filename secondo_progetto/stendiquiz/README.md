# Scelte progettuali Stendiquiz

## Organizzazione del codice sorgente

L’archivio ZIP con il codice sorgente del sito web contiene, tra le altre, le seguenti cartelle e i seguenti file:

- **/static**: file statici del sito web;
- **/stendiquiz**: codice Python del controller del sito web;
- **/templates**: sorgenti HTML dei template processati da Django;
- **avviaProgetto.bat**, script batch per avviare rapidamente il server di esecuzione;
- **manualeUtenteStendiquiz.pdf**: manuale contenente le istruzioni per l'esecuzione dell'applicazione in locale;
- **README.md**: il documento _markdown_ che state leggendo.

In **static** sono presenti le dipendenze esterne usate dal sito (_Bootstrap_ 4.3.1, _jQuery_ 3.3.1, _DataTables_ 2.3.2, _FontAwesome_ 6.7.2, _jQueryUI_ 1.14.1), i font speciali impiegati nella stampa dei caratteri, i file multimediali (cartella **images**), il codice _Javascript_ del sito web (cartella **js**) e le pagine HTML da includere direttamente attraverso jQuery senza dover essere processate da _Django_ (cartella **assets**). 

La cartella **stendiquiz** contiene il file di configurazione del server (_settings.py_), la mappatura dei templates ai corrispondenti URL sul server (_urls.py_), funzioni Python di utilità come quelle per la conversione delle date dal formato _dd/MM/yyyy_ (usato nella visualizzazione dell'interfaccia utente) al formato _yyyy-MM-dd_ (impiegato dal DBMS - _utilities.py_), i controller per ciascuno dei template (_controller.py_) e il modulo per interfacciarsi con il database MySQL di _Stendiquiz_ usato nel primo progetto (_data_layer.py_). 

La sottocartella **commons** in **templates** ospita il codice HTML dei template sfruttati in più pagine web, mentre il file _impostazioni.html_ centralizza l'importazione di file CSS e _Javascript_ comuni a tutte le pagine web.

### Scelte progettuali

Abbiamo progettato questa versione ristrutturata di Stendiquiz avendo in mente come profilo di utente tipico dell'applicazione un _superuser_; questa decisione giustifica alcune decisioni relativamente alle funzionalità presenti, tra cui
- Le funzionalità di login e registrazione non sono presenti, in quanto durante l'utilizzo di _Stendiquiz_ viene forzato l'accesso come _superuser_;
- La funzionalità di logout è disabilitata, in quanto durante l'utilizzo di _Stendiquiz_ viene forzato l'accesso come _superuser_;
- L'aggiunta della possibilità di visualizzare la lista completa degli utenti registrati su _Stendiquiz_;
- L'aggiunta della possibilità di vedere le partecipazioni ai quiz di ogni utente, inclusi i risultati;

Abbiamo però deciso che possono essere eliminati solo i quiz che siano stati creati dal _superuser_ e che non abbiano già registrato delle partecipazioni; i quiz con delle partecipazioni collegate, nonchè quelli creati da altri utenti della piattaforma, non possono essere eliminati (e la corrispondente opzione nella pagina _I miei quiz_ è nascosta).Inoltre è possibile modificare solo le informazioni generali relative ai quiz creati dal superuser, ovvero titolo, data di apertura e data di chiusura.
