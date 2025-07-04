from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.utils.safestring import mark_safe

from . import utilities
from . import data_layer as server

indexTemplateName = "index.html"

OPEN_QUIZ = "reindirizzaQUIZ(this)"
OPEN_UTENTE = "reindirizzaUTENTE(this)"
OPEN_PARTECIPAZIONE = "reindirizzaPARTECIPAZIONI(this)"
OPEN_INFO_QUIZ = "reindirizzaINFO_QUIZ(this)"
OPEN_CREA_QUIZ = "openCreaQuiz(this)"

def estrazioneQueryString(request):
    parametri = request.GET
    parametri = {k: v[0] if len(v) == 1 else v for k, v in parametri.lists()}
    return parametri

#Creare una funzione per ogni pagina da visualizzare 


def index(request):
    '''
    Controllore pagina index
    '''
    res = HttpResponse(content_type="text/html")

    parametri = estrazioneQueryString(request)
    
    context = {}
    context["infoPagina"] = {"nomePagina":"index"}
    
    rispostaServer = server.getQuiz(parametri.copy())
    risultato = []

    for riga in rispostaServer:
        record = []
        codice = riga["codice"]
        titolo = riga["titolo"]
        dataInizio = utilities.DataFormatoView(riga["dataInizio"])
        dataFine = utilities.DataFormatoView(riga["dataFine"])
        annoInizio = riga["annoInizio"]
        isAttivo = riga["isAttivo"]
        isFuturo = riga["isFuturo"]
        isScaduto = riga["isScaduto"]
        creatore = riga["creatore"]
        numDomande = riga["nDomande"]
        
        record.append({"valore": codice})
        record.append({"valore": titolo})
        record.append({"valore": creatore})
        record.append({"valore": numDomande})
        record.append({"valore": dataInizio})
        record.append({"valore": dataFine})

        if isAttivo=='1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-success'>Aperto</span>"), "impostazioni":{"class":"text-center align-middle"}})
        elif isFuturo=='1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-info'>In apertura</span>"), "impostazioni":{"class":"text-center align-middle"}})
        elif isScaduto=='1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-danger'>Terminato</span>"), "impostazioni":{"class":"text-center align-middle"}})

        record.append({"valore": annoInizio})
        print(record)
        risultato.append(record)

    numeroRighe = len(risultato)
    listaIntestazioni = [{"valore":"Codice"}, {"valore":"Titolo"}, {"valore": "Creatore"}, {"valore": "# Domande"}, {"valore":"Data Apertura"} , {"valore":"Data Chiusura"}, {"valore":""}, {"valore":"Anno Inizio"}]
    context["risultati"] = {"numeroRighe": numeroRighe , "risultato": risultato, "listaIntestazioni": listaIntestazioni}
    context["filtro"] = parametri

    template = loader.get_template(indexTemplateName)   
    page = template.render(context= context , request= request)
    res.write(page)
    return res