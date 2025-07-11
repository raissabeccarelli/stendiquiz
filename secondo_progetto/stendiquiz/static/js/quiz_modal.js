document.addEventListener('DOMContentLoaded', function () {
  const quizModalEl = document.getElementById('quizModal');
  const quizModal = new bootstrap.Modal(quizModalEl);
  const form = document.getElementById('quizForm');
  const domandeContainer = document.getElementById('domandeContainer');
  const aggiungiDomandaBtn = document.getElementById('aggiungiDomandaBtn');
  const resetBtn = document.getElementById('resetFormBtn');
  const erroreDomande = document.getElementById('erroreDomande');

  let domandaIndex = 0;

  // Apri modale al click su link o bottone con id openModalLink
  document.addEventListener('click', function (e) {
    if (e.target.closest('#openModalLink')) {
      e.preventDefault();
      quizModal.show();
    }
  });

  // Reset form e contenuto domande
  resetBtn.addEventListener('click', function () {
    form.reset();
    domandeContainer.innerHTML = '';
    erroreDomande.textContent = '';
    domandaIndex = 0;
  });

  // Rimuove classe invalid mentre l’utente scrive
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid')) {
      e.target.classList.remove('is-invalid');
    }
  });

  // Aggiungi una nuova domanda
  aggiungiDomandaBtn.addEventListener('click', function () {
    const domandaHTML = `
      <div class="card mb-3 p-3 border shadow-sm domanda" data-index="${domandaIndex}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="mb-0">Domanda ${domandaIndex + 1}</label>
          <button type="button" class="btn btn-danger btn-sm rimuoviDomandaBtn">Rimuovi domanda</button>
        </div>
        <div class="mb-2">
          <input type="text" class="form-control testoDomanda" required>
          <div class="invalid-feedback">Inserisci il testo della domanda.</div>
        </div>
        <div class="risposteContainer mb-2"></div>
        <div class="errorRisposte text-danger mb-2"></div>
        <button type="button" class="btn btn-sm btn-outline-secondary aggiungiRispostaBtn">+ Aggiungi risposta</button>
      </div>
    `;
    domandeContainer.insertAdjacentHTML('beforeend', domandaHTML);
    domandaIndex++;
  });

  // Gestione click rimuovi domande, aggiungi risposte e rimuovi risposte
  domandeContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('rimuoviDomandaBtn')) {
      e.target.closest('.domanda').remove();
    }

    if (e.target.classList.contains('aggiungiRispostaBtn')) {
      const domandaCard = e.target.closest('.domanda');
      const risposteContainer = domandaCard.querySelector('.risposteContainer');
      const domandaIdx = domandaCard.getAttribute('data-index');

      const rispostaHTML = `
        <div class="row align-items-center mb-2 risposta">
          <div class="col-md-5">
            <input type="text" class="form-control testoRisposta" placeholder="Testo risposta" required>
            <div class="invalid-feedback">Inserisci il testo della risposta.</div>
          </div>
          <div class="col-md-3">
            <input type="number" class="form-control punteggioRisposta" placeholder="Punteggio" value="0" required>
            <div class="invalid-feedback">Inserisci un punteggio valido.</div>
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

  // Submit form con validazione
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Reset errori
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    erroreDomande.textContent = '';

    let valid = true;

    const titoloInput = document.getElementById('titolo');
    const dataInizioInput = document.getElementById('data_inizio');
    const dataFineInput = document.getElementById('data_fine');

    if (!titoloInput.value.trim()) {
      titoloInput.classList.add('is-invalid');
      valid = false;
    }
    if (!dataInizioInput.value.trim()) {
      dataInizioInput.classList.add('is-invalid');
      valid = false;
    }
    if (!dataFineInput.value.trim()) {
      dataFineInput.classList.add('is-invalid');
      valid = false;
    }

    const blocchiDomanda = document.querySelectorAll('.domanda');

    if (blocchiDomanda.length === 0) {
      erroreDomande.textContent = "Devi inserire almeno una domanda.";
      valid = false;
    }

    const domande = [];

    blocchiDomanda.forEach((blocco) => {
      const testoDomanda = blocco.querySelector('.testoDomanda');
      const risposteBlocchi = blocco.querySelectorAll('.risposta');
      const radios = blocco.querySelectorAll(`input.tipoRispostaRadio[name="corretta-${blocco.dataset.index}"]`);
      const errorRisposte = blocco.querySelector('.errorRisposte');

      errorRisposte.textContent = '';

      if (!testoDomanda.value.trim()) {
        testoDomanda.classList.add('is-invalid');
        valid = false;
      }

      if (risposteBlocchi.length < 2) {
        errorRisposte.textContent = "La domanda deve avere almeno 2 risposte.";
        valid = false;
      }

      let indiceCorretta = -1;
      radios.forEach((radio, i) => {
        radio.classList.remove('is-invalid');
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

    if (!valid) return;

    // Invio dati al server via fetch (adatta URL e gestione risposta)
    fetch('/api/salva_quiz/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')  // Funzione definita sotto
      },
      body: JSON.stringify({
        titolo: titoloInput.value.trim(),
        autore: 'demo',
        data_inizio: dataInizioInput.value.trim(),
        data_fine: dataFineInput.value.trim(),
        domande: domande
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        $("#alertSuccess").text("Il quiz è stato registrato con successo!");
        $("#alertSuccess").removeClass("d-none");
                        setTimeout(function () {
                            window.location.href = "imieiquiz"
                        }, 2000);
        quizModal.hide();
        // reset form se vuoi
        form.reset();
        domandeContainer.innerHTML = '';
        erroreDomande.textContent = '';
        domandaIndex = 0;
      } else {
        alert('Errore nel salvataggio: ' + (data.errore || 'Errore sconosciuto'));
      }
    })
    .catch(() => alert('Errore di connessione.'));

  });

  // Funzione per prendere il cookie CSRF (per Django)
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
});
