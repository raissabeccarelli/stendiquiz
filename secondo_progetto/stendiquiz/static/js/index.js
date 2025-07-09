function caricaQuiz(data) {
    var table = new DataTable('#tabellaQuiz',
        {
            columns: [
                { "title": "Codice Quiz" },
                { "title": "Titolo" },
                { "title": "Creatore" },
                { "title": "# Domande" },
                { "title": "Data Apertura" },
                { "title": "Data Chiusura" },
                { "title": "Stato" },
                { "title": "Anno Inizio" }
            ],
            columnDefs: [{
                searchPanes: {
                    threshold: 1,
                },
                type: 'string',
                targets: [2],
            },
            {
                targets: [3], searchPanes: {
                    options: [
                        {
                            label: '1-5',
                            value: function (rowData, rowIdx) {
                                return rowData[3] <= 5;
                            }
                        },
                        {
                            label: '5-10',
                            value: function (rowData, rowIdx) {
                                return rowData[3] <= 10 && rowData[3] > 5;
                            }
                        },
                        {
                            label: '10-15',
                            value: function (rowData, rowIdx) {
                                return rowData[3] <= 15 && rowData[3] > 10;
                            }
                        },
                        {
                            label: '15+',
                            value: function (rowData, rowIdx) {
                                return rowData[3] > 15;
                            }
                        },
                    ]
                }
            },
            { targets: [4, 5], type: 'date', render: DataTable.render.date(), searchable: false },
            { type: 'string', targets: [1] },
            { targets: [0, 7], type: 'integer', visible: false, orderable: false },
            { targets: 6, type: 'html' },
            ],
            responsive: true,
            lengthMenu: [10, 25, 50, -1],
            language: {
                searchPanes: {
                    clearMessage: 'Reset',
                    collapse: { 0: 'Ricerca Avanzata', _: 'Ricerca Avanzata (%d)' }
                },
                url: '../static/datatables/it-IT.json',
            },
            layout: {
                topStart: {
                    buttons: ['searchPanes']
                }
            }
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


