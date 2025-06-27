<header>
<div class = "invisible-item">
	<button type="submit" class="btn-secondario">Prova</button>
</div>
<div class="title">
<h1><a href="prova.php" alt="Home Page">STENDIQUIZ</a></h1>
<div class="motto">Metti alla prova le tue conoscenze e raggiungi il punteggio più alto!</div>
</div>

<?php
$pagina_corrente = basename($_SERVER['PHP_SELF']);
?>

<?php if (isset($_SESSION['username'])): ?>
    <div class="button-container-logged">
        <div class="button-container">
        	<!--<?php if ($pagina_corrente != 'prova.php'): ?>
              <input type="submit" value="INDIETRO" class="btn-secondario" onclick="history.back()" >
           <?php endif; ?>-->
           <button type="submit" class="btn-secondario" onclick="location.href='logout.php'" >
           	<div class="welcome">
              <h3><?php echo htmlspecialchars($_SESSION['username']); ?></h3>
              <i class="fas fa-light fa-right-from-bracket"></i>
             </div>
           </button>
         </div>
    </div>
<?php else: ?>
    <div class="button-container">
        <?php if ($pagina_corrente === 'login.php'): ?>
            <!--<input type="submit" value="INDIETRO" class="btn-secondario" onclick="history.back()">-->
            <input type="submit" value="REGISTRATI" class="btn-secondario" onclick="location.href='registrazione.php'">
        <?php elseif ($pagina_corrente === 'registrazione.php'): ?>
            <!--<input type="submit" value="INDIETRO" class="btn-secondario" onclick="history.back()">-->
            <input type="submit" value="LOGIN" class="btn-secondario" onclick="location.href='login.php'">
        <?php else: ?>
            <input type="submit" value="LOGIN" class="btn-secondario" onclick="location.href='login.php'">
            <input type="submit" value="REGISTRATI" class="btn-secondario" onclick="location.href='registrazione.php'">
        <?php endif; ?>
    </div>
<?php endif; ?>
</header>
