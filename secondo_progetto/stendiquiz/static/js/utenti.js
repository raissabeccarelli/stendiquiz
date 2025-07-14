function caricaUtenti(data) {
    var table = new DataTable('#tabellaUtenti', 
    {
        columns: [
            { title: "Nome utente" },
            { title: "Nome" },
            { title: "Cognome" },
            { title: "Email" }
        ],
        columnDefs: [
            {
                targets: [0, 1, 2],
                type: 'string',
                searchPanes: {
                    orderable: false
                }
            },
            {
                targets: [3],
                type: 'string',
                searchable: true,
                searchPanes: {
                    orderable: false
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
        buttons: [
            'searchPanes'
        ]
    });

    // Eventuale comportamento al click sulla riga (opzionale)
    $('#tabellaUtenti tbody').on('click', 'tr', function () {
        const rowData = table.row(this).data();
        const username = rowData[0];
        const nome = rowData[1];
        const cognome = rowData[2];
        const email = rowData[3];

        // Esempio: mostra modale con i dettagli utente
        $("#messageBoxTitle").text("Dettagli utente");
        $("#messageBoxMessage").html(
            `<strong>Nome utente:</strong> ${username}<br>` +
            `<strong>Nome:</strong> ${nome}<br>` +
            `<strong>Cognome:</strong> ${cognome}<br>` +
            `<strong>Email:</strong> ${email}`
        );
        $("#messageBox").modal('show');
    });
}
