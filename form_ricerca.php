<?php session_start();
	$annoQuiz = isset($_GET['annoFiltro']) ? intval($_GET['annoFiltro']) : null;
	$titoloQuiz = (isset($_GET['searchText']) && !empty($_GET['searchText'])) ? $_GET['searchText'] : null;
    $quizAttivi = $_GET['attivi'];
	$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $dataPartecipazione = (isset($_GET['dataPartecipazione']) && !empty($_GET['dataPartecipazione'])) ? $_GET['dataPartecipazione'] : null;
    $esitoQuiz = (isset($_GET['esito']) && !empty($_GET['esito'])) ? $_GET['esito'] : null;
?>

<div class="selezione">
  <h3>Ricerca</h3>
  <form method="GET" action="">
    <label for="searchText">Titolo quiz</label>
    <input type="text" class="input-search" placeholder="Cerca quiz..." id="searchText" <?php if(isset($titoloQuiz)) { echo("value =\"". htmlspecialchars($titoloQuiz). "\"");}?>>
   	<div class="date-group">
        <label for="data">Data di partecipazione</label>
        <input id = "dataPartecipazione" type="date" value="<?php if($data){echo(htmlspecialchars($data));}?> ">
        <label for="esito">Esito</label>
		<select id="esitoQuiz">
  			<option value="">-- Seleziona --</option>
  			<option value="superato">Superato</option>
  			<option value="non_superato">Non superato</option>
		</select>
      	</div>"
      );}
      ?>
    <input type="submit" value="Filtra" class="btn-filtra" onclick = "costruisciQueryString()">
    <input type="button" value="Azzera filtri" class="btn-azzera" onclick="location.href=getPathFromUrl(window.location.href)">
  </form>
</div>

<?php 
  	$sql = "SELECT 
              q.titolo AS titolo_quiz,
              p.data AS data_esecuzione,
              SUM(CASE WHEN r.punteggio = 1 THEN 1 ELSE 0 END) AS risposte_corrette,
              COUNT(*) AS risposte_totali
          FROM Partecipazioni p
          JOIN Quiz q ON p.quizCodice = q.codice
          JOIN RispostaUtenteQuiz ruq ON p.codice = ruq.partecipazione
          JOIN Risposte r 
            ON r.quizCodice = ruq.codiceQuiz 
            AND r.domanda = ruq.codiceDomanda 
            AND r.numero = ruq.codiceRisposta";
  $utente = $conn->real_escape_string($_SESSION['username']);
  $whereClauses = [];
  $params = [];
  $types = "";
  // Pulizia input
  if(basename(__FILE__) == "statistiche.php") {
  	   $whereClauses = "WHERE nomeUtente = ?";
       $params[] = $utente;
       $types .= "s";
  }

  if(isset($titoloQuiz)) {
    $sanitized_titoloQuiz = mysqli_real_escape_string($conn, strtoupper($titoloQuiz));
    $whereClauses[] = "UPPER(titolo) LIKE ?";
    $params[] = "%".$sanitized_titoloQuiz. "%";
    $types .= "s";
  }

  if(isset($dataPartecipazione)) {
  	$whereClauses[] = "data_esecuzione = ?";
    $params[] = $dataPartecipazione;
    $types .= "s";
  }
  
  if($esitoQuiz){
  	if($esitoQuiz == "superato"){
    	$whereClauses[] = "(risposte_corrette / risposte_totali) >= 0.6";
    }
    else {
    	$whereClauses[] = "(risposte_corrette / risposte_totali) < 0.6";
    }
  }

  if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
  }
  
  $stmt = $conn->prepare($sql);
  if($stmt == false || $stmtConteggio == false) {
    die("Errore nella preparazione: " . $conn->error);
  }
  if($params) {
    $stmt->bind_param($types, ...$params);
    $stmtConteggio -> bind_param($types, ...$params);
  }
  $stmt->execute();
  $result = $stmt->get_result();
?>

