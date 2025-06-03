<?php
session_start();
include 'connessione.php'; 

// Controlla se l'utente è loggato
if (!isset($_SESSION['username'])) {
    header('Location: login.php');
    exit;
}

// Controlla se i dati sono stati inviati tramite POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: prova.php');
    exit;
}

// Valida i dati ricevuti
if (!isset($_POST['codice']) || !is_numeric($_POST['codice']) || !isset($_POST['risposte']) || !is_array($_POST['risposte'])) {
    die("Errore: Dati del quiz mancanti o corrotti.");
}

$codiceQuiz = intval($_POST['codice']);
$risposteUtente = $_POST['risposte']; 
$nomeUtente = $_SESSION['username'];
$dataPartecipazione = date('Y-m-d'); 

$conn->begin_transaction();

try {
    $sqlPartecipazione = "INSERT INTO Partecipazioni (nomeUtente, quizCodice, data) VALUES (?, ?, ?)";
    $stmtPartecipazione = $conn->prepare($sqlPartecipazione);
    if (!$stmtPartecipazione) {
        throw new Exception("Errore nella preparazione SQL per Partecipazioni: " . $conn->error);
    }
    $stmtPartecipazione->bind_param("sis", $nomeUtente, $codiceQuiz, $dataPartecipazione);
    $stmtPartecipazione->execute();

    if ($stmtPartecipazione->affected_rows > 0) {
        $codicePartecipazione = $conn->insert_id; 
    } else {
        throw new Exception("Impossibile registrare la partecipazione: " . $stmtPartecipazione->error);
    }
    $stmtPartecipazione->close();

    $sqlRispostaUtente = "INSERT INTO RispostaUtenteQuiz (partecipazione, codiceQuiz, codiceDomanda, codiceRisposta) VALUES (?, ?, ?, ?)";
    $stmtRispostaUtente = $conn->prepare($sqlRispostaUtente);
    if (!$stmtRispostaUtente) {
        throw new Exception("Errore nella preparazione SQL per RispostaUtenteQuiz: " . $conn->error);
    }

    foreach ($risposteUtente as $codiceDomanda => $codiceRisposta) {
        $dom = intval($codiceDomanda);
        $risp = intval($codiceRisposta);
        $stmtRispostaUtente->bind_param("iiii", $codicePartecipazione, $codiceQuiz, $dom, $risp);
        $stmtRispostaUtente->execute();
        if ($stmtRispostaUtente->affected_rows <= 0) {
            throw new Exception("Impossibile salvare la risposta per la domanda $dom: " . $stmtRispostaUtente->error);
        }
    }
    $stmtRispostaUtente->close();

    $conn->commit();

} catch (Exception $e) {
    $conn->rollback();
    die("Si è verificato un errore durante il salvataggio dei risultati: " . $e->getMessage() . ". Si prega di riprovare.");
}


// Recupera il titolo del quiz
$sqlTitolo = "SELECT titolo FROM Quiz WHERE codice = ?";
$stmtTitolo = $conn->prepare($sqlTitolo);
$stmtTitolo->bind_param("i", $codiceQuiz);
$stmtTitolo->execute();
$resTitolo = $stmtTitolo->get_result();
$titoloQuiz = "Risultati Quiz"; // Titolo di default
if ($rowTitolo = $resTitolo->fetch_assoc()) {
    $titoloQuiz = $rowTitolo['titolo'];
}
$stmtTitolo->close();

// Recupera tutte le domande e le risposte corrette per questo quiz
$sqlDettagliQuiz = "
    SELECT d.numero AS numeroDomanda, d.testo AS testoDomanda,
           r.numero AS numeroRispostaCorretta, r.testo AS testoRispostaCorretta,
           ruq.codiceRisposta AS numeroRispostaUtente
    FROM Domande d
    JOIN Risposte r ON d.quizCodice = r.quizCodice AND d.numero = r.domanda AND r.tipoRisposta = 'Corretta'
    LEFT JOIN RispostaUtenteQuiz ruq ON d.quizCodice = ruq.codiceQuiz AND d.numero = ruq.codiceDomanda AND ruq.partecipazione = ?
    WHERE d.quizCodice = ?
    ORDER BY d.numero
";

$stmtDettagli = $conn->prepare($sqlDettagliQuiz);
if (!$stmtDettagli) {
    die("Errore nella preparazione SQL per i dettagli del quiz: " . $conn->error);
}
$stmtDettagli->bind_param("ii", $codicePartecipazione, $codiceQuiz);
$stmtDettagli->execute();
$resDettagli = $stmtDettagli->get_result();

$risultatiFinali = [];
$punteggio = 0;
$totaleDomande = 0;

while ($row = $resDettagli->fetch_assoc()) {
    $totaleDomande++;
    $rispostaUtenteScelta = $row['numeroRispostaUtente'];

    $testoRispostaUtente = "Non risposta";
    if ($rispostaUtenteScelta !== null) {
        $sqlTestoRispostaData = "SELECT testo FROM Risposte WHERE quizCodice = ? AND domanda = ? AND numero = ?";
        $stmtTestoData = $conn->prepare($sqlTestoRispostaData);
        $stmtTestoData->bind_param("iii", $codiceQuiz, $row['numeroDomanda'], $rispostaUtenteScelta);
        $stmtTestoData->execute();
        $resTestoData = $stmtTestoData->get_result();
        if ($rowTestoData = $resTestoData->fetch_assoc()) {
            $testoRispostaUtente = $rowTestoData['testo'];
        }
        $stmtTestoData->close();
    }


    $isCorrect = ($rispostaUtenteScelta == $row['numeroRispostaCorretta']);
    if ($isCorrect) {
        $punteggio++;
    }
    $risultatiFinali[] = [
        'numeroDomanda' => $row['numeroDomanda'],
        'testoDomanda' => $row['testoDomanda'],
        'testoRispostaUtente' => $testoRispostaUtente,
        'testoRispostaCorretta' => $row['testoRispostaCorretta'],
        'isCorrect' => $isCorrect
    ];
}
$stmtDettagli->close();
if ($resDettagli->num_rows === 0 && count($risposteUtente) > 0) {
    $totaleDomande = count($risposteUtente);
}


?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Risultati del Quiz: <?php echo htmlspecialchars($titoloQuiz); ?></title>
    <link rel="stylesheet" href="./css/stili_generali.css" type="text/css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
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
            <h2>Risultati per il Quiz "<?php echo htmlspecialchars($titoloQuiz); ?>"</h2>
            <p>Grazie per aver partecipato, <?php echo htmlspecialchars($_SESSION['username']); ?>!</p>
            <p>La tua partecipazione è stata registrata con il codice <strong><?php echo $codicePartecipazione; ?></strong></p>

            <h3>Punteggio: <?php echo $punteggio; ?> / <?php echo $totaleDomande; ?></h3>
            <hr>

            <h4>Dettaglio delle risposte</h4>

            <?php if (empty($risultatiFinali) && $totaleDomande > 0): ?>
                <p>Non è stato possibile caricare il dettaglio delle risposte. Potrebbe non esserci nessuna risposta marcata come corretta per questo quiz nel database.</p>
            <?php elseif (empty($risultatiFinali) && $totaleDomande == 0): ?>
                 <p>Questo quiz non sembra avere domande.</p>
            <?php else: ?>
                <?php foreach ($risultatiFinali as $risultato): ?>
                    <div class="domanda-risultato <?php echo $risultato['isCorrect'] ? 'corretta' : 'sbagliata'; ?>">
                        <p><strong>Domanda <?php echo htmlspecialchars($risultato['numeroDomanda']); ?>:</strong> <?php echo htmlspecialchars($risultato['testoDomanda']); ?></p>
                        <p class="la-tua-risposta">La tua risposta: <?php echo htmlspecialchars($risultato['testoRispostaUtente']); ?></p>
                        <?php if (!$risultato['isCorrect']): ?>
                            <p class="risposta-corretta-testo">Risposta corretta: <?php echo htmlspecialchars($risultato['testoRispostaCorretta']); ?></p>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
            
            <div class = "contenitore-centrato">
            	<input type="button" value="Torna alla Home" class="stile_bottone" onclick="location.href='prova.php'">
        	</div>
        </div>
    </div>

    <footer></footer>
</body>
</html>
<?php
$conn->close();
?>