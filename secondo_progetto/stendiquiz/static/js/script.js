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
