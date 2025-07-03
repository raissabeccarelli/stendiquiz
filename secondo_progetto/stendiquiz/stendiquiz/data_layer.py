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
                      "testo" : "TESTO",
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

    richiesta = {"query" : query , "isSelect": isSelect}
    
    url = 'https://stendiquiz.altervista.org/api.php'
    response = requests.get(url , params = richiesta)
    if response.status_code == 200:
        try:
            data = response.json()
            return json.loads(data)
        except:
            return ""
    else:
        print(f"Errore nella richiesta: {response.status_code}")
    
def aggiungiCondizioneWhere(condizione, nome , valore , tipologia):
    condizione = aggiungiCondizione(condizione , nome , valore , tipologia)
    if not (WHERE in condizione):
        condizione = WHERE + condizione
    
    return condizione

def aggiungiCondizioneHaving(condizione, nome , valore , tipologia):
    condizione = aggiungiCondizione(condizione , nome , valore , tipologia)
    
    if not(HAVING in condizione):
        condizione = HAVING + condizione
    
    return condizione

def aggiungiCondizione(condizione, nome , valore , tipologia):
    if tipologia == TIPOLOGIA_RICERCA["minore"]:
        if not isinstance(valore , int):
            valore = f"'{valore}'"
        vincolo = nome + " < " + valore
    elif tipologia == TIPOLOGIA_RICERCA["maggiore"]:
        if not isinstance(valore , int):
            valore = f"'{valore}'"
        vincolo = nome + " > " + valore
    elif tipologia == TIPOLOGIA_RICERCA["uguale"]:
        if not isinstance(valore , int):
            valore = f"'{valore}'"
        vincolo = nome + " = " + valore
    elif tipologia == TIPOLOGIA_RICERCA["like"]:
        if not isinstance(valore , int):
            valore = f"'%{valore}%'"
        vincolo = nome + LIKE + valore
    elif tipologia == TIPOLOGIA_RICERCA["maggioreUguale"]:
        if not isinstance(valore , int):
            valore = f"'{valore}'"
        vincolo = nome + " >= " + valore
    elif tipologia == TIPOLOGIA_RICERCA["minoreUguale"]:
        if not isinstance(valore , int):
            valore = f"'{valore}'"
        vincolo = nome + " <= " + valore

    if condizione == "":
        condizione = vincolo
    else:
        condizione += AND + vincolo
    
    return condizione

def getQuiz(parametri):
    QUERY_QUIZ = "SELECT Quiz.CODICE AS codice, Quiz.TITOLO as titolo, Quiz.DATAINIZIO as dataInizio, Quiz.DATAFINE as dataFine, YEAR(Quiz.DATAINIZIO) as annoInizio, (Quiz.DATAINIZIO <= NOW() AND Quiz.DATAFINE >= NOW()) as isAttivo FROM Quiz"
    ORDER_BY = " ORDER BY Quiz.TITOLO"

    if "dataInizio" in parametri:
        parametri["dataInizio"] = utilities.DataFormatoDataBase(parametri["dataInizio"])    
    
    if "dataFine" in parametri:
        parametri["dataFine"] = utilities.DataFormatoDataBase(parametri["dataFine"])    
        
    condizioniWhere = ""
    condizioniHaving = ""

    if "codice" in parametri:
        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "Quiz.CODICE", valore=parametri["codice"] , tipologia=TIPOLOGIA_RICERCA["noLike"])
    
    if "titolo" in parametri:
        tipologia = TIPOLOGIA_RICERCA["like"]
        if "vincoloTitolo" in parametri:
            tipologia = TIPOLOGIA_RICERCA["noLike"]

        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "Quiz.TITOLO", valore=parametri["titolo"] , tipologia=tipologia)
    '''
    if "creatore" in parametri:
        tipologia = TIPOLOGIA_RICERCA["like"]
        if "vincoloCreatore" in parametri:
            tipologia = TIPOLOGIA_RICERCA["noLike"]

        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "Quiz.CREATORE", valore=parametri["creatore"] , tipologia=tipologia)

    if "dataInizio" in parametri:
        if "radio_quale_dataInizio" in parametri:
            tipologia = parametri["radio_quale_dataInizio"]
            condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "Quiz.DATANIZIO", valore=parametri["dataInizio"] , tipologia=tipologia)
    
    if "dataFine" in parametri:
        if "radio_quale_dataFine" in parametri:
            tipologia = parametri["radio_quale_dataFine"]
            condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "Quiz.DATAFINE", valore=parametri["dataFine"] , tipologia=tipologia)
    '''

    if "annoInizio" in parametri:
        tipologia = TIPOLOGIA_RICERCA["uguale"]
        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere, nome = "YEAR(Quiz.DATAINIZIO)", valore=parametri["annoInizio"], tipologia=tipologia)

    if "quizAttivo" in parametri:
        tipologia = TIPOLOGIA_RICERCA["maggioreUguale"]
        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere, nome = "Quiz.DATAINIZIO", valore="NOW()", tipologia=tipologia)
        tipologia = TIPOLOGIA_RICERCA["minoreUguale"]
        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere, nome = "Quiz.DATAFINE", valore="NOW()", tipologia=tipologia)

    query = QUERY_QUIZ  + condizioniWhere + ORDER_BY
    risultati = eseguiQuery(query)
    return risultati


def getUtente(parametri):
    
    QUERY = "SELECT Utenti.NOMEUTENTE AS nomeUtente , Utenti.NOME AS nome , Utenti.COGNOME AS cognome , Utenti.EMAIL AS email , COUNT(DISTINCT Partecipazioni.QUIZCODICE) as nQgiocati FROM Utenti LEFT JOIN Quiz ON Utenti.nomeUtente = Quiz.CREATORE LEFT JOIN Partecipazioni ON Utente.nomeUtente = Partecipazioni.nomeUtente"

    GROUP_BY = " GROUP BY UTENTE.NOME_UTENTE "

    ORDER_BY = " ORDER BY UTENTE.NOME_UTENTE ASC"

    condizioniWhere = ""
    condizioniHaving = ""

    ''''
    # ? NOME UTENTE
    if "nomeUtente" in parametri:
        tipologia = TIPOLOGIA_RICERCA["like"]
        if "vincoloNomeUtente" in parametri:
            tipologia = TIPOLOGIA_RICERCA["noLike"]

        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "UTENTE.NOME_UTENTE", valore=parametri["nomeUtente"] , tipologia=tipologia)
    
    # ? NOME
    if "nome" in parametri:
        tipologia = TIPOLOGIA_RICERCA["like"]
        if "vincoloNome" in parametri:
            tipologia = TIPOLOGIA_RICERCA["noLike"]

        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "UTENTE.NOME", valore=parametri["nome"] , tipologia=tipologia)
    
    # ? COGNOME
    if "cognome" in parametri:
        tipologia = TIPOLOGIA_RICERCA["like"]
        if "vincoloCognome" in parametri:
            tipologia = TIPOLOGIA_RICERCA["noLike"]

        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "UTENTE.COGNOME", valore=parametri["cognome"] , tipologia=tipologia)

    # ? EMAIL
    if "email" in parametri:
        tipologia = TIPOLOGIA_RICERCA["like"]
        if "vincoloEmail" in parametri:
            tipologia = TIPOLOGIA_RICERCA["noLike"]

        condizioniWhere = aggiungiCondizioneWhere(condizione = condizioniWhere , nome= "UTENTE.EMAIL", valore=parametri["email"] , tipologia=tipologia)
    '''
    # ? NUMERO QUIZ GIOCATI
    if "nQgiocati" in parametri:
        tipologia = TIPOLOGIA_RICERCA["uguale"]
        condizioniHaving = aggiungiCondizioneHaving(condizione = condizioniWhere , nome= "nQgiocati", valore=parametri["nQgiocati"] , tipologia=tipologia)

    query = QUERY  + condizioniWhere + GROUP_BY + condizioniHaving + ORDER_BY
    
    risultati = eseguiQuery(query)

    return risultati