<?php
session_start();
include 'connessione.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = trim($_POST['nome']);
    $cognome = trim($_POST['cognome']);
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);

    if (!$conn || $conn->connect_error) {
        die("Errore di connessione: " . $conn->connect_error);
    }

    // Verifica che il nomeUtente non sia già presente
    $check = $conn->prepare("SELECT * FROM Utenti WHERE nomeUtente = ?");
    $check->bind_param("s", $username);
    $check->execute();
    $checkResult = $check->get_result();

    if ($checkResult->num_rows > 0) {
        $errore = "Utente già registrato";
    } else {
        $stmt = $conn->prepare("INSERT INTO Utenti (nomeUtente, nome, cognome, eMail) VALUES (?, ?, ?, ?)");
        if (!$stmt) {
            die("Errore prepare(): " . $conn->error);
        }
        $stmt->bind_param("ssss", $username, $nome, $cognome, $email);
        if ($stmt->execute()) {
            $_SESSION['username'] = $username;
            header("Location: prova.php");
            exit;
        } else {
            $errore = "Errore nella registrazione.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>STENDIQUIZ - Registrazione</title>
  <link rel="stylesheet" href="./css/stili_generali.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <script src = "./script/script.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <script>
 	$(function(){
 		$("footer").load("footer.html"); 
 	});
 		
       $(function() {
        	 includiFile();
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

  <?php
    	include 'header.php';
  ?>

  <div class="main">
  <div id="sidebar" class="sidebar">
  <div id="menu"></div>
  </div>
  	<div class="content">
    <div class="centered-container">
      <form class="register-form" action="registrazione.php" method="POST">
        <h2>Registrazione</h2>
        <label for="nome">Nome</label>
        <input type="text" id="nome" name="nome" required>

        <label for="cognome">Cognome</label>
        <input type="text" id="cognome" name="cognome" required>

        <label for="username">Username</label>
        <input type="text" id="username" name="username" required>

        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
        <input type="submit" value="Registrati">
        <?php if (isset($errore)) echo "<div class='domanda-risultato sbagliata messaggio-login'>$errore</div>"; ?>
      </form>
    </div>
    </div>
</div>
  <footer></footer>

</body>
</html>
