function caricaUtenti(data) {
    var table = new DataTable('#tabellaUtenti', {
        data: data,
        columns: [
            { title: "Nome utente" },
            { title: "Nome" },
            { title: "Cognome" },
            { title: "Email" },
            { title: "# Quiz Creati" },
            { title: "# Quiz Giocati" }
        ],
        columnDefs: [
            {
                targets: [0, 1, 2],
                type: 'string',
                searchPanes: { orderable: false }
            },
            {
                targets: [3],
                type: 'string',
                searchable: true,
                searchPanes: { orderable: false }
            },
            {
                targets: 4, // Quiz Creati
                searchPanes: {
                    orderable: false,
                    options: [
                        {
                            label: '0',
                            value: function (rowData) {
                                return parseInt(rowData[4]) === 0;
                            }
                        },
                        {
                            label: '1-5',
                            value: function (rowData) {
                                return parseInt(rowData[4]) > 0 && parseInt(rowData[4]) <= 5;
                            }
                        },
                        {
                            label: '6-10',
                            value: function (rowData) {
                                return parseInt(rowData[4]) > 5 && parseInt(rowData[4]) <= 10;
                            }
                        },
                        {
                            label: '11+',
                            value: function (rowData) {
                                return parseInt(rowData[4]) > 10;
                            }
                        }
                    ]
                }
            },
            {
                targets: 5, // Quiz Giocati
                searchPanes: {
                    orderable: false,
                    options: [
                        {
                            label: '0',
                            value: function (rowData) {
                                return parseInt(rowData[5]) === 0;
                            }
                        },
                        {
                            label: '1-5',
                            value: function (rowData) {
                                return parseInt(rowData[5]) > 0 && parseInt(rowData[5]) <= 5;
                            }
                        },
                        {
                            label: '6-10',
                            value: function (rowData) {
                                return parseInt(rowData[5]) > 5 && parseInt(rowData[5]) <= 10;
                            }
                        },
                        {
                            label: '11+',
                            value: function (rowData) {
                                return parseInt(rowData[5]) > 10;
                            }
                        }
                    ]
                }
            }
        ],
        responsive: true,
        lengthMenu: [10, 25, 50],
        language: {
            searchPanes: {
                clearMessage: 'Reset',
                collapse: { 0: 'Filtri', _: 'Filtri (%d)' }
            },
            url: '../static/datatables/it-IT.json',
        },
        layout: {
            topStart: ['buttons', 'pageLength']
        },
        buttons: ['searchPanes']
    });

    $('#tabellaUtenti tbody').on('click', 'tr', function () {
        const rowData = table.row(this).data();
        const [username, nome, cognome, email, quizCreati, quizGiocati] = rowData;

        $("#messageBoxTitle").text("Dettagli utente");
        $("#messageBoxMessage").html(
            `<strong>Nome utente:</strong> ${username}<br>` +
            `<strong>Nome:</strong> ${nome}<br>` +
            `<strong>Cognome:</strong> ${cognome}<br>` +
            `<strong>Email:</strong> ${email}<br>` +
            `<strong>Quiz creati:</strong> ${quizCreati}<br>` +
            `<strong>Quiz giocati:</strong> ${quizGiocati}`
        );
        $("#messageBox").modal('show');
    });
}
