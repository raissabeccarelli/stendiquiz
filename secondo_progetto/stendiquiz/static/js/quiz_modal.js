document.addEventListener('DOMContentLoaded', function () {
    const quizModalEl = document.getElementById('quizModal');
    const quizModal = new bootstrap.Modal(quizModalEl);
    const form = document.getElementById('quizForm');
    const domandeContainer = document.getElementById('domandeContainer');
    const aggiungiDomandaBtn = document.getElementById('aggiungiDomandaBtn');

    let domandaIndex = 0;

    document.addEventListener('click', function (e) {
        if (e.target.closest('#openModalLink')) {
            e.preventDefault();
            quizModal.show();
        }
    });

    if (aggiungiDomandaBtn) {
        aggiungiDomandaBtn.addEventListener('click', function () {
            const domandaHTML = `
              <div class="card mb-3 p-3 border shadow-sm">
                <div class="mb-2">
                  <label>Domanda ${domandaIndex+1}</label>
                  <input type="text" class="form-control" name="domande[${domandaIndex}][testo]" required>
                </div>
                <div class="row">
                  ${[0, 1, 2, 3].map(i => `
                    <div class="col-6 mb-2">
                      <label>Risposta ${i + 1}</label>
                      <div class="input-group">
                        <div class="input-group-text">
                          <input type="radio" name="domande[${domandaIndex}][corretta]" value="${i}" required>
                        </div>
                        <input type="text" class="form-control" name="domande[${domandaIndex}][opzioni][${i}]" required>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
            domandeContainer.insertAdjacentHTML('beforeend', domandaHTML);
            domandaIndex++;
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            const quiz = {
                titolo: formData.get('titolo'),
                autore: formData.get('autore'),
                data_inizio: formData.get('data_inizio'),
                data_fine: formData.get('data_fine'),
                domande: []
            };

            for (let i = 0; i < domandaIndex; i++) {
                const testo = formData.get(`domande[${i}][testo]`);
                const corretta = formData.get(`domande[${i}][corretta]`);
                const opzioni = [
                    formData.get(`domande[${i}][opzioni][0]`),
                    formData.get(`domande[${i}][opzioni][1]`),
                    formData.get(`domande[${i}][opzioni][2]`),
                    formData.get(`domande[${i}][opzioni][3]`)
                ];

                if (testo && corretta !== null) {
                    quiz.domande.push({
                        testo,
                        opzioni,
                        corretta: parseInt(corretta)
                    });
                }
            }

            // Qui puoi inviare il quiz + domande con AJAX o POST a una view Django o API
            console.log(quiz); // DEBUG

            // Esempio: invia come JSON con fetch
            fetch('/api/salva_quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quiz)
            })
            .then(response => {
                if (response.ok) {
                    quizModal.hide();
                    window.location.reload();
                } else {
                    alert("Errore nel salvataggio.");
                }
            });
        });
    }
});
