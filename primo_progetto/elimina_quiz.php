<?php
session_start();
include 'connessione.php';

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['quiz_id']) && is_numeric($_POST['quiz_id'])) {
    $quiz_id = intval($_POST['quiz_id']);
    $username = $_SESSION['username'];

    // Verifica che il quiz appartenga all'utente
    $check = $conn->prepare("SELECT codice FROM Quiz WHERE codice = ? AND creatore = ?");
    $check->bind_param("is", $quiz_id, $username);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        // Elimina le risposte
        $conn->query("DELETE FROM Risposte WHERE quizCodice = $quiz_id");

        // Elimina le domande
        $conn->query("DELETE FROM Domande WHERE quizCodice = $quiz_id");

        // Elimina il quiz
        $stmt = $conn->prepare("DELETE FROM Quiz WHERE codice = ?");
        $stmt->bind_param("i", $quiz_id);
        $stmt->execute();

        header("Location: imieiquiz.php");
    } else {
        echo "Non sei autorizzato a eliminare questo quiz.";
    }

    $check->close();
    $conn->close();
} else {
    echo "Richiesta non valida.";
}

header("Location: prova.php"); 
exit;
?>
