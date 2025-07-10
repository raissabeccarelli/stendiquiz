document.addEventListener('DOMContentLoaded', function () {
    const quizModalEl = document.getElementById('quizModal');
    const quizModal = new bootstrap.Modal(quizModalEl);
    const form = document.getElementById('quizForm');
    const domandeContainer = document.getElementById('domandeContainer');
    const aggiungiDomandaBtn = document.getElementById('aggiungiDomandaBtn');

    document.querySelectorAll('#quizModal [data-bs-dismiss="modal"]').forEach(btn => {
      btn.addEventListener('click', () => {
        quizModal.hide();
      });
    });
    
    let domandaIndex = 0;

    const annullaBtn = document.querySelector('#quizModal .btn-secondary');
    annullaBtn.addEventListener('click', function () {
        form.reset();
        domandeContainer.innerHTML = '';
        domandaIndex = 0;
    });


    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    document.addEventListener('click', function (e) {
        if (e.target.closest('#openModalLink')) {
            e.preventDefault();
            quizModal.show();
        }
    });

    if (aggiungiDomandaBtn) {
        aggiungiDomandaBtn.addEventListener('click', function () {
            const domandaHTML = `
                <div class="card mb-3 p-3 border shadow-sm domanda" data-index="${domandaIndex}">
                    <div class="mb-2">
                        <label>Domanda ${domandaIndex + 1}</label>
                        <input type="text" class="form-control testoDomanda" required>
                    </div>
                    <div class="risposteContainer mb-2"></div>
                    <button type="button" class="btn btn-sm btn-outline-secondary aggiungiRispostaBtn">+ Aggiungi risposta</button>
                </div>
            `;
            domandeContainer.insertAdjacentHTML('beforeend', domandaHTML);
            domandaIndex++;
        });
    }

    // Aggiunta risposta dinamica
    domandeContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('aggiungiRispostaBtn')) {
            const domandaCard = e.target.closest('.domanda');
            const risposteContainer = domandaCard.querySelector('.risposteContainer');
            const rispostaIndex = risposteContainer.children.length;
            const domandaIdx = domandaCard.getAttribute('data-index');

            const rispostaHTML = `
                <div class="row align-items-center mb-2 risposta">
                    <div class="col-md-5">
                        <input type="text" class="form-control testoRisposta" placeholder="Testo risposta" required>
                    </div>
                    <div class="col-md-3">
                        <input type="number" class="form-control punteggioRisposta" placeholder="Punteggio" value="0" required>
                    </div>
                    <div class="col-md-3 d-flex align-items-center">
                        <input type="radio" class="form-check-input tipoRispostaRadio" name="corretta-${domandaIdx}" required>
                        <label class="ms-2 mb-0">Corretta</label>
                    </div>
                    <div class="col-md-1">
                        <button type="button" class="btn btn-danger btn-sm rimuoviRispostaBtn">&times;</button>
                    </div>
                </div>
            `;
            risposteContainer.insertAdjacentHTML('beforeend', rispostaHTML);
        }

        // Rimozione risposta
        if (e.target.classList.contains('rimuoviRispostaBtn')) {
            e.target.closest('.risposta').remove();
        }
    });

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const titolo = document.getElementById('titolo').value;
            const autore = document.getElementById('autore').value;
            const dataInizio = document.getElementById('data_inizio').value;
            const dataFine = document.getElementById('data_fine').value;

            const domande = [];
            const blocchiDomanda = document.querySelectorAll('.domanda');

            blocchiDomanda.forEach((blocco, domandaIndex) => {
                const testoDomanda = blocco.querySelector('.testoDomanda').value;
                const risposte = [];

                const risposteBlocchi = blocco.querySelectorAll('.risposta');

                // Trovo quale radio è selezionata per questa domanda
                const radios = blocco.querySelectorAll(`input.tipoRispostaRadio[name="corretta-${domandaIndex}"]`);
                let indiceCorretta = -1;
                radios.forEach((radio, i) => {
                    if (radio.checked) indiceCorretta = i;
                });

                risposteBlocchi.forEach((rispostaBlocco, i) => {
                    const testo = rispostaBlocco.querySelector('.testoRisposta').value;
                    const punteggio = parseFloat(rispostaBlocco.querySelector('.punteggioRisposta').value) || 0;
                    const tipo = (i === indiceCorretta) ? "corretta" : "sbagliata";

                    risposte.push({ testo, punteggio, tipo });
                });

                domande.push({ testo: testoDomanda, opzioni: risposte });
            });

            fetch('/api/salva_quiz/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    titolo,
                    autore,
                    data_inizio: dataInizio,
                    data_fine: dataFine,
                    domande
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Quiz salvato con successo!");
                    location.reload();
                } else {
                    alert("Errore nel salvataggio: " + data.errore);
                }
            })
            .catch(error => {
                console.error("Errore nella richiesta:", error);
                alert("Errore nella connessione.");
            });

            quizModal.hide();
        });
    }
});
