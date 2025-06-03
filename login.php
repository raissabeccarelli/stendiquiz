<?php
session_start();
include 'connessione.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nomeUtente = trim($_POST['nomeUtente']);

    if (!$conn || $conn->connect_error) {
        die("Errore di connessione: " . $conn->connect_error);
    }

    $stmt = $conn->prepare("SELECT * FROM Utenti WHERE nomeUtente = ?");
    if (!$stmt) {
        die("Errore nella prepare(): " . $conn->error);
    }

    $stmt->bind_param("s", $nomeUtente);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $_SESSION['username'] = $nomeUtente;
        header("Location: prova.php");
        exit;
    } else {
        $errore = "Utente non trovato";
    }
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>STENDIQUIZ - Login</title>
  <link rel="stylesheet" href="./css/stili_generali.css">
  <script src = "./script/script.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
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
   <div id = "sidebar" class="sidebar">
    <div id = "menu"></div>
    </div>
    <div class="content">
    <div class="centered-container">
      <form class="login-form" action="login.php" method="POST">
        <h2>Accedi</h2>
        <label for="nomeUtente">Nome utente</label>
        <input type="text" id="nomeUtente" name="nomeUtente" required>
        <input type="submit" value="Login">
        <?php if (isset($errore)) echo "<div class='domanda-risultato sbagliata messaggio-login'>$errore</div>"; ?>
      </form>
    </div>
    </div>
  </div>

  <footer></footer>

</body>
</html>
