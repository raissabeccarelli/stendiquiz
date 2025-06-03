<?php
	session_start();
	$annoQuiz = isset($_GET['annoFiltro']) ? intval($_GET['annoFiltro']) : null;
	$titoloQuiz = (isset($_GET['searchText']) && !empty($_GET['searchText'])) ? $_GET['searchText'] : null;
    $quizAttivi = $_GET['attivi'];
	$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
	$limit = 10;
	$offset = ($page - 1) * $limit;
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <meta charset="UTF-8">
  <title>STENDIQUIZ</title>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <script src = "./script/script.js"></script>
  <link rel="stylesheet" href="./css/stili_generali.css" type="text/css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<script>
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
    	<div class="selezione">
        <h3>Filtro Ricerca</h3>
       <form method="GET" action="">
          <label for="searchText">Titolo quiz</label>
          <input type="text" class="input-search" placeholder="Cerca quiz..." id="searchText" <?php if(isset($titoloQuiz)) { echo("value =\"". htmlspecialchars($titoloQuiz). "\"");}?>>
          <label for="anno">Anno di inizio</label>
          <input type="number" class="input-anno" placeholder="es. 2025" min="2000" max="2099" id="annoQuiz" <?php if(isset($annoQuiz)) { echo("value =\"". $annoQuiz."\"");}?>>
          <input type="checkbox" id="quizAttivi" name = "attivi" <?php if($quizAttivi) { echo("checked =\"\"");}?>>Mostra i quiz attivi
          <input type="submit" value="Filtra" class="btn-filtra" onclick = "costruisciQueryString()">
          <input type="button" value="Azzera filtri" class="btn-azzera" onclick="location.href=getPathFromUrl(window.location.href)">
        </form>
      </div>
    </div> 
    <div class="content">
      <h2>Benvenuto su Stendiquiz!</h2>
     <table class="quiz-table" id="quizTable">
  <tr>
    <th class="sortable" data-column="0">Titolo quiz</th>
    <th class="sortable" data-column="1">Data inizio</th>
    <th class="sortable" data-column="2">Data fine</th>
    <th></th>

  </tr>
	<?php
		include 'connessione.php';
        $sql = "SELECT * FROM Quiz";
        $whereClauses = [];
        $params = [];
        $types = "";
        // Pulizia input
        if(isset($annoQuiz)){
         	$sanitized_annoQuiz = mysqli_real_escape_string($conn, $annoQuiz); 
            $whereClauses[] = "YEAR(dataInizio) = ?";
            $params[] = $sanitized_annoQuiz;
            $types .= "i";
        }
        
        if(isset($titoloQuiz)) {
            $sanitized_titoloQuiz = mysqli_real_escape_string($conn, strtoupper($titoloQuiz));
            $whereClauses[] = "UPPER(titolo) LIKE ?";
            $params[] = "%".$sanitized_titoloQuiz. "%";
            $types .= "s";
        }
        
        if($quizAttivi){
        	$whereClauses[] = "dataInizio <= NOW() AND dataFine >= NOW()";
        }
        
        if (!empty($whereClauses)) {
             $sql .= " WHERE " . implode(" AND ", $whereClauses);
        }

        // Aggiunta paginazione alla query principale
        $sqlConteggio = str_replace("SELECT *", "SELECT COUNT(*)", $sql);
        $sql .= " LIMIT $limit OFFSET $offset";
        
        $stmtConteggio = $conn -> prepare($sqlConteggio);
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
       $stmtConteggio->execute();
       $stmtConteggio->bind_result($totalRows);
       $stmtConteggio->fetch();
       $totalPages = ceil($totalRows / $limit);

       if ($totalRows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $dataInizio = $row['dataInizio'];
                    $dataFine = $row['dataFine'];
                    $titolo = htmlspecialchars($row['titolo']);
                    $oggi = date('Y-m-d');
                    $attivo = ($oggi >= $dataInizio && $oggi <= $dataFine);
                    echo "<tr>";
                    echo "<td>$titolo</td>";
                    echo "<td>" . date("d M Y", strtotime($dataInizio)) . "</td>";
                    echo "<td>" . date("d M Y", strtotime($dataFine)) . "</td>";
                    if ($attivo) {
                        echo "<td class='azioni'><input type='submit' value='GIOCA' onclick='location.href=\"gioca.php?id=" . $row["codice"] . "\"' /></td>";
                    } else {
                        echo "<td class='azioni'><input type='button' value='N/D' disabled class = 'btn-non-disponibile'/></td>";
                    }
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='4'>Nessun quiz trovato</td></tr>";
            }
            $stmt->close();
            $stmtConteggio->close();
            ?>
            </table>
			<div class = "totale-quiz-container">
            	<span class = "totale-quiz"> Totale quiz: <?php echo $totalRows; ?> </span>
            </div>
            <!-- Navigazione pagine -->
            <div class= "pagination">
            <?php
            for ($i = 1; $i <= $totalPages; $i++) {
                $isActive = ($i == $page) ? "class = 'pagination-button'": "class = 'pagination-button active'";
                $queryString = http_build_query(array_merge($_GET, ['page' => $i]));
                echo "<a " .$isActive ." href='./prova.php?" . $queryString . "'> $i </a> ";
            }
            ?>
            </div>

    </div>
  </div>

  <footer data-include = "footer"></footer>
  
<script>
$(document).ready(function() {
  $('.sortable').click(function() {
    let table = $('#quizTable');
    let rows = table.find('tr:gt(0)').toArray(); 
    let col = $(this).data('column');
    let ascending = $(this).hasClass('asc');

    rows.sort(function(a, b) {
      let A = $(a).children('td').eq(col).text().toUpperCase();
      let B = $(b).children('td').eq(col).text().toUpperCase();

      let aVal = isNaN(Date.parse(A)) ? A : new Date(A);
      let bVal = isNaN(Date.parse(B)) ? B : new Date(B);

      return (aVal > bVal ? 1 : (aVal < bVal ? -1 : 0)) * (ascending ? -1 : 1);
    });

    $('.sortable').removeClass('asc desc');
    $(this).addClass(ascending ? 'desc' : 'asc');

    for (let i = 0; i < rows.length; i++) {
      table.append(rows[i]);
    }
  });
});
</script>

</body>
</html>