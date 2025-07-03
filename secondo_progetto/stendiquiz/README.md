# Organizzazione del repository

Il repository contiene le seguenti sottocartelle e i seguenti file:

- **/static**: file statici del sito web;
- **/stendiquiz**: codice Python del controller del sito web;
- **/templates**: file HTML dei template processati da Django;
- **avviaProgetto.bat**, script batch per avviare rapidamente il server di sviluppo;
- **manualeUtenteStendiquiz.pdf**, contenente le istruzioni per l'esecuzione in locale dell'applicazione.

In **static** sono presenti le dipendenze esterne usate dal sito (Bootstrap 4.3.1, jQuery 3.3.1, DataTables 2.3.2, FontAwesome 6.7.2), i font speciali impiegati nella stampa dei caratteri, i file multimediali presenti (cartella **images**), il codice Javascript dell'applicazione (cartella **js**) e le pagine HTML da includere attraverso JQuery, come la sidebar (cartella **assets**). 

La cartella **stendiquiz** contiene il file di configurazione del server (settings.py), la mappatura dei templates ai corrispondenti URL sul server (urls.py), funzioni Python di utilità come quelle per la formattazione delle date (utilities.py), i controller per ciascuno dei template (controller.py) e il modulo per interfacciarsi con il database di Stendiquiz usato nel primo progetto (data_layer.py). 

La sottocartella **commons** in **templates** ospita i file HTML usati nella generazione dei template, che vengono usati in più pagine web e che possono essere inclusi direttamente in Django (es. footer), mentre impostazioni.html centrralizza l'importazione di file CSS e JS comuni a tutte le pagine web.
