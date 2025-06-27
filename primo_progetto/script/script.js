function includiFile() {
    var includes = $('[data-include]');
    $.each(includes, function () {
        var file = './' + $(this).data('include') + '.html';
        if ($(this).attr('id') == "menu") {
            $(this).load(file);
        }
        else {
            $(this).load(file);
        }

    });
}

function costruisciQueryString(){
	annoQuiz = document.getElementById("annoQuiz");
    titoloQuiz = document.getElementById("searchText");
    checkBoxAttivi = document.getElementById("quizAttivi");
    esitoQuiz = document.getElementById("esitoQuiz");
    dataPartecipazione = document.getElementById("dataPartecipazione");
    
	if(annoQuiz.value.trim()) {
    	annoQuiz.name = "annoFiltro";
    }
    else{
    	annoQuiz.removeAttribute("name");
    }
    
    if(titoloQuiz.value.trim()) {
    	titoloQuiz.name = "searchText";
    }
    else{
    	titoloQuiz.removeAttribute("name");
    }
    
    if(checkBoxAttivi.checked) {
    	checkBoxAttivi.name = "attivi";
    }
    else{
    	checkBoxAttivi.removeAttribute("name");
    }
    
  	if(dataPartecipazione.value.length > 0){
    	dataPartecipazione.name = "dataPartecipazione";
    }
    else{
    	dataPartecipazione.removeAttribute("name");
    }
    
    if(esitoQuiz.value){
    	esitoQuiz.name = "esito";
    }
    else{
    	esitoQuiz.removeAttribute("name");
    }
    
}

function getPathFromUrl(url) {
  return url.split("?")[0];
}

 function checkScreenSize() {
     const MOBILE_MAX_WIDTH = 768;    
     const TABLET_MAX_WIDTH = 1024;  

     const screenWidth = window.screen.width;
     const screenHeight = window.screen.height;

     let deviceType;
     if (screenWidth <= MOBILE_MAX_WIDTH) {
       deviceType = 'mobile';
     } else if (screenWidth <= TABLET_MAX_WIDTH) {
       deviceType = 'tablet';
     } else {
       deviceType = 'desktop';
     }

     return {
       width: screenWidth,
       height: screenHeight,
       deviceType: deviceType,
       isMobile: deviceType === 'mobile'
     };
   }

function handleRedirect() {
  const screenInfo = checkScreenSize();
  if (!screenInfo.isMobile) {
    window.location.replace('prova.php');
  } else {
    showScreenInfo(screenInfo);
    showMobileContent();
  }
}

function showScreenInfo(screenInfo) {
  const infoElement = document.getElementById('screen-info');
  if (infoElement) {
    infoElement.innerHTML = `
    <strong>Dimensioni Schermo:</strong><br>
    ${screenInfo.width} x ${screenInfo.height} pixel<br>
    <strong>Tipo Dispositivo:</strong> ${screenInfo.deviceType}<br>
    <br>
    <small>
    • Mobile: ≤ 768px<br>
    • Tablet: 769-1024px → redirect<br>
    • Desktop: ≥ 1025px → redirect
    </small>
    `;
  }
}

function showMobileContent() {
   const container = document.querySelector('.malva-container');
   if (container) {
     container.classList.add('show');
   }
 }