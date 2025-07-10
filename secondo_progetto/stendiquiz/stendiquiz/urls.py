"""
URL configuration for stendiquiz project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from . import controller
from . import data_layer as server


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', controller.index, name='index'),
    path('gioca', controller.gioca, name='gioca'),
    path('imieiquiz', controller.imieiquiz, name='imieiquiz'),
    path("funzionalitaDB", server.funzionalitaDB, name="funzionalitaDB"),
    path("errore", controller.errore, name="errore"),
    path("creaquiz", controller.creaquiz, name="creaquiz"),
    path("api/salva_quiz/", controller.salva_quiz_api, name="salva_quiz_api"),
    path("visualizzapartecipazione", controller.visualizzapartecipazione,
         name="visualizzapartecipazione"),
]
