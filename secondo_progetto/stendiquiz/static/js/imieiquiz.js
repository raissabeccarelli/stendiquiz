function caricaMieiQuiz(data) {
    var table = new DataTable('#tabellaQuiz',
        {
            columns: [
                { "title": "Codice Quiz" },
                { "title": "Titolo" },
                { "title": "# Domande" },
                { "title": "Data Inizio" },
                { "title": "Data Fine" },
                { "title": "Stato" },
                { "title": "Azioni" },
                { "title": "Anno Inizio" },
            ],
            columnDefs: [
                { type: 'string', targets: [1], searchPanes: { show: false } },
                {
                    targets: [2], searchPanes: {
                        threshold: 1,
                        options: [
                            {
                                label: '1-5',
                                value: function (rowData, rowIdx) {
                                    return rowData[2] <= 5;
                                }
                            },
                            {
                                label: '5-10',
                                value: function (rowData, rowIdx) {
                                    return rowData[2] <= 10 && rowData[2] > 5;
                                }
                            },
                            {
                                label: '10-15',
                                value: function (rowData, rowIdx) {
                                    return rowData[2] <= 15 && rowData[2] > 10;
                                }
                            },
                            {
                                label: '15+',
                                value: function (rowData, rowIdx) {
                                    return rowData[2] > 15;
                                }
                            },
                        ]
                    }
                },
                { targets: [3, 4], type: 'date', render: DataTable.render.date(), searchable: false },
                { targets: [0, 7], type: 'integer', visible: false, orderable: false },
                { targets: 5, type: 'html' },
                { targets: 6, type: 'html', orderable: false, searchable: false, searchPanes: { show: false } },
            ],
            responsive: true,
            lengthMenu: [10, 25, 50, -1],
            language: {
                url: '../static/datatables/it-IT.json',
            },
            layout: {
                top1: {
                    searchPanes: {
                        cascadePanes: true,
                        collapse: false
                    }
                }
            }
        });

    $('#tabellaQuiz tbody').on('click', 'tr', function (event) {
        var indiceCella = $(event.target).closest('td').index();
        var totaleColonne = $(this).find('td').length;
        if (indiceCella < totaleColonne - 1) {
            var codiceQuiz = table.row(this).data()[0];
            var nomeQuiz = table.row(this).data()[1];
            var dataInizio = table.row(this).data()[3];
            var dataFine = table.row(this).data()[4];
            if (table.row(this).data().at(-3).includes('Aperto')) {
                window.location.href = "http://127.0.0.1/gioca?quizCodice=" + codiceQuiz;
            } else if (table.row(this).data().at(-3).includes('In apertura')) {
                $("#messageBoxTitle").text("Quiz in apertura");
                $("#messageBoxMessage").html("Il quiz \"" + nomeQuiz + "\" aprirà il " + dataInizio + ".<br/> Riprovare in seguito.");
                $("#messageBox").modal('show');
            }
            else {
                $("#messageBoxTitle").text("Quiz chiuso");
                $("#messageBoxMessage").html("Il quiz \"" + nomeQuiz + "\" è stato chiuso il " + dataFine + " e non accetta nuove partecipazioni.");
                $("#messageBox").modal('show');
            }
        }
    });
}

function confermaEliminazione() {
    $("#primaryButton").addClass("btn-danger");
    $("#yesNoMessageTitle").text("Conferma eliminazione");
    $("#yesNoMessageMessage").text("Sei sicuro di voler eliminare questo quiz? Questa azione non può essere annullata.");
    $("#yesNoMessage").modal('show');

}
