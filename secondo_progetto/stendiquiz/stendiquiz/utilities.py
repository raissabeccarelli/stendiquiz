from datetime import datetime

DATA_VIEW_FORMAT = "%d/%m/%Y"
DATA_DATABASE_FORMAT = "%Y-%m-%d"


def DataFormatoView(data):
    return ConvertiFormatoDataDaA(data , DATA_DATABASE_FORMAT , DATA_VIEW_FORMAT)

def DataFormatoDataBase(data):
    return ConvertiFormatoDataDaA(data , DATA_VIEW_FORMAT , DATA_DATABASE_FORMAT)

def ConvertiFormatoDataDaA(data , formatoIn , formatoOut):
    data = datetime.strptime(data, formatoIn)
    return data.strftime(formatoOut)
