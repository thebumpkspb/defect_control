from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from typing import List, Any, Callable
from app.schemas.settings import Equipment, Part, ProcessLine, Section, LineSection
from app.crud import ApprovalCRUD
from app.functions import is_empty_or_none
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ApprovalManager:
    def __init__(self):
        self.crud = ApprovalCRUD()

    async def daily_approval(
        self,
        text_data: str | None,
        db: AsyncSession,
    ):

        res = await self.crud.daily_approval(db=db, where_stmt=text_data)
        # ? format result into specific model before return
        return res

    async def weekly_approval(
        self,
        text_data: str | None,
        db: AsyncSession,
    ):

        res = await self.crud.weekly_approval(db=db, where_stmt=text_data)
        # ? format result into specific model before return
        return res

    async def biweekly_approval(
        self,
        text_data: str | None,
        db: AsyncSession,
    ):

        res = await self.crud.biweekly_approval(db=db, where_stmt=text_data)
        # ? format result into specific model before return
        return res
