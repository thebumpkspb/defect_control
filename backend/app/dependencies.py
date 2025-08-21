from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator
from .database import app_pg_async_session, common_pg_async_session, epddev_pg_async_session, prod_my_session


async def get_app_pg_async_db():
    db = app_pg_async_session()
    try:
        yield db
    finally:
        await db.close()

async def get_app_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with app_pg_async_session() as session:
        yield session

async def get_app_db(session: AsyncSession = Depends(get_app_async_session)):
    yield session


async def get_common_pg_async_db():
    db = common_pg_async_session()
    try:
        yield db
    finally:
        await db.close()

async def get_common_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with common_pg_async_session() as session:
        yield session

async def get_common_db(session: AsyncSession = Depends(get_common_async_session)):
    yield session

    
async def get_epddev_pg_async_db():
    db = epddev_pg_async_session()
    try:
        yield db
    finally:
        await db.close()

async def get_epddev_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with epddev_pg_async_session() as session:
        yield session

async def get_epddev_db(session: AsyncSession = Depends(get_epddev_async_session)):
    yield session


def get_prod_my_db():
    db = prod_my_session()
    try:
        yield db
    finally:
        db.close()


async def get_prod_my_session() -> AsyncGenerator[AsyncSession, None]:
    async with prod_my_session() as session:
        yield session


async def get_prod_db(session: AsyncSession = Depends(get_prod_my_session)):




    yield session
