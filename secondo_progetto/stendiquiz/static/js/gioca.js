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
        inserisciPartecipazione(quizCodice);
        /*
        $('.formGioca input[type="radio"]:checked').each(function () {
            var risposteSelezionate = [];
            let nomeDomanda = $(this).closest('.formGioca').attr('numeroDomanda');
            let valoreRisposta = $(this).attr('numeroRisposta');
            risposteSelezionate[nomeDomanda] = valoreRisposta;
            for (k = 0; k < risposteSelezionate.length; k++) {
                inserisciRispostaUtente(codicePartecipazione, quizCodice, k, risposteSelezionate[k]);
            }
            if ("esito" in data) {
                $("#alertSuccess").text("La partecipazione è stata registrata con successo! La pagina si ricaricherà tra qualche secondo.");
                $("#alertSuccess").removeClass("d-none");
                setTimeout(function () {
                    window.location.href = "/"
                }, 3000);
            } else {
                window.location.href = "errore?title=" + encodeURIComponent("502 Internal Server Error") + "&message=" + encodeURIComponent("Si è verificato un errore durante la registrazione della partecipazione al quiz. Riprovare più tardi");
            }

        });
        */
    });
});

function getQuizCodice() {
    return $("#quizCodice").val();
}

function inserisciPartecipazione(quizCodice) {
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
        async: false,
        success: function (data, textStatus, jqXHR) {
            if (!("esito" in data)) {
                window.location.href = "errore?title=" + encodeURIComponent("502 Internal Server Error") + "&message=" + encodeURIComponent("Si è verificato un errore durante la registrazione della partecipazione al quiz. Riprovare più tardi");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Errore durante la chiamata sincrona:", textStatus, errorThrown);
        }
    });
}

function inserisciRispostaUtente(partecipazione, codiceQuiz, domanda, risposta) {
    data = { funzione: "inserisci_risposta_utente", partecipazione: partecipazione, quizCodice: codiceQuiz, domanda: domanda, risposta: risposta };
    $.getJSON("funzionalitaDB", data,
        function (data, textStatus, jqXHR) {
            if (!("esito" in data)) {
                console.error(data["errore"] + " Codice: " + data["codiceErrore"])
            }
        });
}

function getCodicePartecipazione() {
    data = { funzione: "get_max_partecipazione" };
    $.getJSON("funzionalitaDB", data,
        function (data, textStatus, jqXHR) {
            codicePartecipazione = parseInt(data["codice_partecipazione"]);
        });
}
