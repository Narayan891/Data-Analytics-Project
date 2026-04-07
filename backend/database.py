import os
from sqlalchemy import create_engine

# Use Render's environment variable, fallback for local dev
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/zoo_db")

# Fix for Render: sqlalchemy needs 'postgresql://' instead of 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)