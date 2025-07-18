function caricaQuiz(data) {
    var table = new DataTable('#tabellaQuiz',
        {
            columns: [
                { "title": "Codice Quiz" },
                { "title": "Titolo" },
                { "title": "Creatore" },
                { "title": "N° Domande" },
                { "title": "Data Apertura" },
                { "title": "Data Chiusura" },
                { "title": "Stato" },
                { "title": "Anno Inizio" }
            ],
            columnDefs: [{
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

                targets: [2],
            },
            {
                targets: [3], searchPanes: {
                    orderable: false,
                    options: [
                        {
                            label: '0-10',
                            order: 0,
                            value: function (rowData, rowIdx) {
                                return rowData[3] <= 10;
                            }
                        },
                        {
                            label: '11-20',
                            order: 1,
                            value: function (rowData, rowIdx) {
                                return rowData[3] <= 20 && rowData[3] > 10;
                            }
                        },
                        {
                            label: '21-30',
                            order: 2,
                            value: function (rowData, rowIdx) {
                                return rowData[3] <= 30 && rowData[3] > 20;
                            }
                        },
                        {
                            label: '30+',
                            order: 3,
                            value: function (rowData, rowIdx) {
                                return rowData[3] > 30;
                            }
                        },
                    ]
                }
            },
            {
                targets: [4, 5],
                searchable: false,
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
            },
            { targets: [0, 7], type: 'integer', visible: false, orderable: false, searchPanes: { orderable: false } },
            { targets: 6, type: 'html', searchPanes: { orderable: false } },
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

    $('#tabellaQuiz tbody').on('click', 'tr', function () {
        var codiceQuiz = table.row(this).data()[0];
        var nomeQuiz = table.row(this).data()[1];
        var dataInizio = table.row(this).data()[4];
        var dataFine = table.row(this).data()[5];
        if (table.row(this).data().at(-2).includes('Aperto')) {
            window.location.href = "gioca?codice=" + codiceQuiz;
        } else if (table.row(this).data().at(-2).includes('In apertura')) {
            $("#messageBoxTitle").text("Quiz in apertura");
            $("#messageBoxMessage").html("Il quiz \"" + nomeQuiz + "\" aprirà il " + dataInizio + ".<br/> Riprovare in seguito.");
            $("#messageBox").modal('show');
        }
        else {
            $("#messageBoxTitle").text("Quiz chiuso");
            $("#messageBoxMessage").html("Il quiz \"" + nomeQuiz + "\" è stato chiuso il " + dataFine + " e non accetta nuove partecipazioni.");
            $("#messageBox").modal('show');
        }
    });
}




