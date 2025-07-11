$(document).ready(function () {

    $('#quizTitolo').on('input', function () {
        var lunghezza = $(this).val().length;
        $('#charCounter').text(lunghezza + ' / 80 caratteri');
        validaTitolo();
    });

    $("#dataInizioModifica, #dataFineModifica").datepicker({
        showAnim: 'fadeIn',
        showButtonPanel: true,
        dateFormat: 'dd/mm/yy',
        onClose: function () {
            validaDate();
        }
    });

    $.datepicker.setDefaults($.datepicker.regional['it']);

    $('#formModificaQuiz').on('submit', function (event) {
        event.preventDefault();
        var dateValide = validaDate();
        var titoloValido = validaTitolo();

        if (dateValide && titoloValido) {
            var codiceQuiz = $("#quizCodiceDaModificare").text();
            var nomeQuiz = $("#quizTitolo").val();
            var dataInizioQuiz = $("#dataInizioModifica").val();
            var dataFineQuiz = $("#dataFineModifica").val();
            var data = { funzione: "modificaQuiz", codice: codiceQuiz, titolo: nomeQuiz, dataInizio: dataInizioQuiz, dataFine: dataFineQuiz };
            $('.contenitore-loader .loader').removeClass('d-none');
            $.getJSON("funzionalitaDB", data,
                function (data, textStatus, jqXHR) {
                    if ("esito" in data) {
                        $("#alertSuccess").text("Il quiz è stato modificato con successo! La pagina si ricaricherà tra qualche secondo.");
                        $("#alertSuccess").removeClass("d-none");
                        setTimeout(function () {
                            window.location.href = "imieiquiz"
                        }, 2000);
                    } else {
                        window.location.href = "errore?title=" + encodeURIComponent("502 Internal Server Error") + "&message=" + encodeURIComponent("Si è verificato un errore durante la modifica del quiz. Riprovare più tardi");
                    }
                }
            );
        } else {
            return false;
        }
    });

    $('#tabellaQuiz tbody').on('click', '.conferma-modifica', function () {
        var table = $('#tabellaQuiz').DataTable();
        var riga = table.row($(this).closest('tr'));
        var codiceQuiz = riga.data()[0];
        var nomeQuiz = riga.data()[1];
        var dataInizioQuiz = riga.data()[3];
        var dataFineQuiz = riga.data()[4];
        $('#quizTitolo').val(nomeQuiz).trigger('input');
        $('#dataInizioModifica').val(dataInizioQuiz);
        $('#dataFineModifica').val(dataFineQuiz);
        $("#primaryButton").on("click", eliminaQuiz);
        $("#quizCodiceDaModificare").text(codiceQuiz);
        $('#formModificaQuiz').find('.is-invalid').removeClass('is-invalid');
        $("#modalModificaQuiz").modal('show');
    });

    $('#modificaQuizModal').on('shown.bs.modal', function () {
        validaDate();
        $('#quizTitolo').focus();
    });
});

function validaTitolo() {
    var titolo = $('#quizTitolo').val();
    if (titolo.trim() != "") {
        if (titolo.length <= 80) {
            $('#quizTitolo').removeClass('is-invalid');
            $('#quizTitolo').addClass('is-valid');
            $('#charCounter').removeClass('d-none');
            return true;
        }
        else {
            $("#invalidFeedbackTitolo").text("La lunghezza massima per il titolo del quiz è 80 caratteri")
            $('#charCounter').addClass('d-none');
            $('#quizTitolo').addClass('is-invalid');
            $('#quizTitolo').removeClass('is-valid');
        }
    }
    else {
        $("#invalidFeedbackTitolo").text("Il titolo del quiz è obbligatorio!")
        $('#charCounter').addClass('d-none');
        $('#quizTitolo').addClass('is-invalid');
        $('#quizTitolo').removeClass('is-valid');
    }
    return false;
}

function validaDate() {
    var dataInizio = $('#dataInizioModifica').datepicker('getDate');
    var dataFine = $('#dataFineModifica').datepicker('getDate');

    if (dataInizio) {
        if (dataFine) {
            if (dataInizio <= dataFine) {
                $('#dataInizioModifica').addClass('is-valid');
                $('#dataInizioModifica').removeClass('is-invalid');
                $('#dataFineModifica').addClass('is-valid');
                $('#dataFineModifica').removeClass('is-invalid');
                return true;
            }
            else {
                $("#invalidFeedbackDataFineModifica").text("La data di chiusura non può essere precedente alla data di apertura!")
                $('#dataFineModifica').addClass('is-invalid');
                $('#dataFineModifica').removeClass('is-valid');
            }
        }
        else {
            $("#invalidFeedbackDataFineModifica").text("Data di chiusura obbligatoria!")
            $('#dataFineModifica').addClass('is-invalid');
            $('#dataFineModifica').removeClass('is-valid');
        }
    }
    else {
        $("#invalidFeedbackDataInizioModifica").text("Data di apertura obbligatoria!")
        $('#dataInizioModifica').addClass('is-invalid');
        $('#dataInizioModifica').removeClass('is-valid');
    }
    return false;
}
