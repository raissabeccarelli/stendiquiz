<?php
session_start();

if (!isset($_SESSION['username'])) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>STENDIQUIZ - Crea il tuo quiz</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./css/stili_generali.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<script>
$(function() {
  $("footer").load("footer.html");
  $.get("sidebar.html", function (data) {
    $("#menu").append(data);

    // Evidenzia il link attivo dopo il caricamento
    const currentPage = window.location.pathname.split("/").pop();
    $('#menu a').each(function () {
      const linkPage = $(this).attr('href').split("/").pop();
      if (linkPage === currentPage) {
        $(this).addClass('attivo');
      }
    });
  });
});
</script>

</head>
<body>

  <?php include 'header.php'; ?>

  <div class="main">
    <div id="sidebar" class="sidebar"> 
      <div id="menu"></div>
    </div>
    <div class="content">
        <form class="crea-quiz-form" action="salva_quiz.php" method="POST">
           <h2>Crea il tuo quiz</h2>

        <label for="quizTitle">Titolo quiz</label>
        <input type="text" id="quizTitle" name="quizTitle" placeholder = "es. Quiz di Matematica" required>

        <div class="date-row">
          <div class="date-group">
            <label for="dataInizio">Data inizio</label>
            <input type="date" id="dataInizio" name="dataInizio" min = "2020-01-01" required>
          </div>
          <div class="date-group">
            <label for="dataFine">Data fine</label>
            <input type="date" id="dataFine" name="dataFine" required max="2099-12-31">
          </div>
        </div>
        <label for="numeroDomande">Numero domande</label>
        <input type="number" id="numeroDomande" name="numeroDomande" min="1" max="20" value="1" required>
        
        <div class = "contenitore-centrato">
        	<button type="button" onclick="aggiornaDomande()" class="stile_bottone btn-genera">
            	Genera domande
          	</button>
		</div>
        <div id="domandeContainer"></div>
		<div class = "contenitore-centrato">
        	<input type="submit" id="submitQuiz" value="Salva quiz" class="stile_bottone">
        </div>
      </form>
    </div>
  </div>

  <footer></footer>
  
  <div id="modaleConferma" class="modale-conferma" style="display: none;">
    <div class="modale-box">
      <p id="testoModale">Inserisci un numero valido di domande.</p>
      <button type="button" class="btn-conferma" onclick="chiudiModale()">OK</button>
    </div>
  </div>
  
  
<script>
document.addEventListener('DOMContentLoaded', function () {
  const submitBtn = document.getElementById('submitQuiz');
  submitBtn.style.display = 'none';

  const dataInizioInput = document.getElementById('dataInizio');
  const dataFineInput = document.getElementById('dataFine');

  const oggi = new Date().toISOString().split('T')[0];
  dataInizioInput.setAttribute('min', oggi);
  dataFineInput.setAttribute('min', oggi);
  dataFineInput.setAttribute('max', '2099-12-31');

  dataInizioInput.addEventListener('change', function () {
    const inizio = dataInizioInput.value;
    dataFineInput.setAttribute('min', inizio);
    dataFineInput.setAttribute('max', '2099-12-31');

    if (dataFineInput.value < inizio) {
      dataFineInput.value = inizio;
    }
  });

      window.aggiornaDomande = function () {
        const numeroDomande = parseInt(document.getElementById('numeroDomande').value, 10);
        const container = document.getElementById('domandeContainer');
        container.innerHTML = '';

        if (numeroDomande > 20) {
          mostraModale("Puoi creare al massimo 20 domande.");
          document.getElementById('numeroDomande').value = 20;
          return;
        }
        if (numeroDomande < 1 || isNaN(numeroDomande)) {
          mostraModale("Devi creare almeno 1 domanda.");
          document.getElementById('numeroDomande').value = 1;
          return;
        }

        for (let i = 1; i <= numeroDomande; i++) {
          const domandaHTML = `
            <div class="domanda-container">
              <h3>Domanda ${i}</h3>
              <label for="question${i}">Domanda</label>
              <div class="input-wrapper">
                <input type="text" id="question${i}" name="question${i}" required maxlength="200">
                <span class="counter" id="counterQ${i}">0 / 200</span>
              </div>
              ${['a', 'b', 'c', 'd'].map(lettera => `
                <label for="answer${i}${lettera}">Risposta ${lettera.toUpperCase()}</label>
                <div class="input-wrapper">
                  <input type="text" id="answer${i}${lettera}" name="answer${i}${lettera}" required maxlength="100">
                  <span class="counter" id="counter${i}${lettera}">0 / 100</span>
                </div>
              `).join('')}
              <label for="correctAnswer${i}">Risposta corretta</label>
              <select id="correctAnswer${i}" name="correctAnswer${i}" required>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </div>
          `;
          container.innerHTML += domandaHTML;
        }

        for (let i = 1; i <= numeroDomande; i++) {
          const questionInput = document.getElementById(`question${i}`);
          const questionCounter = document.getElementById(`counterQ${i}`);
          questionInput.addEventListener('input', function () {
            questionCounter.textContent = `${questionInput.value.length} / 200`;
          });

          ['a', 'b', 'c', 'd'].forEach(lettera => {
            const rispostaInput = document.getElementById(`answer${i}${lettera}`);
            const rispostaCounter = document.getElementById(`counter${i}${lettera}`);
            rispostaInput.addEventListener('input', function () {
              rispostaCounter.textContent = `${rispostaInput.value.length} / 100`;
            });
          });
        }

        submitBtn.style.display = 'inline-block';
      };
  


});


function mostraModale(messaggio) {
  document.getElementById('testoModale').innerText = messaggio;
  document.getElementById('modaleConferma').style.display = 'flex';
}

function chiudiModale() {
  document.getElementById('modaleConferma').style.display = 'none';
}
</script>

</body>
</html>
