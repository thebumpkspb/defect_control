import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()

PG_USER_APP = os.environ.get("PG_USER_APP")
PG_PASS_APP = urllib.parse.quote_plus(os.environ.get("PG_PASS_APP"))
PG_SERVER_APP = os.environ.get("PG_SERVER_APP")
PG_PORT_APP = os.environ.get("PG_PORT_APP")
PG_DB_APP = os.environ.get("PG_DB_APP")

PG_USER_COMMON = os.environ.get("PG_USER_COMMON")
PG_PASS_COMMON = urllib.parse.quote_plus(os.environ.get("PG_PASS_COMMON"))
PG_SERVER_COMMON = os.environ.get("PG_SERVER_COMMON")
PG_PORT_COMMON = os.environ.get("PG_PORT_COMMON")
PG_DB_COMMON = os.environ.get("PG_DB_COMMON")

PG_USER_EPDDEV = os.environ.get("PG_USER_EPDDEV")
PG_PASS_EPDDEV = urllib.parse.quote_plus(os.environ.get("PG_PASS_EPDDEV"))
PG_SERVER_EPDDEV = os.environ.get("PG_SERVER_EPDDEV")
PG_PORT_EPDDEV = os.environ.get("PG_PORT_EPDDEV")
PG_DB_EPDDEV = os.environ.get("PG_DB_EPDDEV")

MY_USER_PROD = os.environ.get("MY_USER_PROD")
MY_PASS_PROD = urllib.parse.quote_plus(os.environ.get("MY_PASS_PROD"))
MY_SERVER_PROD = os.environ.get("MY_SERVER_PROD")
MY_PORT_PROD = os.environ.get("MY_PORT_PROD")
MY_DB_PROD = os.environ.get("MY_DB_PROD")


PG_ASYNC_SQLALCHEMY_DATABASE_URL_APP = f"postgresql+asyncpg://{PG_USER_APP}:{PG_PASS_APP}@{PG_SERVER_APP}:{PG_PORT_APP}/{PG_DB_APP}"
app_pg_async_engine = create_async_engine(
    PG_ASYNC_SQLALCHEMY_DATABASE_URL_APP, echo=False, poolclass=NullPool
)
app_pg_async_session = sessionmaker(
    app_pg_async_engine, expire_on_commit=False, class_=AsyncSession
)

PG_ASYNC_SQLALCHEMY_DATABASE_URL_COMMON = f"postgresql+asyncpg://{PG_USER_COMMON}:{PG_PASS_COMMON}@{PG_SERVER_COMMON}:{PG_PORT_COMMON}/{PG_DB_COMMON}"
common_pg_async_engine = create_async_engine(
    PG_ASYNC_SQLALCHEMY_DATABASE_URL_COMMON, echo=False, poolclass=NullPool
)
common_pg_async_session = sessionmaker(
    common_pg_async_engine, expire_on_commit=False, class_=AsyncSession
)

PG_ASYNC_SQLALCHEMY_DATABASE_URL_EPDDEV = f"postgresql+asyncpg://{PG_USER_EPDDEV}:{PG_PASS_EPDDEV}@{PG_SERVER_EPDDEV}:{PG_PORT_EPDDEV}/{PG_DB_EPDDEV}"
epddev_pg_async_engine = create_async_engine(
    PG_ASYNC_SQLALCHEMY_DATABASE_URL_EPDDEV, echo=False, poolclass=NullPool
)
epddev_pg_async_session = sessionmaker(
    epddev_pg_async_engine, expire_on_commit=False, class_=AsyncSession
)

MY_SQLALCHEMY_DATABASE_URL_PROD = f"mysql+pymysql://{MY_USER_PROD}:{MY_PASS_PROD}@{MY_SERVER_PROD}:{MY_PORT_PROD}/{MY_DB_PROD}"
prod_my_engine = create_engine(
    MY_SQLALCHEMY_DATABASE_URL_PROD,
    echo=False,
)

prod_my_session = sessionmaker(autocommit=False, autoflush=False, bind=prod_my_engine)

Base = declarative_base()
