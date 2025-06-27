<?php
session_start();
include("connessione.php");

if (!isset($_SESSION['username'])) {
    header('Location: login.php');
    exit;
}

$utente = $_SESSION['username'];
$titoloQuiz = isset($_GET['searchText']) ? trim($_GET['searchText']) : '';
$dataPartecipazione = isset($_GET['dataPartecipazione']) ? $_GET['dataPartecipazione'] : '';
$esitoQuiz = isset($_GET['esito']) ? $_GET['esito'] : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = 10;
$offset = ($page - 1) * $limit;

// Costruzione della query principale
$sql = "
    SELECT 
        q.titolo AS titolo_quiz,
        p.data AS data_esecuzione,
        SUM(CASE WHEN r.punteggio = 1 THEN 1 ELSE 0 END) AS risposte_corrette,
        COUNT(*) AS risposte_totali
    FROM Partecipazioni p
    JOIN Quiz q ON p.quizCodice = q.codice
    JOIN RispostaUtenteQuiz ruq ON p.codice = ruq.partecipazione
    JOIN Risposte r ON r.quizCodice = ruq.codiceQuiz 
                   AND r.domanda = ruq.codiceDomanda 
                   AND r.numero = ruq.codiceRisposta
    WHERE p.nomeUtente = ?
";

$params = [$utente];
$types = 's';

if (!empty($titoloQuiz)) {
    $sql .= " AND UPPER(q.titolo) LIKE ?";
    $params[] = '%' . strtoupper($titoloQuiz) . '%';
    $types .= 's';
}

if (!empty($dataPartecipazione)) {
    $sql .= " AND DATE(p.data) = ?";
    $params[] = $dataPartecipazione;
    $types .= 's';
}

$sql .= " GROUP BY p.codice, q.titolo, p.data";

if ($esitoQuiz === 'superato') {
    $sql .= " HAVING (SUM(CASE WHEN r.punteggio = 1 THEN 1 ELSE 0 END) / COUNT(*)) >= 0.6";
} elseif ($esitoQuiz === 'non_superato') {
    $sql .= " HAVING (SUM(CASE WHEN r.punteggio = 1 THEN 1 ELSE 0 END) / COUNT(*)) < 0.6";
}

$sql .= " ORDER BY p.data DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;
$types .= 'ii';

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    die("Errore nella preparazione della query: " . $conn->error);
}
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

// Calcolo del numero totale di risultati per la paginazione
$sqlConteggio = "
    SELECT COUNT(*) as totale
    FROM (
        SELECT p.codice
        FROM Partecipazioni p
        JOIN Quiz q ON p.quizCodice = q.codice
        JOIN RispostaUtenteQuiz ruq ON p.codice = ruq.partecipazione
        JOIN Risposte r ON r.quizCodice = ruq.codiceQuiz 
                       AND r.domanda = ruq.codiceDomanda 
                       AND r.numero = ruq.codiceRisposta
        WHERE p.nomeUtente = ?
";

$paramsConteggio = [$utente];
$typesConteggio = 's';

if (!empty($titoloQuiz)) {
    $sqlConteggio .= " AND UPPER(q.titolo) LIKE ?";
    $paramsConteggio[] = '%' . strtoupper($titoloQuiz) . '%';
    $typesConteggio .= 's';
}

if (!empty($dataPartecipazione)) {
    $sqlConteggio .= " AND DATE(p.data) = ?";
    $paramsConteggio[] = $dataPartecipazione;
    $typesConteggio .= 's';
}

$sqlConteggio .= " GROUP BY p.codice, q.titolo, p.data";

if ($esitoQuiz === 'superato') {
    $sqlConteggio .= " HAVING (SUM(CASE WHEN r.punteggio = 1 THEN 1 ELSE 0 END) / COUNT(*)) >= 0.6";
} elseif ($esitoQuiz === 'non_superato') {
    $sqlConteggio .= " HAVING (SUM(CASE WHEN r.punteggio = 1 THEN 1 ELSE 0 END) / COUNT(*)) < 0.6";
}

$sqlConteggio .= "
    ) as subquery
";

$stmtConteggio = $conn->prepare($sqlConteggio);
if ($stmtConteggio === false) {
    die("Errore nella preparazione della query di conteggio: " . $conn->error);
}
$stmtConteggio->bind_param($typesConteggio, ...$paramsConteggio);
$stmtConteggio->execute();
$resultConteggio = $stmtConteggio->get_result();
$rowConteggio = $resultConteggio->fetch_assoc();
$totalRows = $rowConteggio['totale'];
$totalPages = ceil($totalRows / $limit);
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Statistiche Quiz</title>
    <link rel="stylesheet" href="./css/stili_generali.css" type="text/css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="./script/script.js"></script>
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
                    <input type="text" name="searchText" class="input-search" placeholder="Cerca quiz..." id="searchText" value="<?php echo htmlspecialchars($titoloQuiz); ?>">
                    <label for="dataPartecipazione">Data di partecipazione</label>
                    <input id="dataPartecipazione" name="dataPartecipazione" type="date" value="<?php echo htmlspecialchars($dataPartecipazione); ?>">
                    <label for="esito">Esito</label>
                    <select id="esitoQuiz" name="esito">
                        <option value="">-- Seleziona --</option>
                        <option value="superato" <?php if ($esitoQuiz == "superato") echo "selected"; ?>>Superato</option>
                        <option value="non_superato" <?php if ($esitoQuiz == "non_superato") echo "selected"; ?>>Non superato</option>
                    </select>
                    <input type="submit" value="Filtra" class="btn-filtra">
                    <input type="button" value="Azzera filtri" class="btn-azzera" onclick="location.href='statistiche.php'">
                </form>
            </div>
        </div>
        <div class="content">
            <h2>Statistiche</h2>
            <div class='statistiche'>
                <?php
                if ($totalRows > 0) {
                    echo "<h4>" . htmlspecialchars($utente) . " hai partecipato a " . $totalRows . " quiz";
                    if (!empty($dataPartecipazione)) {
                        echo " il giorno " . date('d/m/Y', strtotime($dataPartecipazione));
                    }
                    echo "</h4>";
                }
                ?>
            </div>
            <table class="quiz-table" id="quizTable">
                <tr>
                    <th class="sortable" data-column="0">Titolo Quiz</th>
                    <th class="sortable" data-column="1">Data Esecuzione</th>
                    <th class="sortable" data-column="2">Punteggio</th>
                </tr>
                <?php
                if ($totalRows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        echo "<tr>
                                <td>" . htmlspecialchars($row['titolo_quiz']) . "</td>
                                <td>" . date('d M Y', strtotime($row['data_esecuzione'])) . "</td>
                                <td>" . $row['risposte_corrette'] . " / " . $row['risposte_totali'] . "</td>
                              </tr>";
                    }
                } else {
                    echo "
                    <tr>
                        <td colspan=\"3\">Nessun quiz trovato</td>
                    </tr>";
                }
                ?>
            </table>
            <div class="totale-quiz-container">
                <span class="totale-quiz"> Totale quiz: <?php echo $totalRows; ?> </span>
            </div>
            <!-- Navigazione pagine -->
            <div class="pagination">
                <?php
                for ($i = 1; $i <= $totalPages; $i++) {
                    $isActive = ($i == $page) ? "class='pagination-button'" : "class='pagination-button active'";
                    $queryString = http_build_query(array_merge($_GET, ['page' => $i]));
                    echo "<a $isActive href='./statistiche.php?$queryString'> $i </a> ";
                }
                ?>
            </div>
        </div>
    </div>
    <footer></footer>
</body>
</html>


