from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.template import loader
from django.utils.safestring import mark_safe
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from urllib.parse import urlencode

from . import utilities
from . import data_layer as server
from .data_layer import salvaQuizNelDB

import random
import json

indexTemplateName = "index.html"
imieiquizTemplateName = "imieiquiz.html"
giocaTemplateName = "gioca.html"
erroreTemplateName = "errore.html"
visualizzaPartecipazioneTemplateName = "visualizzaPartecipazione.html"
statisticheTemplateName = "statistiche.html"
utentiTemplateName = "utenti.html"

SUPER_USER = "demo"


def estrazioneQueryString(request):
    parametri = request.GET
    parametri = {k: v[0] if len(v) == 1 else v for k, v in parametri.lists()}
    return parametri


def index(request):
    res = HttpResponse(content_type="text/html")

    context = {}
    context["infoPagina"] = {"page": "Home", "root": [
        {"pagina": "Stendiquiz", "link": "./"}]}

    rispostaServer = server.getQuiz(parametri={})
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

        if isAttivo == '1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-pill-table badge-success'>Aperto</span>"),
                          "impostazioni": {"class": "text-center align-middle"}})
        elif isFuturo == '1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-pill-table badge-info'>In apertura</span>"),
                          "impostazioni": {"class": "text-center align-middle"}})
        elif isScaduto == '1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-pill-table badge-danger'>Terminato</span>"),
                          "impostazioni": {"class": "text-center align-middle"}})

        record.append({"valore": annoInizio})
        risultato.append(record)

    listaIntestazioni = [{"valore": "Codice"}, {"valore": "Titolo"}, {"valore": "Creatore"}, {"valore": "# Domande"}, {
        "valore": "Data Apertura"}, {"valore": "Data Chiusura"}, {"valore": ""}, {"valore": "Anno Inizio"}]
    context["risultati"] = {"risultato": risultato,
                            "listaIntestazioni": listaIntestazioni}

    template = loader.get_template(indexTemplateName)
    page = template.render(context=context, request=request)
    res.write(page)
    return res


def gioca(request):
    res = HttpResponse(content_type="text/html")
    parametri = estrazioneQueryString(request)
    if trovaParametri(parametri, ["codice"]) != "ok" or not server.esisteQuiz(parametri["codice"]):
        params = {'title': '502 Bad Server',
                  'message': 'Non è possibile recuperare le domande del quiz selezionato. Il quiz non esiste.'}
        query_string = urlencode(params)
        base_url = reverse('errore')
        url_con_parametri = f'{base_url}?{query_string}'
        return redirect(url_con_parametri)

    context = {}

    quiz = server.getQuiz(parametri={"codice": parametri["codice"]})

    quiz = quiz[0]
    domandeDB = server.getDomandeQuiz(parametri["codice"])

    domande = []

    for domanda in domandeDB:
        risposteDB = server.getRisposteDomandaQuiz(
            codiceQuiz=parametri["codice"], numeroDomanda=domanda["numero"])
        random.shuffle(risposteDB)
        risposte = []
        domandaPunteggio = 2

        for risposta in risposteDB:
            o_r = {}
            o_r["testo"] = risposta["testo"]
            o_r["corretta"] = risposta["tipo"] == "Corretta"
            o_r["numero"] = risposta["numero"]

            if o_r["corretta"]:
                domandaPunteggio = risposta["punteggio"]

            risposte.append(o_r)

        o_d = {}
        o_d["testo"] = domanda["testo"]
        o_d["numero"] = domanda["numero"]
        o_d["punteggio"] = domandaPunteggio
        o_d["risposte"] = risposte

        domande.append(o_d)
        infoQuiz = {"codiceQuiz": quiz["codice"],
                    "creatore": quiz["creatore"],
                    "dataInizio": utilities.DataFormatoView(quiz["dataInizio"]),
                    "dataFine": utilities.DataFormatoView(quiz["dataFine"]),
                    "titolo": quiz["titolo"],
                    "domande": domande,
                    "nDomande": len(domande)
                    }

    context = infoQuiz
    context["infoPagina"] = {"page": "Gioca", "root": [
        {"pagina": "Stendiquiz", "link": "./"}]}

    template = loader.get_template(giocaTemplateName)
    page = template.render(context=context, request=request)

    res.write(page)

    return res


def imieiquiz(request):
    res = HttpResponse(content_type="text/html")

    context = {}
    context["infoPagina"] = {"page": "I miei quiz", "root": [
        {"pagina": "Stendiquiz", "link": "./"}]}

    rispostaServer = server.getQuiz(parametri={"creatore": SUPER_USER})
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
        isPartecipato = server.quizPartecipato(codice)
        numDomande = riga["nDomande"]

        record.append({"valore": codice})
        record.append({"valore": titolo})
        record.append({"valore": numDomande})
        record.append({"valore": dataInizio})
        record.append({"valore": dataFine})

        if isAttivo == '1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-pill-table badge-success'>Aperto</span>"),
                          "impostazioni": {"class": "text-center"}})
        elif isFuturo == '1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-pill-table badge-info'>In apertura</span>"),
                          "impostazioni": {"class": "text-center"}})
        elif isScaduto == '1':
            record.append({"valore": mark_safe("<span class='badge badge-pill badge-pill-table badge-danger'>Terminato</span>"),
                          "impostazioni": {"class": "text-center"}})
        if isPartecipato > 0:
            record.append({"valore": mark_safe("<div class='btn-group'>\
                                    <button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'\
                                        aria-haspopup='true' aria-expanded='false'>\
                                        <i class='fa-solid fa-bars'></i>\
                                    </button>\
                                    <div class='dropdown-menu'>\
                                        <a class='dropdown-item conferma-modifica' href='#'><i class='fa-solid fa-pen'></i> Modifica</a>\
                                    </div>\
                                </div>"),
                           "impostazioni": {"class": "text-center"}})
        else:
            record.append({"valore": mark_safe("<div class='btn-group'>\
                                    <button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'\
                                        aria-haspopup='true' aria-expanded='false'>\
                                        <i class='fa-solid fa-bars'></i>\
                                    </button>\
                                    <div class='dropdown-menu'>\
                                        <a class='dropdown-item conferma-modifica' href='#'><i class='fa-solid fa-pen'></i> Modifica</a>\
                                        <a class='dropdown-item conferma-eliminazione' href='#'><i class='fa-solid fa-trash'></i> Elimina</a>\
                                    </div>\
                                </div>"),
                          "impostazioni": {"class": "text-center"}})

        record.append({"valore": annoInizio})
        risultato.append(record)

    listaIntestazioni = [{"valore": "Codice"}, {"valore": "Titolo"}, {"valore": "# Domande"}, {
        "valore": "Data Apertura"}, {"valore": "Data Chiusura"}, {"valore": ""}, {"valore": ""}, {"valore": "Anno Inizio"}]
    context["risultati"] = {"risultato": risultato,
                            "listaIntestazioni": listaIntestazioni}

    template = loader.get_template(imieiquizTemplateName)
    page = template.render(context=context, request=request)
    res.write(page)
    return res


def errore(request):
    res = HttpResponse(content_type="text/html")
    parametri = estrazioneQueryString(request)
    context = {}
    context["title"] = parametri["title"]
    context["message"] = parametri["message"]

    template = loader.get_template(erroreTemplateName)
    page = template.render(context=context, request=request)
    res.write(page)

    return res


def trovaParametri(parametri, parametriDaTrovare):
    for parametro in parametriDaTrovare:
        if not parametro in parametri:
            return parametro

    return "ok"


@csrf_exempt
def salva_quiz_api(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Metodo non supportato")

    try:
        data = json.loads(request.body)
        codice = salvaQuizNelDB(data)
        if codice:
            return JsonResponse({"success": True, "codice_quiz": codice})
        else:
            return JsonResponse({"success": False, "errore": "Quiz non salvato"})
    except Exception as e:
        return JsonResponse({"success": False, "errore": str(e)}, status=500)


def visualizzapartecipazione(request):
    res = HttpResponse(content_type="text/html")
    parametri = estrazioneQueryString(request)
    if trovaParametri(parametri, ["codice"]) != "ok" or not server.esistePartecipazione(parametri["codice"]):
        params = {'title': '502 Bad Server',
                  'message': 'Non è possibile recuperare la partecipazione al quiz selezionata. La partecipazione non esiste.'}
        query_string = urlencode(params)
        base_url = reverse('errore')
        url_con_parametri = f'{base_url}?{query_string}'
        return redirect(url_con_parametri)

    context = {}

    partecipazione = server.getPartecipazione(
        parametri={"codice": parametri["codice"]})

    partecipazione = partecipazione[0]
    domandeDB = server.getDomandeQuiz(partecipazione["codiceQuiz"])

    domande = []

    for domanda in domandeDB:
        risposteDB = server.getRisposteDomandaQuiz(
            codiceQuiz=partecipazione["codiceQuiz"], numeroDomanda=domanda["numero"])
        random.shuffle(risposteDB)
        rispostaUtente = server.getRisposteUtenteDomandaQuiz(
            numeroPartecipazione=parametri["codice"], numeroDomanda=domanda["numero"])
        rispostaUtente = rispostaUtente[0]
        risposte = []
        domandaPunteggio = 2
        domandaCorretta = False

        for risposta in risposteDB:
            o_r = {}
            o_r["testo"] = risposta["testo"]
            o_r["corretta"] = risposta["tipo"] == "Corretta"
            o_r["numero"] = risposta["numero"]
            o_r["rispostautente"] = rispostaUtente["codicerisposta"]
            if o_r["corretta"]:
                domandaPunteggio = risposta["punteggio"]
                if (o_r["rispostautente"] == o_r["numero"]):
                    domandaCorretta = True

            risposte.append(o_r)

        o_d = {}
        o_d["testo"] = domanda["testo"]
        o_d["numero"] = domanda["numero"]
        o_d["punteggio"] = domandaPunteggio
        o_d["domandacorretta"] = domandaCorretta
        o_d["risposte"] = risposte

        domande.append(o_d)
        infoQuiz = {"codiceQuiz": partecipazione["codiceQuiz"],
                    "punteggioMassimo": partecipazione["punteggioMassimo"],
                    "punteggioOttenuto": partecipazione["punteggioOttenuto"],
                    "percentuale": round((int(partecipazione["punteggioOttenuto"]) / int(partecipazione["punteggioMassimo"])) * 100),
                    "dataPartecipazione": utilities.DataFormatoView(partecipazione["data"]),
                    "titolo": partecipazione["quiz"],
                    "numeroDomande": len(domande),
                    "domande": domande
                    }

    print(infoQuiz)
    context = infoQuiz
    context["infoPagina"] = {"page": "Risultati", "root": [
        {"pagina": "Stendiquiz", "link": "./"}]}

    template = loader.get_template(visualizzaPartecipazioneTemplateName)
    page = template.render(context=context, request=request)

    res.write(page)

    return res


def utenti(request):
    res = HttpResponse(content_type="text/html")

    context = {}
    context["infoPagina"] = {
        "page": "Utenti",
        "root": [{"pagina": "Stendiquiz", "link": "./"}]
    }

    rispostaServer = server.getUtenti(parametri={})

    risultato = []
    for utente in rispostaServer:
        record = []
        username = utente["username"]
        nome = utente["nome"]
        cognome = utente["cognome"]
        email = utente["email"]
        quizCreati = utente["quizCreati"]
        quizGiocati = utente["quizGiocati"]

        record.append({"valore": username})
        record.append({"valore": nome})
        record.append({"valore": cognome})
        record.append({"valore": email})
        record.append({"valore": quizCreati})
        record.append({"valore": quizGiocati})

        risultato.append(record)

    listaIntestazioni = [
        {"valore": "Nome utente"},
        {"valore": "Nome"},
        {"valore": "Cognome"},
        {"valore": "Email"},
        {"valore": "# Quiz creati"},
        {"valore": "# Quiz giocati"}
    ]

    context["risultati"] = {
        "risultato": risultato,
        "listaIntestazioni": listaIntestazioni
    }

    template = loader.get_template(utentiTemplateName)
    page = template.render(context=context, request=request)
    res.write(page)
    return res


def statistiche(request):
    nomeutente = request.GET.get("utente", None)

    if not nomeutente or server.esisteUtente(nomeutente) == 0:
        params = {'title': '502 Bad Server',
                  'message': 'Non è possibile recuperare le statistiche dell\'utente selezionato. L\'utente non esiste.'}
        query_string = urlencode(params)
        base_url = reverse('errore')
        url_con_parametri = f'{base_url}?{query_string}'
        return redirect(url_con_parametri)

    res = HttpResponse(content_type="text/html")
    context = {}
    context["infoPagina"] = {
        "page": f"Statistiche di {nomeutente}",
        "root": [{"pagina": "Stendiquiz", "link": "./"}]
    }

    partecipazioni = server.getStatistiche(nomeutente)
    percentuale = 0
    risultato = []
    for p in partecipazioni:
        record = [
            {"valore": p["codicePartecipazione"]},
            {"valore": p["QUIZCODICE"]},
            {"valore": p["TITOLO"]},
            {"valore": p["CREATORE"]},
            {"valore": p["nRisposte"]},
            {"valore":  mark_safe("<span class='badge badge-punteggio badge-primary'>" + p["punteggioOttenuto"] + "/" + p["punteggioMassimo"] + "</span>"),
             "impostazioni": {"class": "text-center align-start"}},
        ]
        percentuale = round((int(p["punteggioOttenuto"]) /
                             int(p["punteggioMassimo"])) * 100)
        if percentuale >= 60:
            record.append({"valore": mark_safe("<span class='badge badge-esito badge-success'>Superato</span>"),
                          "impostazioni": {"class": "text-center align-start"}})
        else:
            record.append({"valore": mark_safe("<span class='badge badge-esito badge-danger'>Non Superato</span>"),
                           "impostazioni": {"class": "text-center align-start"}})

        record.append({"valore": utilities.DataFormatoView(p["DATA"])})
        record.append({"valore": mark_safe("<div class='btn-group'>\
                                    <button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'\
                                        aria-haspopup='true' aria-expanded='false'>\
                                        <i class='fa-solid fa-bars'></i>\
                                    </button>\
                                    <div class='dropdown-menu'>\
                                        <a class='dropdown-item conferma-informazioni' href='#'><i class='fa-solid fa-chart-simple'></i> Risultati</a>\
                                    </div>\
                                </div>"),
                       "impostazioni": {"class": "text-center"}})
        risultato.append(record)

    context["risultati"] = {
        "risultato": risultato,
        "listaIntestazioni": [
            {"valore": "Codice Partecipazione"},
            {"valore": "Codice Quiz"},
            {"valore": "Titolo"},
            {"valore": "Creatore"},
            {"valore": "# Domande"},
            {"valore": "Punteggio"},
            {"valore": "Esito"},
            {"valore": "Data Partecipazione"},
            {"valore": "Azioni"}
        ]
    }

    context["totale_quiz"] = len(partecipazioni)

    template = loader.get_template(statisticheTemplateName)
    page = template.render(context=context, request=request)
    res.write(page)
    return res
