from fastapi import APIRouter, Depends, Query

# from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, List

from app.functions import api_key_auth
from app.manager import SearchManager
from app.schemas.settings import (
    EquipmentResponse,
    PartResponse,
    ProcessLineResponse,
    SectionResponse,
    LineSectionResponse,
)


def search_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    search_manager = SearchManager()

    @router.get(
        "/equipment",
        response_model=EquipmentResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=15)
    async def get_search_equipments(
        equipment: str | None = None,
        fields: List[str] | None = Query(
            default=None,
            description="specific field to search",
        ),
        limit: int = 20,
        offset: int = 0,
        order_by: str | None = None,
        direction: str | None = Query(default=None, description="ASC | DESC"),
        db: AsyncSession = Depends(db),
    ):
        return EquipmentResponse(
            equipments=await search_manager.get_search_equipments(
                equipment=equipment,
                fields=fields,
                limit=limit,
                offset=offset,
                order_by=order_by,
                direction=direction,
                db=db,
            )
        )

    @router.get(
        "/line_section",
        response_model=LineSectionResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=15)
    async def get_search_line_sections(
        line: str | None = None,
        fields: List[str] | None = Query(
            default=None,
            description="specific field to search",
        ),
        limit: int = 20,
        offset: int = 0,
        order_by: str | None = None,
        direction: str | None = Query(default=None, description="ASC | DESC"),
        db: AsyncSession = Depends(db),
    ):
        return LineSectionResponse(
            data=await search_manager.get_search_line_sections(
                line=line,
                fields=fields,
                limit=limit,
                offset=offset,
                order_by=order_by,
                direction=direction,
                db=db,
            )
        )

    @router.get(
        "/part", response_model=PartResponse, dependencies=[Depends(api_key_auth)]
    )
    # @cache(expire=15)
    async def get_search_parts(
        part: str | None = None,
        fields: List[str] | None = Query(
            default=None,
            description="specific field to search",
        ),
        limit: int = 20,
        offset: int = 0,
        order_by: str | None = None,
        direction: str | None = Query(default=None, description="ASC | DESC"),
        db: AsyncSession = Depends(db),
    ):
        return PartResponse(
            parts=await search_manager.get_search_parts(
                part=part,
                fields=fields,
                limit=limit,
                offset=offset,
                order_by=order_by,
                direction=direction,
                db=db,
            )
        )

    @router.get(
        "/process",
        response_model=ProcessLineResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=15)
    async def get_search_processes(
        process: str | None = None,
        line_id: int | None = None,
        fields: List[str] | None = Query(
            default=None,
            description="specific field to search",
        ),
        limit: int = 20,
        offset: int = 0,
        order_by: str | None = None,
        direction: str | None = Query(default=None, description="ASC | DESC"),
        db: AsyncSession = Depends(db),
    ):
        return ProcessLineResponse(
            data=await search_manager.get_search_processes(
                process=process,
                line_id=line_id,
                fields=fields,
                limit=limit,
                offset=offset,
                order_by=order_by,
                direction=direction,
                db=db,
            )
        )

    @router.get(
        "/section",
        response_model=SectionResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=15)
    async def get_search_sections(
        section: str | None = None,
        fields: List[str] | None = Query(
            default=None,
            description="specific field to search",
        ),
        limit: int = 20,
        offset: int = 0,
        order_by: str | None = None,
        direction: str | None = Query(default=None, description="ASC | DESC"),
        db: AsyncSession = Depends(db),
    ):
        return SectionResponse(
            sections=await search_manager.get_search_sections(
                section=section,
                fields=fields,
                limit=limit,
                offset=offset,
                order_by=order_by,
                direction=direction,
                db=db,
            )
        )

    return router
