function caricaStatistiche(data) {
    var table = new DataTable('#tabellaQuiz',
        {
            columns: [
                { "title": "Codice Partecipazione" },
                { "title": "Codice Quiz" },
                { "title": "Titolo" },
                { "title": "Creatore" },
                { "title": "# Domande" },
                { "title": "Punteggio" },
                { "title": "Esito" },
                { "title": "Data Partecipazione" },
                { "title": "Azioni" }
            ],
            columnDefs: [{ type: 'string', targets: [2], searchPanes: { show: false } },
            {
                searchPanes: {
                    orderable: false,
                    dtOpts: {
                        paging: true,
                        pagingType: 'numbers',
                        pageLength: 5
                    },
                    threshold: 1,
                },
                type: 'string',

                targets: 3,
            },
            {
                targets: [4], searchPanes: {
                    threshold: 1,
                    orderable: false,
                    options: [
                        {
                            label: '1-5',
                            order: 0,
                            value: function (rowData, rowIdx) {
                                return rowData[4] <= 5;
                            }
                        },
                        {
                            label: '5-10',
                            order: 1,
                            value: function (rowData, rowIdx) {
                                return rowData[4] <= 10 && rowData[4] > 5;
                            }
                        },
                        {
                            label: '10-15',
                            order: 2,
                            value: function (rowData, rowIdx) {
                                return rowData[4] <= 15 && rowData[4] > 10;
                            }
                        },
                        {
                            label: '15+',
                            order: 3,
                            value: function (rowData, rowIdx) {
                                return rowData[4] > 15;
                            }
                        },
                    ]
                }
            },
            { targets: [5], type: 'integer' },
            { targets: [0, 1], type: 'integer', visible: false, orderable: false, searchPanes: { show: false } },
            { targets: [6], type: 'html', searchPanes: { orderable: false, threshold: 1 } },
            { targets: [8], type: 'html', orderable: false, searchable: false, searchPanes: { show: false } },
            {
                targets: [7],
                searchable: false,
                searchPanes: { show: false },
                render: function (data, type, row) {
                    if (type === 'sort') {
                        if (data) {
                            let parts = data.split(' ')[0].split('/');
                            if (parts.length === 3) {
                                return parts[2] + '-' + parts[1] + '-' + parts[0];
                            }
                        }
                        return '';
                    }

                    if (type === 'display') {
                        if (data) {
                            return data;
                        }
                        return '';
                    }

                    return data;
                }
            }
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

            buttons: [
                'searchPanes'
            ]
        });

    table.on('select.dt', () => {
        table.searchPanes.rebuildPane(1, true);
    });

    table.on('deselect.dt', () => {
        table.searchPanes.rebuildPane(1, true);
    });

    $('#tabellaQuiz tbody').on('click', '.conferma-informazioni', function () {
        var riga = table.row($(this).closest('tr'));
        var codicePartecipazione = riga.data()[0];
        window.location.href = "/visualizzapartecipazione?codice=" + codicePartecipazione;
    });

}




