import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# For async operations
engine = create_async_engine(settings.DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

def use_sqlite_fallback():
    global engine, AsyncSessionLocal
    sqlite_url = "sqlite+aiosqlite:///./krishiai.db"
    print(f"WARNING: Database connection failed. Switching to local SQLite database: {sqlite_url}", file=sys.stderr, flush=True)
    engine = create_async_engine(sqlite_url, echo=True)
    AsyncSessionLocal.configure(bind=engine)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
