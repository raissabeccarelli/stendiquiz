<?php
session_start();

if (!isset($_SESSION['username'])) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>STENDIQUIZ</title>
  <link rel="stylesheet" href="./css/stili_generali.css" type="text/css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <script>
    $(function() {
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

    function confermaEliminazione() {
      return confirm("Sei sicuro di voler eliminare questo quiz? L'azione è irreversibile.");
    }
  </script>
</head>
<body>
<?php include 'header.php'; ?>
<div class="main">
  <div id="sidebar" class="sidebar">
    <div id="menu"></div>
    <div class="selezione">
      <h3>Filtro Ricerca</h3>
      <form method="GET" action="">
        <label for="searchText">Titolo quiz</label>
        <input type="text" name="searchText" class="input-search" placeholder="Cerca quiz...">
        <label for="anno">Data inizio</label>
        <input type="number" name="annoFiltro" class="input-anno" placeholder="es. 2025" min="2000" max="2099">
        <input type="submit" value="Filtra" class="btn-filtra">
        <input type="button" value="Azzera filtri" class="btn-azzera" onclick="location.href='./imieiquiz.php'">
      </form>
    </div>
  </div>
  <div class="content">
    <h2>Ecco i quiz creati da te!</h2>
    <table id = "quizTable" class="quiz-table">
      <tr>
        <th class="sortable" data-column = "0">Titolo quiz</th>
        <th class="sortable" data-column="1">Data inizio</th>
        <th></th>
      </tr>
<?php
include 'connessione.php';
if (!$conn || $conn->connect_error) {
    die("Errore di connessione: " . $conn->connect_error);
}

$quizPerPagina = 10;
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$offset = ($page - 1) * $quizPerPagina;

$annoFiltro = isset($_GET['annoFiltro']) ? intval($_GET['annoFiltro']) : null;
$titoloFiltro = isset($_GET['searchText']) ? strtoupper(trim($_GET['searchText'])) : null;

// Conteggio totale
$countQuery = "SELECT COUNT(*) as totale FROM Quiz WHERE creatore = ?";
$countParams = [$_SESSION['username']];
$countTypes = "s";

if (!empty($annoFiltro)) {
    $countQuery .= " AND YEAR(dataInizio) = ?";
    $countParams[] = $annoFiltro;
    $countTypes .= "i";
}
if (!empty($titoloFiltro)) {
    $countQuery .= " AND UPPER(titolo) LIKE ?";
    $countParams[] = "%$titoloFiltro%";
    $countTypes .= "s";
}

$stmtCount = $conn->prepare($countQuery);
$stmtCount->bind_param($countTypes, ...$countParams);
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$totalQuiz = $resultCount->fetch_assoc()['totale'];
$totalPages = ceil($totalQuiz / $quizPerPagina);
$stmtCount->close();

// Query per paginazione
$query = "SELECT * FROM Quiz WHERE creatore = ?";
$tipi = "s";
$params = [$_SESSION['username']];

if (!empty($annoFiltro)) {
    $query .= " AND YEAR(dataInizio) = ?";
    $tipi .= "i";
    $params[] = $annoFiltro;
}

if (!empty($titoloFiltro)) {
    $query .= " AND UPPER(titolo) LIKE ?";
    $tipi .= "s";
    $params[] = "%$titoloFiltro%";
}

$query .= " ORDER BY dataInizio DESC LIMIT ? OFFSET ?";
$tipi .= "ii";
$params[] = $quizPerPagina;
$params[] = $offset;

$stmt = $conn->prepare($query);
if (!$stmt) {
    die("Errore nella query: " . $conn->error);
}
$stmt->bind_param($tipi, ...$params);
$stmt->execute();
$result = $stmt->get_result();
$totalRows = $result->num_rows;
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $dataInizio = htmlspecialchars($row['dataInizio']);
        echo "<tr>";
        echo "<td>" . htmlspecialchars($row['titolo']) . "</td>";
        echo "<td>" . date("d M Y", strtotime($dataInizio)) . "</td>";
        echo "<td class='azioni-modify'><div class='button-modify'>";
        echo "<form method='POST' action='elimina_quiz.php' onsubmit='return confermaEliminazione();'>";
        echo "<input type='hidden' name='quiz_id' value='" . $row["codice"] . "' />";
        echo "<button  type= 'button' class='stile_bottone stile-bottone-1' onclick='apriModale(" . $row["codice"] . ")'><i class=\"fa-solid fa-trash\"></i></button>";
        echo "</form>";
        echo "<form method='GET' action='modifica_quiz.php' style='display:inline-block;'>";
        echo "<input type='hidden' name='quiz_id' value='" . $row['codice'] . "'>";
        echo "<button type='submit' class='stile_bottone stile-bottone-2'><i class=\"fa-solid fa-pen\"></i></button>";
        echo "</form></div></td></tr>";
    }
} else {
    echo "<tr><td colspan='3'>Nessun quiz trovato</td></tr>";
}
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

<footer></footer>
<div id="modaleConferma" class="modale-conferma" style="display: none;">
  <div class="modale-box">
    <p>Sei sicuro di voler eliminare questo quiz? Questa azione eliminerà anche domande e risposte.</p>
    <form id="formConferma" method="POST" action="elimina_quiz.php">
      <input type="hidden" name="quiz_id" id="quizIdDaEliminare">
      <button type="submit" class="btn-conferma">Sì, elimina</button>
      <button type="button" class="btn-annulla" onclick="chiudiModale()">Annulla</button>
    </form>
  </div>
</div>
<script>
function apriModale(quizId) {
  document.getElementById('quizIdDaEliminare').value = quizId;
  document.getElementById('modaleConferma').style.display = 'flex';
}
function chiudiModale() {
  document.getElementById('modaleConferma').style.display = 'none';
}
</script>
<script>
$(document).ready(function() {
  $('.sortable').click(function() {
  	
    let table = $('#quizTable');
    let rows = table.find('tr:gt(0)').toArray(); // exclude header
    let col = $(this).data('column');
    let ascending = $(this).hasClass('asc');

    rows.sort(function(a, b) {
      let A = $(a).children('td').eq(col).text().toUpperCase();
      let B = $(b).children('td').eq(col).text().toUpperCase();

      // Try to parse as date or number, fallback to string
      let aVal = isNaN(Date.parse(A)) ? A : new Date(A);
      let bVal = isNaN(Date.parse(B)) ? B : new Date(B);

      return (aVal > bVal ? 1 : (aVal < bVal ? -1 : 0)) * (ascending ? -1 : 1);
    });

    // Toggle direction
    $('.sortable').removeClass('asc desc');
    $(this).addClass(ascending ? 'desc' : 'asc');

    // Append rows back to the table
    for (let i = 0; i < rows.length; i++) {
      table.append(rows[i]);
    }
  });
});
</script>
</body>
</html>
