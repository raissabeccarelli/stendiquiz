function caricaUtenti(data) {
    var table = new DataTable('#tabellaUtenti', {
        data: data,
        autoWidth: false,
        columns: [
            { title: "Nome utente" },
            { title: "Nome" },
            { title: "Cognome" },
            { title: "Email" },
            { title: "N° Quiz Creati" },
            { title: "N° Quiz Giocati" },
            { title: "Azioni" }
        ],
        columnDefs: [
            {
                targets: [0, 1, 2, 3], // Raggruppato per semplicità
                type: 'string',
                searchPanes: { orderable: false }
            },
            {
                targets: 4, // Quiz Creati
                searchPanes: {
                    orderable: false,
                    options: [
                        {
                            label: '0-10',
                            order: 0,
                            value: function (rowData) { return parseInt(rowData[4]) <= 10; }
                        },
                        {
                            label: '11-20',
                            order: 1,
                            value: function (rowData) { return parseInt(rowData[4]) > 10 && parseInt(rowData[4]) <= 20; }
                        },
                        {
                            label: '21-30',
                            order: 2,
                            value: function (rowData) { return parseInt(rowData[4]) > 20 && parseInt(rowData[4]) <= 30; }
                        },
                        {
                            label: '30+',
                            order: 2,
                            value: function (rowData) { return parseInt(rowData[4]) > 30; }
                        }
                    ]
                }
            },
            {
                targets: 5,
                searchPanes: {
                    orderable: false,
                    options: [
                        {
                            label: '0-10',
                            order: 0,
                            value: function (rowData) { return parseInt(rowData[5]) <= 10; }
                        },
                        {
                            label: '11-20',
                            order: 1,
                            value: function (rowData) { return parseInt(rowData[5]) > 10 && parseInt(rowData[5]) <= 20; }
                        },
                        {
                            label: '21-30',
                            order: 2,
                            value: function (rowData) { return parseInt(rowData[5]) > 20 && parseInt(rowData[5]) <= 30; }
                        },
                        {
                            label: '30+',
                            order: 3,
                            value: function (rowData) { return parseInt(rowData[5]) > 30; }
                        },
                    ],
                }
            },
            { targets: 6, type: 'html', orderable: false, searchable: false, searchPanes: { show: false } },
        ],
        responsive: true,
        lengthMenu: [10, 25, 50],
        language: {
            searchPanes: {
                clearMessage: 'Reset',
                collapse: { 0: 'Ricerca Avanzata', _: 'Ricerca Avanzata (%d)' }
            },
            url: '../static/datatables/it-IT.json',
        },
        layout: {
            topStart: ['buttons', 'pageLength']
        },
        buttons: ['searchPanes']
    });

    $('#tabellaUtenti tbody').on('click', '.vedi-Statistiche', function () {
        var riga = table.row($(this).closest('tr'));
        var nomeUtente = riga.data()[0];
        window.location.href = "/statistiche?utente=" + nomeUtente;
    });
}