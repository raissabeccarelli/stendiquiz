var domandaIndex = 0;

document.addEventListener('DOMContentLoaded', function () {
  const quizModalEl = document.getElementById('quizModal');
  const quizModal = new bootstrap.Modal(quizModalEl);
  const form = document.getElementById('quizForm');
  const domandeContainer = document.getElementById('domandeContainer');
  const aggiungiDomandaBtn = document.getElementById('aggiungiDomandaBtn');
  const resetBtn = document.getElementById('resetFormBtn');
  const erroreDomande = document.getElementById('erroreDomande');

  document.addEventListener('click', function (e) {
    if (e.target.closest('#openModalLink')) {
      e.preventDefault();
      quizModal.show();
    }
  });

  resetBtn.addEventListener('click', function () {
    resetForm();
  });

  aggiungiDomandaBtn.addEventListener('click', function () {
    const domandaHTML = `
      <div class="card mb-3 p-3 border shadow-sm domanda" data-index="${domandaIndex}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="mb-0">Domanda ${domandaIndex + 1}</label>
          <button type="button" class="btn btn-danger btn-sm rimuoviDomandaBtn">Elimina</button>
        </div>
        <div class="mb-2">
          <input type="text" class="form-control testoDomanda" id="Domanda${domandaIndex + 1}" required>
          <small id="charCounterDomanda${domandaIndex + 1}" class="form-text text-muted"></small>
          <div id="invalidFeedbackDomanda${domandaIndex + 1}" class="invalid-feedback"></div>
        </div>
        <div class="risposteContainer mb-2"></div>
        <div class="errorRisposte text-danger mb-2"></div>
        <button type="button" class="btn btn-sm btn-outline-secondary aggiungiRispostaBtn"><i class="fa-solid fa-plus"></i> Aggiungi domanda</button>
      </div>
    `;
    domandeContainer.insertAdjacentHTML('beforeend', domandaHTML);
    $('.testoDomanda').on('input', function () {
      var id = $(this).attr("id");
      var lunghezza = $(this).val().length;
      $('#charCounter' + id).text(lunghezza + ' / 80 caratteri');
      validaCampoTesto($(this), "La lunghezza massima per il testo della domanda è 80 caratteri", "Il testo della domanda è obbligatorio!", 80, $('#charCounter' + id), $('#invalidFeedback' + id));
    });
    domandaIndex++;
  });

  // Gestione click rimuovi domande, aggiungi risposte e rimuovi risposte
  domandeContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('rimuoviDomandaBtn')) {
      domandaIndex--;
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
            <button type="button" class="btn btn-outline-secondary shadow-none rimuoviRispostaBtn" data-toggle="tooltip" data-placement="bottom" title="Elimina Risposta"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;
      risposteContainer.insertAdjacentHTML('beforeend', rispostaHTML);
    }

    if (e.target.classList.contains('rimuoviRispostaBtn')) {
      e.target.closest('.risposta').remove();
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
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

        const tipo = (i === indiceCorretta) ? "Corretta" : "Sbagliata";

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
          $("#alertSuccess").text("Il quiz è stato registrato con successo! La pagina si ricaricherà tra qualche secondo!");
          $("#alertSuccess").removeClass("d-none");
          setTimeout(function () {
            window.location.href = "imieiquiz"
          }, 2000);

        } else {
          window.location.href = "errore?title=" + encodeURIComponent("502 Internal Server Error") + "&message=" + encodeURIComponent("Si è verificato un errore durante la registrazione del quiz. Riprovare più tardi");
        }
      })
      .catch(() => window.location.href = "errore?title=" + encodeURIComponent("502 Internal Server Error") + "&message=" + encodeURIComponent("Si è verificato un errore durante la registrazione del quiz. Riprovare più tardi"));
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

function validaCampoTesto(selettore, messaggioErrore, messaggioObbligatorio, lunghezzaMassima, charCounter, invalidFeedback) {
  if (selettore.val().length > 0) {
    if (selettore.val().length <= lunghezzaMassima) {
      selettore.removeClass('is-invalid');
      selettore.addClass('is-valid');
      charCounter.removeClass('d-none');
      return true;
    }
    else {
      invalidFeedback.text(messaggioErrore);
      charCounter.addClass('d-none');
      selettore.removeClass('is-valid');
      selettore.addClass('is-invalid');
      selettore.removeClass('is-valid');
    }
  }
  else {
    invalidFeedback.text(messaggioObbligatorio);
    charCounter.addClass('d-none');
    selettore.removeClass('is-valid');
    selettore.addClass('is-invalid');
  }
  return false;
}

function validaDateCreaQuiz() {
  var dataInizio = $('#data_inizio').datepicker('getDate');
  var dataFine = $('#data_fine').datepicker('getDate');

  if (dataInizio) {
    if (dataFine) {
      if (dataInizio <= dataFine) {
        $('#data_inizio').addClass('is-valid');
        $('#data_inizio').removeClass('is-invalid');
        $('#data_fine').addClass('is-valid');
        $('#data_fine').removeClass('is-invalid');
        return true;
      }
      else {
        $("#invalidFeedbackdata_inizio").text("La data di chiusura non può essere precedente alla data di apertura!")
        $('#data_fine').addClass('is-invalid');
        $('#data_fine').removeClass('is-valid');
      }
    }
    else {
      $("#invalidFeedbackdata_fine").text("Data di chiusura obbligatoria!")
      $('#data_fine').addClass('is-invalid');
      $('#data_fine').removeClass('is-valid');
    }
  }
  else {
    $("#invalidFeedbackdata_inizio").text("Data di apertura obbligatoria!")
    $('#data_inizio').addClass('is-invalid');
    $('#data_inizio').removeClass('is-valid');
  }
  return false;
}

$(document).ready(function () {

  $("#data_inizio, #data_fine").datepicker({
    showAnim: 'fadeIn',
    showButtonPanel: true,
    dateFormat: 'dd/mm/yy',
    onClose: function () {
      validaDateCreaQuiz();
    }
  });

  $('#quizModal').on('shown.bs.modal', function () {
    resetForm();
  });

  $.datepicker.setDefaults($.datepicker.regional['it']);

  $('#titolo').on('input', function () {
    var lunghezza = $(this).val().length;
    $('#charCountertitolo').text(lunghezza + ' / 80 caratteri');
    validaCampoTesto($('#titolo'), "La lunghezza massima per il titolo del quiz è 80 caratteri", "Il titolo del quiz è obbligatorio!", 80, $('#charCountertitolo'), $('invalidFeedbacktitolo'));
  });
});

function resetForm() {
  domandaIndex = 0;
  $('#domandeContainer').html("");
  $('#domandeContainer').empty();
  $('#quizForm').find('.is-invalid').removeClass('is-invalid');
  $('#quizForm').find('.is-valid').removeClass('is-valid');
  $("#data_inizio, #data_fine").datepicker("setDate", new Date());
  validaDateCreaQuiz();
  $('#charCountertitolo').addClass('d-none');
  $('#titolo').val('');
  $('#titolo').focus();
}

