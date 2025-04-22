from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use the DATABASE_URL from environment, but fall back to SQLite if PostgreSQL is not available
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/zoopjobs")

# If the environment variable exists but connection fails, use SQLite as fallback
try:
    engine = create_engine(DATABASE_URL)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"Error connecting to database: {e}")
    print("Falling back to SQLite database")
    DATABASE_URL = "sqlite:///./zoopjobs.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 