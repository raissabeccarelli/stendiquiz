function caricaQuiz(data) {
    var table = new DataTable('#tabellaQuiz',
        {
            columns: [
                { "title": "Titolo" },
                { "title": "Data Inizio" },
                { "title": "Data Fine" },
                { orderable: false },
                { "title": "Anno Inizio" }
            ],
            columnDefs: [{
                searchPanes: {
                    threshold: 1
                },
                targets: [0],
            },
            { targets: 0, type: 'string', }, //Titolo contiene una stringa
            { targets: 1, type: 'date', render: DataTable.render.date(), searchPanes: { show: false } }, //Data Inizio contiene una data
            { targets: 2, type: 'date', render: DataTable.render.date(), searchPanes: { show: false } }, //Data Fine contiene una data
            { targets: 3, type: 'html', searchPanes: { show: false } },//L'ultima colonna contiene codice HTML
            { targets: 4, type: 'integer', visible: false }
            ],
            responsive: true,
            lengthMenu: [10, 25, 50, -1],
            language: {
                url: '../static/datatables/it-IT.json',
                searchPanes: {
                    collapse: { 0: 'Ricerca Avanzata', _: 'Ricerca Avanzata' },
                    threshold: 1,
                    orderable: false,
                }
            },
            layout: {
                topStart: {
                    buttons: ['searchPanes']
                }
            }
        });
}