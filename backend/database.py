from sqlalchemy import create_engine
import os

DATABASE_URL = os.getenv("postgresql://zoo_db_4zo0_user:mPBvdLFNoUYYEBKUG9KjEfId1zjOlQZH@dpg-d7a6ed7pm1nc73bus3kg-a.oregon-postgres.render.com/zoo_db_4zo0")

DATABASE_URL = "postgresql://postgres:1234@localhost:5432/zoo_db"

engine = create_engine(DATABASE_URL)