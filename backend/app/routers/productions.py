from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, List, Literal


from app.functions import api_key_auth
from app.manager import ProductionsManager
from app.schemas.productions import ProductionQtyAccResponse, ProductionQtyResponse
from app.functions import validate_date


def productions_routers(
    db_my: AsyncGenerator,
    db_ms: AsyncGenerator,
    db_common: AsyncGenerator,
) -> APIRouter:
    router = APIRouter()
    prod_manager = ProductionsManager()

    @router.get(
        "/prod_qty",
        response_model=ProductionQtyResponse,
        dependencies=[Depends(api_key_auth)],
    )
    async def get_prod_qty(
        line_id: List[int] = Query(None),
        part_no: str = None,
        process_name: str = None,
        shift: str = Query(description="A | B | All"),
        part_line_id: str = None,
        date: str = Query(None, description="YYYY-MM-DD"),
        type: Literal["Daily", "Monthly", "Yearly"] = "Daily",
        db_my: AsyncSession = Depends(db_my),
        db_ms: AsyncSession = Depends(db_ms),
        db_common: AsyncSession = Depends(db_common),
    ):
        if date:
            if not validate_date(date):
                raise HTTPException(
                    status_code=400,
                    detail="Incorrect date format, should be 'YYYY-MM-DD'",
                )

        return ProductionQtyResponse(
            prod_qty=await prod_manager.get_prod_qty(
                line_id=line_id,
                part_no=part_no,
                process_name=process_name,
                shift=shift,
                part_line_id=part_line_id,
                date=date,
                db_my=db_my,
                db_ms=db_ms,
                db_common=db_common,
            )
        )

    @router.get(
        "/prod_qty_acc",
        response_model=ProductionQtyAccResponse,
        dependencies=[Depends(api_key_auth)],
    )
    async def prod_qty_acc(
        line_id: List[int] = Query(),
        shift: str = Query(description="A | B | All"),
        date: str = Query(None, description="YYYY-MM-DD"),
        db_my: AsyncSession = Depends(db_my),
        db_common: AsyncSession = Depends(db_common),
    ):
        if date:
            if not validate_date(date):
                raise HTTPException(
                    status_code=400,
                    detail="Incorrect date format, should be 'YYYY-MM-DD'",
                )

        return ProductionQtyAccResponse(
            prod_qty_acc=await prod_manager.get_prod_qty_acc(
                line_id,
                shift,
                date,
                db_my,
                db_common,
            )
        )

    return router
