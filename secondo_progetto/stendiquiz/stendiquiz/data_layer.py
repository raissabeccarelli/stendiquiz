from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from . import utilities

import requests
import json

'''
    Partire da getPartecipazioni
'''
LIKE = " LIKE "
AND = " AND "
WHERE = " WHERE "
GROUP_BY = "GROUP BY "
HAVING = " HAVING "

TIPOLOGIA_ELEMENTO = {"data": "DATA",
                      "testo": "TESTO",
                      "numero": "NUMERO"}


TIPOLOGIA_RICERCA = {"minore": "1",
                     "uguale": "2",
                     "maggiore": "3",
                     "like": "like",
                     "noLike": "2",
                     "minoreUguale": "4",
                     "maggioreUguale": "5"}


def eseguiQuery(query):
    isSelect = 0
    if "SELECT" in query:
        isSelect = 1

    richiesta = {"query": query, "isSelect": isSelect}

    url = 'https://stendiquiz.altervista.org/api.php'
    response = requests.get(url, params=richiesta)
    if response.status_code == 200:
        try:
            data = response.json()
            return json.loads(data)
        except:
            return ""
    else:
        print(f"Errore nella richiesta: {response.status_code}")


def aggiungiCondizioneWhere(condizione, nome, valore, tipologia):
    condizione = aggiungiCondizione(condizione, nome, valore, tipologia)
    if not (WHERE in condizione):
        condizione = WHERE + condizione

    return condizione


def aggiungiCondizioneHaving(condizione, nome, valore, tipologia):
    condizione = aggiungiCondizione(condizione, nome, valore, tipologia)

    if not (HAVING in condizione):
        condizione = HAVING + condizione

    return condizione


def aggiungiCondizione(condizione, nome, valore, tipologia):
    if tipologia == TIPOLOGIA_RICERCA["minore"]:
        if not isinstance(valore, int):
            valore = f"'{valore}'"
        vincolo = nome + " < " + valore
    elif tipologia == TIPOLOGIA_RICERCA["maggiore"]:
        if not isinstance(valore, int):
            valore = f"'{valore}'"
        vincolo = nome + " > " + valore
    elif tipologia == TIPOLOGIA_RICERCA["uguale"]:
        if not isinstance(valore, int):
            valore = f"'{valore}'"
        vincolo = nome + " = " + valore
    elif tipologia == TIPOLOGIA_RICERCA["like"]:
        if not isinstance(valore, int):
            valore = f"'%{valore}%'"
        vincolo = nome + LIKE + valore
    elif tipologia == TIPOLOGIA_RICERCA["maggioreUguale"]:
        if not isinstance(valore, int):
            valore = f"'{valore}'"
        vincolo = nome + " >= " + valore
    elif tipologia == TIPOLOGIA_RICERCA["minoreUguale"]:
        if not isinstance(valore, int):
            valore = f"'{valore}'"
        vincolo = nome + " <= " + valore

    if condizione == "":
        condizione = vincolo
    else:
        condizione += AND + vincolo

    return condizione


def getQuiz(parametri):
    QUERY_QUIZ = "SELECT Quiz.CODICE AS codice, Quiz.TITOLO as titolo, Quiz.DATAINIZIO as dataInizio, Quiz.DATAFINE as dataFine, Quiz.CREATORE AS creatore,  YEAR(Quiz.DATAINIZIO) as annoInizio, (Quiz.DATAINIZIO <= NOW() AND Quiz.DATAFINE >= NOW()) as isAttivo, Quiz.DATAINIZIO >= NOW() as isFuturo, Quiz.DATAFINE <= NOW() as isScaduto, COUNT(DISTINCT Domande.NUMERO) AS nDomande FROM Quiz LEFT JOIN Domande ON Quiz.CODICE = Domande.QUIZCODICE "
    GROUP_BY = " GROUP BY Quiz.CODICE, Quiz.TITOLO, Quiz.DATAINIZIO, Quiz.DATAFINE, Quiz.CREATORE, annoInizio, isAttivo, isFuturo, isScaduto"
    ORDER_BY = " ORDER BY Quiz.TITOLO"

    condizioniWhere = ""

    if "codice" in parametri:
        tipologia = TIPOLOGIA_RICERCA["uguale"]
        condizioniWhere = aggiungiCondizioneWhere(
            condizione=condizioniWhere, nome="Quiz.CODICE", valore=parametri["codice"], tipologia=tipologia)

    if "creatore" in parametri:
        tipologia = TIPOLOGIA_RICERCA["uguale"]
        condizioniWhere = aggiungiCondizioneWhere(
            condizione=condizioniWhere, nome="Quiz.CREATORE", valore=parametri["creatore"], tipologia=tipologia)

    query = QUERY_QUIZ + condizioniWhere + GROUP_BY + ORDER_BY
    risultati = eseguiQuery(query)
    return risultati


def getDomandeQuiz(codice):
    query = "SELECT NUMERO as numero, TESTO as testo FROM Domande WHERE QUIZCODICE = {} ORDER BY NUMERO".format(
        codice)
    risultati = eseguiQuery(query)

    return risultati


def getRisposteDomandaQuiz(codiceQuiz, numeroDomanda):
    query = "SELECT NUMERO AS numero ,TESTO AS testo, TIPORISPOSTA AS tipo , PUNTEGGIO AS punteggio FROM Risposte WHERE QUIZCODICE = {} AND DOMANDA = {} ORDER BY NUMERO ASC".format(
        codiceQuiz, numeroDomanda)
    risultati = eseguiQuery(query)

    return risultati


def esisteQuiz(codice):
    query = "SELECT * FROM Quiz WHERE CODICE = {}".format(codice)
    ris = eseguiQuery(query)

    return len(ris) > 0


def quizPartecipato(codiceQuiz):
    query = "SELECT * FROM Partecipazioni WHERE QuizCodice = {}".format(
        codiceQuiz)
    ris = eseguiQuery(query)
    return len(ris) > 0


def funzionalitaDB(request):

    def parametroMancante(parametro):
        errore = {"errore": "Manca il parametro '{}'.".format(
            parametro), "codiceErrore": 1}
        return json.dumps(errore)

    def inviaOK(res):
        risposta = {"esito": "ok"}
        res.write(json.dumps(risposta))
        return res

    def trovaParametro(parametri, parametroDaTrovare):
        for parametro in parametroDaTrovare:
            if not parametro in parametri:
                return parametro

        return "ok"

    res = HttpResponse(content_type="application/json")

    parametri = request.GET

    if not "funzione" in parametri:
        errore = {"errore": "Nome della funzione non inserito", "codiceErrore": 0}
        res.write(json.dumps(errore))
        return res

    if parametri["funzione"] == "eliminaQuiz":
        errore = trovaParametro(parametri, ["codice"])
        if errore != "ok":
            res.write(parametroMancante(errore))
            return res

        codice = parametri["codice"]

        eliminaQuiz(codice)
        if not esisteQuiz(codice):
            return inviaOK(res)
        else:
            errore = {"errore": "Il quiz '{}' non è stato eliminato".format(
                codice), "codiceErrore": 2}
            res.write(json.dumps(errore))
            return res


def eliminaQuiz(codice=0):
    query_elimina_risposte = "DELETE FROM Risposte WHERE QUIZCODICE = {}".format(
        codice)
    query_elimina_domanda = "DELETE FROM Domande WHERE QUIZCODICE = {}".format(
        codice)
    query_elimina_quiz = "DELETE FROM Quiz WHERE CODICE = {}".format(codice)
    eseguiQuery(query_elimina_risposte)
    eseguiQuery(query_elimina_domanda)
    eseguiQuery(query_elimina_quiz)
