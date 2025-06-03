<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Quiz aggiornato</title>
    <meta http-equiv="refresh" content="3;url=prova.php">
    <link rel="stylesheet" href="./css/stili_generali.css" type="text/css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script>
 		$(function(){
 			$("footer").load("footer.html");
             $.get("sidebar.html", function (data) {
                    $("#menu").append(data);
                });
 		});
	</script>
</head>
<body>
	<?php
    	include 'header.php';
    ?>
    <div class="box">
        <h2>Quiz aggiornato con successo!</h2>
        <p>Verrai reindirizzato automaticamente alla pagina principale tra 3 secondi...</p>
        <p><a href="prova.php">Clicca qui</a> se non vieni reindirizzato automaticamente.</p>
    </div>
    <footer></footer>
</body>
</html>