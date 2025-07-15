var utente = "demo";
var codicePartecipazione = 0;
var url = "funzionalitaDB";

$(document).ready(function () {
    $('.btn-errore').on('click', function () {
        history.back();
    });

    $('.domanda-card').each(function () {
        $(this).find('input[type="radio"]:first').prop('checked', true);
    });

    $('#btnInviaRisposte').on('click', function (event) {
        var quizCodice = getQuizCodice();
        $('.contenitore-loader .loader').removeClass('d-none');
        $('#btnInviaRisposte').prop("disabled", true);
        inserisciPartecipazione(quizCodice, function (risultatoAjax) {
            if (risultatoAjax && "esito" in risultatoAjax) {
                getCodicePartecipazione(function (risultatoAjax) {
                    codicePartecipazione = risultatoAjax;
                    registraRisposte(codicePartecipazione, quizCodice, function (risultatoAjax) {
                        if (risultatoAjax && "esito" in risultatoAjax) {
                            $("#alertSuccess").text("La partecipazione è stata registrata con successo! Scoprirai i tuoi risultati tra qualche secondo!");
                            $("#alertSuccess").removeClass("d-none");
                            setTimeout(function () {
                                window.location.href = "visualizzapartecipazione?codice=" + codicePartecipazione;
                            }, 2000);
                        }
                    });
                });
            } else {
                console.log("La chiamata AJAX è fallita o non ha restituito un esito.");
            }

        });

    });
});
function getQuizCodice() {
    return $("#quizCodice").val();
}

function inserisciPartecipazione(quizCodice, callback) {
    let data = new Date();
    data = data.toISOString().split('T')[0];

    let dati = {
        funzione: "aggiungiPartecipazione",
        nomeUtente: utente,
        quizCodice: quizCodice,
        dataPartecipazione: data
    };

    $.ajax({
        url: "funzionalitaDB",
        data: dati,
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            callback(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            callback(null);
        }
    });
}

function inserisciRispostaUtente(partecipazione, codiceQuiz, domanda, risposta, callback) {
    data = { funzione: "inserisci_risposta_utente", partecipazione: partecipazione, quizCodice: codiceQuiz, domanda: domanda, risposta: risposta };
    $.getJSON("funzionalitaDB", data,
        function (data, textStatus, jqXHR) {
            if (!("esito" in data)) {
                window.location.href = "errore?title=" + encodeURIComponent("502 Internal Server Error") + "&message=" + encodeURIComponent("Si è verificato un errore durante la registrazione della partecipazione al quiz. Riprovare più tardi");
            }
        });
}

function getCodicePartecipazione(callback) {
    data = { funzione: "get_max_partecipazione" };
    $.getJSON("funzionalitaDB", data,
        function (data, textStatus, jqXHR) {
            codicePartecipazione = parseInt(data["codice_partecipazione"]);
            callback(codicePartecipazione);
        });
}

function registraRisposte(codicePartecipazione, quizCodice, callback) {
    $('.formGioca input[type="radio"]:checked').each(function () {
        var risposteSelezionate = [];
        let nomeDomanda = $(this).closest('.formGioca').attr('numeroDomanda');
        let valoreRisposta = $(this).attr('numeroRisposta');
        inserisciRispostaUtente(codicePartecipazione, quizCodice, nomeDomanda, valoreRisposta, function (rispostaAjax) { });
    });
    risposta = { "esito": "ok" };
    callback(risposta);
}
