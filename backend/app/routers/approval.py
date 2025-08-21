from fastapi import APIRouter, Depends, Query

# from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, List

from app.functions import api_key_auth
from app.manager import ApprovalManager
from app.schemas.approval import (
    Daily_Approval_Response,
    Daily_Approval,
    Weekly_Approval_Response,
    Weekly_Approval,
    BiWeekly_Approval_Response,
    BiWeekly_Approval,
)


def approval_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    approval_manager = ApprovalManager()

    @router.post(
        "/daily_approval",
        response_model=Daily_Approval_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def daily_approval(text_data: Daily_Approval, db: AsyncSession = Depends(db)):
        """
        Example\n
        \n{
        \n"line_name": "414454 - Starter Assy PA70",
        \n"part_no": "TG428000-0630",
        \n"shift": "A",
        \n"process": "Inline",
        \n"date": "05-May-2025",
        \n"user_uuid": "test",
        \n"user_name": "test"
        \n}

        """
        return Daily_Approval_Response(
            daily_approval=await approval_manager.daily_approval(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/weekly_approval",
        response_model=Weekly_Approval_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def weekly_approval(
        text_data: Weekly_Approval, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        \n{
        \n"line_name": "414454 - Starter Assy PA70",
        \n"part_no": "TG428000-0630",
        \n"shift": "A",
        \n"process": "Inline",
        \n"date": "05-May-2025",
        \n"user_uuid": "test",
        \n"user_name": "test"
        \n}

        """
        return Weekly_Approval_Response(
            weekly_approval=await approval_manager.weekly_approval(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/biweekly_approval",
        response_model=BiWeekly_Approval_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def biweekly_approval(
        text_data: BiWeekly_Approval, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        \n{
        \n"line_name": "414454 - Starter Assy PA70",
        \n"part_no": "TG428000-0630",
        \n"shift": "A",
        \n"process": "Inline",
        \n"date": "05-May-2025",
        \n"user_uuid": "test",
        \n"user_name": "test"
        \n}

        """
        return BiWeekly_Approval_Response(
            biweekly_approval=await approval_manager.biweekly_approval(
                text_data=text_data, db=db
            )
        )

    return router
