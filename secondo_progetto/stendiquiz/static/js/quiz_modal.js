document.addEventListener('DOMContentLoaded', function () {
    const quizModalEl = document.getElementById('quizModal');
    const quizModal = new bootstrap.Modal(quizModalEl);
    const form = document.getElementById('quizForm');
    const domandeContainer = document.getElementById('domandeContainer');
    const aggiungiDomandaBtn = document.getElementById('aggiungiDomandaBtn');

    // Funzione per mostrare messaggi con il modal personalizzato
    function showMessage(title, message, options = {}) {
        const modalEl = document.getElementById('erroreMessage');
        const modalTitle = modalEl.querySelector('#erroreMessageTitle');
        const modalMessage = modalEl.querySelector('#erroreMessageMessage');
        const primaryBtn = modalEl.querySelector('#primaryButton');
        const secondaryBtn = modalEl.querySelector('#secondaryButton');

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Mostra o nasconde i pulsanti in base a options
        if (options.primaryText) {
            primaryBtn.textContent = options.primaryText;
            primaryBtn.classList.remove('d-none');
        } else {
            primaryBtn.classList.add('d-none');
        }

        if (options.secondaryText) {
            secondaryBtn.textContent = options.secondaryText;
            secondaryBtn.classList.remove('d-none');
        } else {
            secondaryBtn.classList.add('d-none');
        }

        // Rimuove eventuali event listener precedenti
        primaryBtn.onclick = null;
        secondaryBtn.onclick = null;

        if (options.onPrimaryClick) {
            primaryBtn.onclick = () => {
                options.onPrimaryClick();
                bootstrap.Modal.getInstance(modalEl).hide();
            };
        }

        if (options.onSecondaryClick) {
            secondaryBtn.onclick = () => {
                options.onSecondaryClick();
                bootstrap.Modal.getInstance(modalEl).hide();
            };
        }

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }

    quizModalEl.addEventListener('hidden.bs.modal', function () {
        form.reset();
        domandeContainer.innerHTML = '';
        domandaIndex = 0;
    });

    document.querySelectorAll('#quizModal [data-bs-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            quizModal.hide();
        });
    });

    let domandaIndex = 0;

    const resetBtn = document.getElementById('resetFormBtn');
    resetBtn.addEventListener('click', function () {
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

    form.addEventListener('input', function (e) {
        if (e.target.classList.contains('is-invalid')) {
            e.target.classList.remove('is-invalid');
        }
    });

    if (aggiungiDomandaBtn) {
        aggiungiDomandaBtn.addEventListener('click', function () {
            const domandaHTML = `
                <div class="card mb-3 p-3 border shadow-sm domanda" data-index="${domandaIndex}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0">Domanda ${domandaIndex + 1}</label>
                        <button type="button" class="btn btn-danger btn-sm rimuoviDomandaBtn">Rimuovi domanda</button>
                    </div>
                    <div class="mb-2">
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

    domandeContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('rimuoviDomandaBtn')) {
            e.target.closest('.domanda').remove();
        }
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

        if (e.target.classList.contains('rimuoviRispostaBtn')) {
            e.target.closest('.risposta').remove();
        }
    });

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

            let valid = true;

            const titoloInput = document.getElementById('titolo');
            const dataInizioInput = document.getElementById('data_inizio');
            const dataFineInput = document.getElementById('data_fine');

            const titolo = titoloInput.value.trim();
            const dataInizio = dataInizioInput.value.trim();
            const dataFine = dataFineInput.value.trim();
            const autore = 'demo';

            if (!titolo) {
                titoloInput.classList.add('is-invalid');
                valid = false;
            }
            if (!dataInizio) {
                dataInizioInput.classList.add('is-invalid');
                valid = false;
            }
            if (!dataFine) {
                dataFineInput.classList.add('is-invalid');
                valid = false;
            }

            const blocchiDomanda = document.querySelectorAll('.domanda');
            const domande = [];

            if (blocchiDomanda.length === 0) {
                showMessage('Errore', 'Inserisci almeno una domanda.', { primaryText: 'OK' });
                return;
            }

            blocchiDomanda.forEach((blocco, domandaIndex) => {
                const testoDomanda = blocco.querySelector('.testoDomanda');
                const risposteBlocchi = blocco.querySelectorAll('.risposta');
                const radios = blocco.querySelectorAll(`input.tipoRispostaRadio[name="corretta-${blocco.dataset.index}"]`);

                let indiceCorretta = -1;

                if (!testoDomanda.value.trim()) {
                    testoDomanda.classList.add('is-invalid');
                    valid = false;
                }

                if (risposteBlocchi.length < 2) {
                    showMessage('Errore', `La domanda ${domandaIndex + 1} deve avere almeno 2 risposte.`, { primaryText: 'OK' });
                    valid = false;
                }

                radios.forEach((radio, i) => {
                    if (radio.checked) indiceCorretta = i;
                });

                if (indiceCorretta === -1) {
                    radios.forEach(radio => radio.classList.add('is-invalid'));
                    valid = false;
                }

                const risposte = [];

                risposteBlocchi.forEach((rispostaBlocco, i) => {
                    const testo = rispostaBlocco.querySelector('.testoRisposta');
                    const punteggio = rispostaBlocco.querySelector('.punteggioRisposta');

                    if (!testo.value.trim()) {
                        testo.classList.add('is-invalid');
                        valid = false;
                    }

                    if (punteggio.value === '' || isNaN(punteggio.value)) {
                        punteggio.classList.add('is-invalid');
                        valid = false;
                    }

                    const tipo = (i === indiceCorretta) ? "corretta" : "sbagliata";

                    risposte.push({
                        testo: testo.value.trim(),
                        punteggio: parseFloat(punteggio.value),
                        tipo: tipo
                    });
                });

                domande.push({
                    testo: testoDomanda.value.trim(),
                    opzioni: risposte
                });
            });

            if (!valid) {
                showMessage('Errore', "Alcuni campi sono incompleti o errati. Correggili e riprova.", { primaryText: 'OK' });
                return;
            }

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
                    showMessage('Successo', "Quiz salvato con successo!", { primaryText: 'OK', onPrimaryClick: () => location.reload() });
                } else {
                    showMessage('Errore', "Errore nel salvataggio: " + data.errore, { primaryText: 'OK' });
                }
            })
            .catch(error => {
                console.error("Errore nella richiesta:", error);
                showMessage('Errore', "Errore nella connessione.", { primaryText: 'OK' });
            });

            quizModal.hide();
        });
    }
});
