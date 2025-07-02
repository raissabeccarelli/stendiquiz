from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

from . import utilities

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

    context = {}
    context["infoPagina"] = {"nomePagina":"index"}
    
    template = loader.get_template(indexTemplateName)   
    page = template.render(context= context , request= request)
    res.write(page)
    return res