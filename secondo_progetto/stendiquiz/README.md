# Organizzazione del repository

Il repository contiene, tra le altre, le seguenti sottocartelle e i seguenti file:

- **/static**: file statici del sito web;
- **/stendiquiz**: codice Python del controller del sito web;
- **/templates**: sorgenti HTML dei template processati da Django;
- **avviaProgetto.bat**, script batch per avviare rapidamente il server di esecuzione;
- **manualeUtenteStendiquiz.pdf**, contenente le istruzioni per l'esecuzione dell'applicazione.

In **static** sono presenti le dipendenze esterne usate dal sito (Bootstrap 4.3.1, jQuery 3.3.1, DataTables 2.3.2, FontAwesome 6.7.2, jQueryUI 1.14.1), i font speciali impiegati nella stampa dei caratteri (Poppins), i file multimediali (cartella **images**), il codice Javascript dell'applicazione (cartella **js**) e le pagine HTML da includere direttamente attraverso jQuery senza prima dover essere processate da Django (cartella **assets**). 

La cartella **stendiquiz** contiene il file di configurazione del server (_settings.py_), la mappatura dei templates ai corrispondenti URL sul server (_urls.py_), funzioni Python di utilità come quelle per la conversione delle date dal formato _dd/MM/yyyy_ (usato nella visualizzazione dell'interfaccia utente) al formato _yyyy-MM-dd_ (impiegato dal DBMS - _utilities.py_), i controller per ciascuno dei template (_controller.py_) e il modulo per interfacciarsi con il database MySQL di Stendiquiz usato nel primo progetto (_data_layer.py_). 

La sottocartella **commons** in **templates** ospita il codice HTML dei template che viene sfruttato in più pagine web, mentre il file _impostazioni.html_ centralizza l'importazione di file CSS e JS comuni a tutte le pagine web.

# Scelte progettuali

Abbiamo progettato questa versione ristrutturata di Stendiquiz avendo in mente come profilo di utente tipico dell'applicazione un superuser; questa decisione giustifica alcune decisioni relativamente alle funzionalità presenti, tra cui
- Le funzionalità di login e registrazione non sono presenti, in quanto durante l'utilizzo dell'applicazione viene forzato l'accesso come superuser;
- La funzionalità di logout è disabilitata, in quanto durante l'utilizzo dell'applicazione viene forzato l'accesso come utente superuser;
- L'aggiunta della possibilità di visualizzare la lista completa degli utenti registrati su Stendiquiz;
- L'aggiunta della possibilità di vedere le partecipazioni ai quiz di ogni utente, inclusi i risultati;
- L'aggiunta della possibilità di vedere i quiz creati da ogni utente, inclusi i risultati.

Abbiamo però deciso che possono essere eliminati solo i quiz che non abbiano già registrato delle partecipazioni; i quiz con delle partecipazioni collegate non possono essere eliminati (e la corrispondente opzione nella pagina _I miei quiz_ è nascosta) ed inoltre è possibile modificare solo le informazioni generali relative ai quiz, ovvero titolo, data di apertura e data di chiusura.
