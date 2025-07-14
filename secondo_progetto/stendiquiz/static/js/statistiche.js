function caricaStatistiche() {
    new DataTable('#tabellaStatistiche', {
        responsive: true,
        lengthMenu: [5, 10, 25],
        language: {
            url: '../static/datatables/it-IT.json'
        }
    });
}