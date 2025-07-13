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


def getRisposteUtenteDomandaQuiz(numeroPartecipazione, numeroDomanda):
    query = "SELECT CODICERISPOSTA AS codicerisposta FROM RispostaUtenteQuiz WHERE PARTECIPAZIONE = {} AND CODICEDOMANDA = {}".format(
        numeroPartecipazione, numeroDomanda)
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

    def trovaParametri(parametri, parametriDaTrovare):
        for parametro in parametriDaTrovare:
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
        errore = trovaParametri(parametri, ["codice"])
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

    elif "modificaQuiz" == parametri["funzione"]:
        errore = trovaParametri(
            parametri, ["codice", "titolo", "dataInizio", "dataFine"])
        if errore != "ok":
            res.write(parametroMancante(errore))
            return res

        codice = parametri["codice"]
        titolo = parametri["titolo"]
        dataInizio = utilities.DataFormatoDataBase(parametri["dataInizio"])
        dataFine = utilities.DataFormatoDataBase(parametri["dataFine"])

        modificaQuiz(codice, titolo, dataInizio, dataFine)
        return inviaOK(res)

    elif parametri["funzione"] == "aggiungiPartecipazione":
        errore = trovaParametri(
            parametri, ["nomeUtente", "quizCodice", "dataPartecipazione"])
        if errore != "ok":
            res.write(parametroMancante(errore))
            return res

        nomeUtente = parametri["nomeUtente"]
        codiceQuiz = parametri["quizCodice"]
        dataPartecipazione = parametri["dataPartecipazione"]
        esito = aggiungiPartecipazione(
            nomeUtente, codiceQuiz, dataPartecipazione)
        if esito == 1:
            errore = {"errore": "L'utente non esiste nel DB", "codiceErrore": 2}
            res.write(json.dumps(errore))
            return res

        return inviaOK(res)

    elif "get_max_partecipazione" == parametri["funzione"]:
        query = "SELECT MAX(CODICE) as codice FROM Partecipazioni"
        risultato = eseguiQuery(query)
        risposta = {"codice_partecipazione": risultato[0]["codice"]}
        res.write(json.dumps(risposta))
        return res

    elif parametri["funzione"] == "inserisci_risposta_utente":
        errore = trovaParametri(
            parametri, ["partecipazione", "quizCodice", "domanda", "risposta"])
        if errore != "ok":
            res.write(parametroMancante(errore))
            return res

        partecipazione = parametri["partecipazione"]
        codiceQuiz = parametri["quizCodice"]
        domanda = parametri["domanda"]
        risposta = parametri["risposta"]

        esito = aggiungiRispostaPartecipazione(
            partecipazione, codiceQuiz, domanda, risposta)

        if esito == 1:
            errore = {"errore": "La partecipazione '{}' non esiste nel DB".format(
                partecipazione), "codiceErrore": 2}
            res.write(json.dumps(errore))
            return res
        if esito == 2:
            errore = {"errore": "Il quiz '{}' non esiste nel DB".format(
                codiceQuiz), "codiceErrore": 2}
            res.write(json.dumps(errore))
            return res

        return inviaOK(res)


def eliminaQuiz(codice=0):
    query_elimina_risposte = "DELETE FROM Risposte WHERE QUIZCODICE = {}".format(
        codice)
    query_elimina_domanda = "DELETE FROM Domande WHERE QUIZCODICE = {}".format(
        codice)
    query_elimina_quiz = "DELETE FROM Quiz WHERE CODICE = {}".format(codice)
    eseguiQuery(query_elimina_risposte)
    eseguiQuery(query_elimina_domanda)
    eseguiQuery(query_elimina_quiz)


def modificaQuiz(codice, titolo, dataInizio, dataFine):
    query = "UPDATE Quiz SET TITOLO ='{}', DATAINIZIO ='{}', DATAFINE ='{}' WHERE CODICE = {}".format(
        titolo, dataInizio, dataFine, codice)
    eseguiQuery(query)


def esisteUtente(nomeUtente):
    query = "SELECT * FROM Utenti WHERE NOMEUTENTE = '{}'".format(nomeUtente)
    ris = eseguiQuery(query)
    return len(ris) > 0


def aggiungiPartecipazione(nomeUtente, codiceQuiz, dataPartecipazione):
    if not esisteUtente(nomeUtente):
        return 1
    query = "INSERT INTO Partecipazioni(`NOMEUTENTE`, `QUIZCODICE`, `DATA`) VALUES ('{}','{}','{}')".format(
        nomeUtente, codiceQuiz, dataPartecipazione)
    eseguiQuery(query)
    return 0


def esistePartecipazione(partecipazione):
    query = "SELECT * FROM Partecipazioni WHERE CODICE = {}".format(
        partecipazione)
    ris = eseguiQuery(query)

    return len(ris) > 0


def aggiungiRispostaPartecipazione(partecipazione, quizCodice, domanda, risposta):

    if not esistePartecipazione(partecipazione):
        return 1
    if not esisteQuiz(quizCodice):
        return 2

    query = "INSERT INTO RispostaUtenteQuiz(`PARTECIPAZIONE`, `CODICEQUIZ`, `CODICEDOMANDA`, `CODICERISPOSTA`) VALUES ('{}','{}','{}','{}')".format(
        partecipazione, quizCodice, domanda, risposta)
    eseguiQuery(query)
    return 0


def salvaQuizNelDB(payload):
    def escape(s):
        """Escapa apici singoli e doppi per evitare errori SQL via GET."""
        return s.replace("'", "''").replace('"', '""') if isinstance(s, str) else s

    titolo = escape(payload["titolo"])
    autore = escape(payload["autore"])
    dataInizio = escape(payload["data_inizio"])
    dataFine = escape(payload["data_fine"])
    domande = payload["domande"]

    dataInizio = utilities.DataFormatoDataBase(dataInizio)
    dataFine = utilities.DataFormatoDataBase(dataFine)

    query_quiz = f"""
        INSERT INTO Quiz (TITOLO, CREATORE, DATAINIZIO, DATAFINE)
        VALUES ('{titolo}', '{autore}', '{dataInizio}', '{dataFine}')
    """

    eseguiQuery(query_quiz)

    query_get_codice = "SELECT MAX(CODICE) as codice FROM Quiz"
    result = eseguiQuery(query_get_codice)
    if not result:
        return None
    quiz_codice = result[0]["codice"]

    for idx, domanda in enumerate(domande, start=1):
        testo_domanda = escape(domanda["testo"])
        query_domanda = f"""
            INSERT INTO Domande (QUIZCODICE, NUMERO, TESTO)
            VALUES ({quiz_codice}, {idx}, '{testo_domanda}')
        """
        eseguiQuery(query_domanda)

        for j, risposta in enumerate(domanda["opzioni"], start=1):
            testo_risposta = escape(risposta["testo"])
            punteggio = int(risposta.get("punteggio", 0))
            tipo = risposta.get("tipo", "sbagliata").capitalize()

            query_risposta = f"""
                INSERT INTO Risposte (QUIZCODICE, DOMANDA, NUMERO, TESTO, TIPORISPOSTA, PUNTEGGIO)
                VALUES ({quiz_codice}, {idx}, {j}, '{testo_risposta}', '{tipo}', {punteggio})
            """
            eseguiQuery(query_risposta)

    return quiz_codice


def getPartecipazione(parametri):

    QUERY = "SELECT Partecipazioni.CODICE AS codice , Partecipazioni.NOMEUTENTE AS nomeUtente , Quiz.TITOLO AS quiz, Quiz.CODICE AS codiceQuiz, Partecipazioni.DATA AS data, COUNT(RispostaUtenteQuiz.CODICERISPOSTA) AS nRisposte, SUM(Risposte.PUNTEGGIO) AS punteggioOttenuto, (SELECT SUM(Risposte2.PUNTEGGIO) FROM Risposte AS Risposte2 WHERE Risposte2.QUIZCODICE = Quiz.CODICE) AS punteggioMassimo FROM (Partecipazioni JOIN RispostaUtenteQuiz ON Partecipazioni.CODICE = RispostaUtenteQuiz.PARTECIPAZIONE) JOIN Quiz ON Partecipazioni.QUIZCODICE = Quiz.CODICE JOIN Risposte ON Risposte.QUIZCODICE = RispostaUtenteQuiz.CODICEQUIZ AND Risposte.DOMANDA = RispostaUtenteQuiz.CODICEDOMANDA AND Risposte.NUMERO = RispostaUtenteQuiz.CODICERISPOSTA "
    GROUP_BY = " GROUP BY Partecipazioni.CODICE "

    ORDER_BY = " ORDER BY Partecipazioni.CODICE "

    condizioniWhere = ""

    if "codice" in parametri:
        condizioniWhere = aggiungiCondizioneWhere(
            condizione=condizioniWhere, nome="Partecipazioni.CODICE", valore=parametri["codice"], tipologia=TIPOLOGIA_RICERCA["noLike"])

    if "nomeUtente" in parametri:
        tipologia = TIPOLOGIA_RICERCA["like"]
        condizioniWhere = aggiungiCondizioneWhere(
            condizione=condizioniWhere, nome="Partecipazioni.NOMEUTENTE", valore=parametri["nomeUtente"], tipologia=tipologia)

    query = QUERY + condizioniWhere + GROUP_BY + ORDER_BY

    risultati = eseguiQuery(query)

    return risultati
