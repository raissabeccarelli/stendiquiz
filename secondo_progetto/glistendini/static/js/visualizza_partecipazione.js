$(document).ready(function () {
    $("#btnGiocaAncora").on("click", function () {
        window.location.href = "/gioca?codice=" + $('#quizCodice').val();
    });
    $("#btnTornaHome").on("click", function () {
        window.location.href = "/.";
    });
});