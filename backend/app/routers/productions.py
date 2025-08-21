from fastapi import APIRouter, Depends, HTTPException, Query
import json
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, Generator


from app.functions import api_key_auth
from app.manager import ProductionsManager
from app.schemas.productions import ProductionQtyResponse
from app.functions import validate_date


def productions_routers(db: Generator, db_common: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    prod_manager = ProductionsManager()

    @router.get(
        "/prod_qty",
        response_model=ProductionQtyResponse,
        dependencies=[Depends(api_key_auth)],
    )
    async def get_prod_qty(
        line_id: int,
        shift: str = Query(description="A | B | All"),
        date: str = Query(None, description="YYYY-MM-DD"),
        db: AsyncSession = Depends(db),
        db_common: AsyncSession = Depends(db_common),
    ):
        if date:
            if not validate_date(date):
                raise HTTPException(
                    status_code=400,
                    detail="Incorrect date format, should be 'YYYY-MM-DD'",
                )
        else:
            date = '2025-01-01'

        with open("mock_prod_qty.json", encoding="utf8") as f:
            mock_up = json.load(f)
        if shift.lower() == "a":
            if date[5:6] == "11":
                data = mock_up[0]
            elif date[5:6] == "12":
                data = mock_up[3]
            else:
                data = mock_up[6]
        elif shift.lower() == "b":
            if date[5:6] == "11":
                data = mock_up[1]
            elif date[5:6] == "12":
                data = mock_up[4]
            else:
                data = mock_up[7]
        else:
            if date[5:6] == "11":
                data = mock_up[2]
            elif date[5:6] == "12":
                data = mock_up[5]
            else:
                data = mock_up[8]
        return ProductionQtyResponse(prod_qty=data.get("prod_qty"))

        # return ProductionQtyResponse(
        #     prod_qty=await prod_manager.get_prod_qty(
        #         line_id, shift, date, db, db_common
        #     )
        # )

    return router
