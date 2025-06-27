<?php
session_start();
include("connessione.php");

if (!isset($_SESSION['username'])) {
    header("Location: login.php?error=not_logged_in");
    exit();
}

$creatore = $_SESSION['username'];

if (!isset($_POST['quizTitle'], $_POST['numeroDomande'], $_POST['dataInizio'], $_POST['dataFine'])) {
    die("Dati mancanti.");
}

$titolo = trim($_POST['quizTitle']);
$numeroDomande = intval($_POST['numeroDomande']);
$dataInizio = $_POST['dataInizio'];
$dataFine = $_POST['dataFine'];

if ($numeroDomande <= 0 || $numeroDomande > 20 || empty($titolo)) {
    die("Dati del quiz non validi.");
}

if (strtotime($dataFine) < strtotime($dataInizio)) {
    die("Errore: la data di fine deve essere successiva alla data di inizio.");
}

$stmt = $conn->prepare("INSERT INTO Quiz (creatore, titolo, dataInizio, dataFine) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $creatore, $titolo, $dataInizio, $dataFine);
$stmt->execute();
$quiz_id = $conn->insert_id;
$stmt->close();

for ($i = 1; $i <= $numeroDomande; $i++) {
    $testo_domanda = trim($_POST["question$i"]);

    $stmt = $conn->prepare("INSERT INTO Domande (numero, quizCodice, testo) VALUES (?, ?, ?)");
    if (!$stmt) {
    die("Errore prepare Domande: " . $conn->error);
	}
    $stmt->bind_param("iis", $i, $quiz_id, $testo_domanda);
    if (!$stmt->execute()) {
    die("Errore execute Domande: " . $stmt->error);
	}
    $stmt->close();

    $risposte = ['a', 'b', 'c', 'd'];
    $corretta = $_POST["correctAnswer$i"];
    $numeroRisposta = 1;

    foreach ($risposte as $lettera) {
        $testo_risposta = trim($_POST["answer{$i}{$lettera}"]);
        $tipo = ($lettera === $corretta) ? 'Corretta' : 'Sbagliata';
        $punteggio = ($lettera === $corretta) ? 1 : 0;

        $stmt = $conn->prepare("INSERT INTO Risposte (domanda, quizCodice, numero, testo, tipoRisposta, punteggio) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iiissi", $i, $quiz_id, $numeroRisposta, $testo_risposta, $tipo, $punteggio);
        $stmt->execute();
        $stmt->close();

        $numeroRisposta++;
    }
}

$conn->close();
header("Location: prova.php");
exit();
?>
