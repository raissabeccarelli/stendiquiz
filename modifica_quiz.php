<?php
session_start();
include 'connessione.php';

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>STENDIQUIZ - Modifica quiz</title>
  <link rel="stylesheet" href="./css/stili_generali.css">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <script src = "./script/script.js"></script>

  <script>
    $(function(){
    	includiFile();
    });

    document.addEventListener('DOMContentLoaded', function () {
        const dataInizioInput = document.getElementById('dataInizio');
        const dataFineInput = document.getElementById('dataFine');

        const oggi = new Date().toISOString().split('T')[0];
        dataInizioInput.setAttribute('min', oggi);
        dataFineInput.setAttribute('min', oggi);

        dataInizioInput.addEventListener('change', function () {
            const inizio = dataInizioInput.value;
            dataFineInput.setAttribute('min', inizio);
            if (dataFineInput.value < inizio) {
                dataFineInput.value = inizio;
            }
        });

        document.querySelector('.modifica-quiz-form')?.addEventListener('submit', function(e) {
            let inizio = new Date(dataInizioInput.value);
            let fine = new Date(dataFineInput.value);
            if (fine < inizio) {
                alert("La data di fine non può essere precedente alla data di inizio.");
                e.preventDefault();
            }
        });
    });
    
function mostraModale(messaggio) {
  document.getElementById('testoModale').innerText = messaggio;
  document.getElementById('modaleConferma').style.display = 'flex';
}

function chiudiModale() {
  document.getElementById('modaleConferma').style.display = 'none';
}

</script>
</head>
<body>
<?php include 'header.php'; ?>

<div class="main">
  <div id="sidebar" class="sidebar" data-include = "sidebar"></div>
  <div class="content">
    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['quiz_id']) && is_numeric($_GET['quiz_id'])) {
        $quiz_id = intval($_GET['quiz_id']);
        $username = $_SESSION['username'];

        $check = $conn->prepare("SELECT titolo, dataInizio, dataFine FROM Quiz WHERE codice = ? AND creatore = ?");
        $check->bind_param("is", $quiz_id, $username);
        $check->execute();
        $result = $check->get_result();

        if ($result->num_rows == 1) {
            $quiz = $result->fetch_assoc();
    ?>
        <form class="crea-quiz-form" method="POST" action="modifica_quiz.php">
            <h2>Modifica Quiz</h2>
            <input type="hidden" name="quiz_id" value="<?php echo htmlspecialchars($quiz_id); ?>">

            <label for="quizTitle">Titolo del quiz</label>
            <input type="text" name="titolo" id="quizTitle" value="<?php echo htmlspecialchars($quiz['titolo']); ?>" required>

            <div class="date-row">
              <div class="date-group">
                <label for="dataInizio">Data di inizio</label>
                <input type="date" id="dataInizio" name="data_inizio" value="<?php echo htmlspecialchars($quiz['dataInizio']); ?>" required>
              </div>
              <div class="date-group">
                <label for="dataFine">Data di fine</label>
                <input type="date" id="dataFine" name="data_fine" value="<?php echo htmlspecialchars($quiz['dataFine']); ?>" required>
              </div>
            </div>
			<div class ="contenitore-centrato">
            	<input type="submit" value="Aggiorna Quiz" class="stile_bottone">
           	</div>
        </form>
    <?php
        } else {
            echo "<p style='color:red;'>Quiz non trovato o non sei autorizzato a modificarlo.</p>";
        }
        $check->close();
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $quiz_id = intval($_POST['quiz_id']);
        $titolo = trim($_POST['titolo']);
        $data_inizio = $_POST['data_inizio'];
        $data_fine = $_POST['data_fine'];
        $username = $_SESSION['username'];

        if ($data_fine < $data_inizio) {
            echo "<p style='color:red;'>Errore: la data di fine non può essere precedente alla data di inizio.</p>";
        } else {
            $stmt = $conn->prepare("UPDATE Quiz SET titolo = ?, dataInizio = ?, dataFine = ? WHERE codice = ? AND creatore = ?");
            $stmt->bind_param("sssds", $titolo, $data_inizio, $data_fine, $quiz_id, $username);

            if ($stmt->execute()) {
                header("Location: quizaggiornato.php");
                exit;
            } else {
                echo "<p style='color:red;'>Errore durante l'aggiornamento del quiz.</p>";
            }

            $stmt->close();
        }
    }

    $conn->close();
    ?>
  </div>
  
</div>

<footer data-include = "footer"></footer>
</body>
</html>

