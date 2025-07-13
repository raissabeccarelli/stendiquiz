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
    $('#erroreDomande').addClass('d-none');
    const domandaHTML = `
      <div class="card mb-3 p-3 border shadow-sm domanda" data-index="${domandaIndex}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="mb-0">Domanda ${domandaIndex + 1}</label>
          <button type="button" class="btn btn-danger btn-sm rimuoviDomandaBtn">Elimina</button>
        </div>
        <div class="mb-2">
          <input type="text" class="form-control testoDomanda" id="Domanda${domandaIndex + 1}" placeholder="Inserisci il testo della domanda" required>
          <small id="charCounterDomanda${domandaIndex + 1}" class="form-text text-muted"></small>
          <div id="invalidFeedbackDomanda${domandaIndex + 1}" class="invalid-feedback"></div>
        </div>
        <div class="risposteContainer mb-2"></div>
        <div class="alert alert-danger d-none errorRisposte" role = "alert"></div>
        <button type="button" class="btn btn-sm btn-outline-secondary aggiungiRispostaBtn"><i class="fa-solid fa-plus"></i> Aggiungi Risposta</button>
      </div>
    `;
    domandeContainer.insertAdjacentHTML('beforeend', domandaHTML);

    $('.testoDomanda').on('input', function () {
      var id = $(this).attr("id");
      var lunghezza = $(this).val().trim().length;
      if (lunghezza > 0) {
        $('#charCounter' + id).text(lunghezza + ' / 80 caratteri');
      }
      validaCampoTesto($(this), "La lunghezza massima per il testo della domanda è 80 caratteri", "Il testo della domanda è obbligatorio!", 80, $('#charCounter' + id), $('#invalidFeedback' + id));
    });

    $('.aggiungiRispostaBtn').on('click', function () {
      $('.erroreRisposte').addClass('d-none');
    });
    domandaIndex++;
  });

  domandeContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('rimuoviDomandaBtn')) {
      domandaIndex--;
      e.target.closest('.domanda').remove();
    }

    if (e.target.classList.contains('aggiungiRispostaBtn')) {
      const domandaCard = e.target.closest('.domanda');
      const risposteContainer = domandaCard.querySelector('.risposteContainer');
      const domandaIdx = domandaCard.getAttribute('data-index');
      $('.erroreRisposte').addClass('d-none');
      $('#erroreDomande').addClass('d-none');
      const rispostaIdx = $('.numeroRisposta' + parseInt(domandaIdx + 1)).length;
      if (rispostaIdx == 0) {
        risposteContainer.insertAdjacentHTML('beforeend', '<hr>');
      }
      const rispostaHTML = `
        <div class = "mb-2 rispostaInfo">
          <div class = " numeroRisposta numeroRisposta${parseInt(domandaIdx) + 1} mb-2">
          <label class="mb-0">Risposta ${rispostaIdx + 1}</label>
          </div>
        <div class="row align-items-start mb-2 risposta">
          <div class="col-md-7">
              <input id="Risposta${rispostaIdx + 1}"type="text" class="form-control testoRisposta" placeholder="Inserisci il testo della risposta" required>
              <small id="charCounterRisposta${rispostaIdx + 1}" class="form-text text-muted"></small>
              <div id="invalidFeedbackRisposta${rispostaIdx + 1}" class="invalid-feedback"></div>
          </div>
          <div class="col-md-2">
            <input id="PunteggioRisposta${rispostaIdx + 1}" type="number" class="form-control punteggioRisposta" placeholder="Pt." min = "0" required>
            <div id="invalidFeedbackPunteggioRisposta${rispostaIdx + 1}" class="invalid-feedback"></div>
          </div>
          <div class="col-md-2 d-flex align-items-center justify-content-center">
            <div class = "form-check">
            <input type="radio" class="form-check-input tipoRispostaRadio" name="corretta-${domandaIdx}" required ` + (rispostaIdx === 0 ? 'checked' : '') + `>
            <label class="ms-2 mb-0">Corretta</label>
            </div>
          </div>
          <div class="col-md-1">
            <button type="button" class="btn btn-outline-secondary shadow-none rimuoviRispostaBtn" data-toggle="tooltip" data-placement="bottom" title="Elimina Risposta"><i class="fa-solid fa-trash"></i></button>
          </div>
          </div>
        </div>
      `;
      risposteContainer.insertAdjacentHTML('beforeend', rispostaHTML);

      $('.testoRisposta').on('input', function () {
        var id = $(this).attr("id");
        var lunghezza = $(this).val().length;
        $('#charCounter' + id).text(lunghezza + ' / 40 caratteri');
        validaCampoTesto($(this), "La lunghezza massima per il testo della risposta è 40 caratteri", "Il testo della risposta è obbligatorio!", 40, $('#charCounter' + id), $('#invalidFeedback' + id));
        $('.erroreRisposte').addClass('d-none');
      });

      $('.tipoRispostaRadio').on('change', function () {
        $('.erroreRisposte').addClass('d-none');
      });

      $('.punteggioRisposta').on('input', function () {
        $('.erroreRisposte').addClass('d-none');
      });
    }

    if (e.target.closest('.rimuoviRispostaBtn') != null) {
      const domandaCard = e.target.closest('.domanda');
      const domandaIdx = domandaCard.getAttribute('data-index');
      if (e.target.closest('.rimuoviRispostaBtn')) {
        var rispostaIdx = $('.numeroRisposta' + parseInt(domandaIdx + 1)).length;
        rispostaIdx--;
        if (rispostaIdx == 0) {
          $(e.target).prevAll('hr').remove();
        }
      }
      e.target.closest('.rispostaInfo').remove();
      e.target.closest('.risposta').remove();
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    erroreDomande.classList.add('d-none');
    erroreDomande.textContent = '';

    var valid = true;

    const titoloInput = document.getElementById('titolo');
    const dataInizioInput = document.getElementById('data_inizio');
    const dataFineInput = document.getElementById('data_fine');

    if (!validaCampoTesto($('#titolo'), "La lunghezza massima per il titolo del quiz è 80 caratteri", "Il titolo del quiz è obbligatorio!", 80, $('#charCountertitolo'), $('#invalidFeedbacktitolo'))) {
      valid = false;
    }

    if (!validaDateCreaQuiz()) {
      valid = false;
    }

    const blocchiDomanda = document.querySelectorAll('.domanda');

    if (blocchiDomanda.length === 0) {
      erroreDomande.textContent = "Il quiz deve avere almeno una domanda!";
      erroreDomande.classList.remove('d-none');
      valid = false;
    }

    const domande = [];

    blocchiDomanda.forEach((blocco) => {
      const testoDomanda = blocco.querySelector('.testoDomanda');
      const risposteBlocchi = blocco.querySelectorAll('.risposta');
      const radios = blocco.querySelectorAll(`input.tipoRispostaRadio[name="corretta-${blocco.dataset.index}"]`);
      const errorRisposte = blocco.querySelector('.errorRisposte');

      errorRisposte.textContent = '';
      errorRisposte.classList.add('d-none');

      $('.testoDomanda').each(function () {
        if (!validaCampoTesto($(this), "La lunghezza massima per il testo della domanda è 80 caratteri", "Il testo della domanda è obbligatorio!", 80, $('#charCounter' + $(this).attr('id')), $('#invalidFeedback' + $(this).attr('id')))) {
          valid = false;
        }
      });

      var hasNotRisposte = risposteBlocchi.length < 2;
      if (hasNotRisposte) {
        errorRisposte.textContent = "La domanda deve avere almeno 2 risposte!";
        errorRisposte.classList.remove('d-none');
        valid = false;
      }

      if (!hasNotRisposte) {
        let indiceCorretta = -1;
        radios.forEach((radio, i) => {
          radio.classList.remove('is-invalid');
          if (radio.checked) indiceCorretta = i;
        });

        if (indiceCorretta === -1 || indiceCorretta > 1) {
          radios.forEach(radio => radio.classList.add('is-invalid'));
          errorRisposte.textContent = "La domanda deve avere esattamente una risposta corretta!";
          errorRisposte.classList.remove('d-none');
          valid = false;
        }

        const risposte = [];

        risposteBlocchi.forEach((rispostaBlocco, i) => {
          const testo = rispostaBlocco.querySelector('.testoRisposta');
          var punteggio = rispostaBlocco.querySelector('.punteggioRisposta');
          var k = 0;
          $('.testoRisposta').each(function () {
            if (!validaCampoTesto($('#Risposta' + (k + 1)), "La lunghezza massima per il testo della risposta è 40 caratteri", "Il testo della risposta è obbligatorio!", 40, $('#charCounterRisposta' + (k + 1)), $('#invalidFeedbackRisposta' + (k + 1)))) {
              valid = false;
            }
            k++;
          });

          if (isNaN(punteggio.value)) {
            punteggio.classList.add('is-invalid');
            $('invalidFeedbackPunteggioRisposta' + (i + 1)).text("Il punteggio deve essere un numero!");
            valid = false;
          }
          if (punteggio.value === '') {
            punteggio.value = 0;
          }

          const tipo = (i === indiceCorretta) ? "Corretta" : "Sbagliata";

          risposte.push({
            testo: testo.value.trim(),
            punteggio: punteggio.value.toString(),
            tipo: tipo
          });
        });

        domande.push({
          testo: testoDomanda.value.trim(),
          opzioni: risposte
        });
      }
    });

    if (!valid) {
      return;
    }

    var body = JSON.stringify({
      titolo: titoloInput.value.trim(),
      autore: 'demo',
      data_inizio: dataInizioInput.value.trim(),
      data_fine: dataFineInput.value.trim(),
      domande: domande
    });
    alert(body);

    fetch('/api/salva_quiz/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
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
          $("#alertSuccess").text("Il quiz è stato registrato con successo! Verrai rediretto alla pagina I miei quiz tra qualche secondo!");
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
        $("#invalidFeedbackdata_fine").text("La data di chiusura non può essere precedente alla data di apertura!")
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

  $('#quizModal').on('hidden.bs.modal', function () {
    resetForm();
  });

  $('#quizModal').on('shown.bs.modal', function () {
    $("#data_inizio, #data_fine").datepicker("setDate", new Date());
    validaDateCreaQuiz();
    $('#titolo').focus();
  });

  $.datepicker.setDefaults($.datepicker.regional['it']);

  $('#titolo').on('input', function () {
    var lunghezza = $(this).val().trim().length;
    if (lunghezza > 0) {
      $('#charCountertitolo').text(lunghezza + ' / 80 caratteri');
    }
    validaCampoTesto($('#titolo'), "La lunghezza massima per il titolo del quiz è 80 caratteri", "Il titolo del quiz è obbligatorio!", 80, $('#charCountertitolo'), $('#invalidFeedbacktitolo'));
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
  $('#erroreDomande').addClass('d-none');
  $('#titolo').val('');
  $('#titolo').focus();
}

