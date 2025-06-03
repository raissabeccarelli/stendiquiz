<?php
session_start();
include 'connessione.php';

if (!isset($_SESSION['username'])) {
    header('Location: login.php');
    exit;
}

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    die("ID quiz mancante o non valido.");
}

$codiceQuiz = intval($_GET['id']);

// Recupera il titolo del quiz
$sqlTitolo = "SELECT titolo FROM Quiz WHERE codice = ?";
$stmtTitolo = $conn->prepare($sqlTitolo);
$stmtTitolo->bind_param("i", $codiceQuiz);
$stmtTitolo->execute();
$resTitolo = $stmtTitolo->get_result();
$titoloQuiz = ($row = $resTitolo->fetch_assoc()) ? $row['titolo'] : "Quiz";

// Recupera le domande del quiz
$sqlDomande = "SELECT numero, testo FROM Domande WHERE quizCodice = ? ORDER BY numero";
$stmtDomande = $conn->prepare($sqlDomande);
$stmtDomande->bind_param("i", $codiceQuiz);
$stmtDomande->execute();
$resDomande = $stmtDomande->get_result();

if ($resDomande->num_rows == 0) {
    die("Nessuna domanda trovata per il quiz con codice: $codiceQuiz");
}

$domande = [];
while ($row = $resDomande->fetch_assoc()) {
    $domande[] = $row;
}
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Gioca il Quiz</title>
    <link rel="stylesheet" href="./css/stili_generali.css" type="text/css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script>
    $(function () {
        $("footer").load("footer.html");
        $.get("sidebar.html", function (data) {
            $("#menu").append(data);
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
        <h2><?php echo htmlspecialchars($titoloQuiz); ?></h2>

        <form action="valuta.php" method="POST">
            <input type="hidden" name="codice" value="<?php echo $codiceQuiz; ?>">

            <?php foreach ($domande as $domanda): ?>
                <div class="domanda">
                    <p><strong>Domanda <?php echo $domanda['numero']; ?>:</strong> <?php echo htmlspecialchars($domanda['testo']); ?></p>

                    <?php
                    $sqlRisposte = "SELECT numero, testo FROM Risposte WHERE quizCodice = ? AND domanda = ? ORDER BY RAND()";
                    $stmtRisposte = $conn->prepare($sqlRisposte);
                    $stmtRisposte->bind_param("ii", $codiceQuiz, $domanda['numero']);
                    $stmtRisposte->execute();
                    $resRisposte = $stmtRisposte->get_result();

                    if ($resRisposte->num_rows > 0):
                        while ($risposta = $resRisposte->fetch_assoc()):
                    ?>
                        <label>
                            <input type="radio" name="risposte[<?php echo $domanda['numero']; ?>]" value="<?php echo $risposta['numero']; ?>" required>
                            <?php echo htmlspecialchars($risposta['testo']); ?>
                        </label>
                    <?php
                        endwhile;
                    else:
                        echo "<p>Non ci sono risposte per questa domanda.</p>";
                    endif;
                    ?>
                </div>
            <?php endforeach; ?>
			<div class = "contenitore-centrato">	
            	<input type="submit" value="Invia le risposte">
            </div>
        </form>
        </div>
    </div>

    <footer></footer>
</body>
</html>
