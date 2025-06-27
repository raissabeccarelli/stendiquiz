import pandas as pd
from sqlalchemy import create_engine
from zipfile import ZipFile
from pathlib import Path

# This script imports data from a zip file containing CSV files into a PostgreSQL database
with ZipFile('./my_stendiquiz.zip') as zf:
    for name in zf.namelist():
        if name.endswith('/') or not name.lower().endswith('.csv'):
            continue

        table_name = Path(name).stem

        with zf.open(name) as f:
            df = pd.read_csv(f)
            df.columns = [c.lower() for c in df.columns]
            engine = create_engine('postgresql://postgres:root@localhost:5432/my_stendiquiz')
            df.to_sql(table_name, engine,if_exists="append", index = False)