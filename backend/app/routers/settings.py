import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, List


from app.functions import api_key_auth, validate_org
from app.manager import SettingsManager
from app.schemas.settings import (
    CalendarResponse,
    GroupPartsResponse,
    LinePartProcessResponse,
    LinePartProcessesReceive,
    LinePartProcessesResponse,
    LineResponse,
    OrganizeLevelResponse,
    LinePartResponse,
    PartLineResponse,
    PartResponse,
    PartSubReceive,
    PartSubResponse,
    PositionResponse,
    ProcessRecieve,
    ProcessResponse,
    ProcessLineResponse,
    ProductLineResponse,
    SectionResponse,
    SymbolResponse,
    LineSectionResponse,
    ProcessLineSectionResponse,
    SubLineResponse,
    SubLinesResponse,
)


def settings_routers(
    db: AsyncGenerator, db_ms: AsyncGenerator, app_db: AsyncGenerator
) -> APIRouter:
    router = APIRouter()
    setting_manager = SettingsManager()
    # print("db:", type(db))
    # print("db_ms:", type(db_ms))

    @router.get("/edict", dependencies=[Depends(api_key_auth)])
    async def get_edict_setting():
        with open("edictUrlSetting.json", encoding="utf8") as f:
            setting = json.load(f)
        return setting

    @router.get(
        "/calendars",
        response_model=CalendarResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_calendars(
        date: str = Query(default=None, description="YYYY-MM-DD"),
        db: AsyncSession = Depends(db),
    ):
        return CalendarResponse(
            calendars=await setting_manager.get_calendars(date=date, db=db)
        )

    @router.get(
        "/group_parts",
        response_model=GroupPartsResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_group_parts(db: AsyncSession = Depends(db)):
        return GroupPartsResponse(groups=await setting_manager.get_group_parts(db=db))

    @router.get(
        "/lines",
        response_model=LineResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=300)
    async def get_lines(
        line_id: List[int] | None = Query(None),
        rx_only: bool = False,
        db: AsyncSession = Depends(db),
    ):
        print("get_lines db:", type(db))
        return LineResponse(
            lines=await setting_manager.get_lines(
                line_id=line_id, rx_only=rx_only, db=db
            )
        )

    @router.get(
        "/lines_by_org",
        response_model=LineSectionResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_lines_by_org(
        org_name: str,
        org_level: str | None = Query(
            default=None,
            description="division | department | section | line",
        ),
        req_dept: bool = False,
        db: AsyncSession = Depends(db),
    ):
        if org_level:
            if not validate_org(org_level):
                raise HTTPException(
                    status_code=400,
                    detail="Incorrect organize level option",
                )
        return LineSectionResponse(
            data=await setting_manager.get_lines_by_org(
                org_name=org_name, org_level=org_level, req_dept=req_dept, db=db
            )
        )

    @router.get(
        "/line_part_process",
        response_model=LinePartProcessResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_line_part_process(
        line_id: int | None = None,
        part_no: str | None = None,
        db: AsyncSession = Depends(db),
    ):
        return LinePartProcessResponse(
            data=await setting_manager.get_line_part_process(
                line_id=line_id, part_no=part_no, db=db
            )
        )

    @router.get(
        "/line_part_processes",
        response_model=LinePartProcessesResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_line_part_processes(
        line_id: List[int] | None = Query(default=None),
        part_no: List[str] | None = Query(default=None),
        process_id: List[int] | None = Query(default=None),
        db: AsyncSession = Depends(db),
    ):
        return LinePartProcessesResponse(
            data=await setting_manager.get_line_part_processes(
                line_id=line_id,
                part_no=part_no,
                process_id=process_id,
                db=db,
            )
        )

    @router.post("/line_part_processes", dependencies=[Depends(api_key_auth)])
    async def post_line_part_processes(
        data: LinePartProcessesReceive, db: AsyncSession = Depends(db)
    ):
        await setting_manager.post_line_part_processes(
            line_id=data.line_id, part_no=data.part_no, db=db
        )
        return "Registered new part successfully"

    @router.put("/line_part_processes", dependencies=[Depends(api_key_auth)])
    async def put_line_part_processes(
        data: LinePartProcessesReceive, db: AsyncSession = Depends(db)
    ):
        await setting_manager.update_line_part_processes(
            line_id=data.line_id,
            part_no=data.part_no,
            process_id=data.process_id,
            db=db,
        )
        return "Updated successfully"

    @router.delete(
        "/line_part_processes_by_line_and_part", dependencies=[Depends(api_key_auth)]
    )
    async def delete_line_part_processes_by_line_and_part(
        line_id: int, part_no: str, db: AsyncSession = Depends(db)
    ):
        await setting_manager.delete_line_part_processes_by_line_and_part(
            line_id=line_id, part_no=part_no, db=db
        )
        return "Unregistered part successfully"

    @router.get(
        "/line_sections",
        response_model=LineSectionResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_line_sections(db: AsyncSession = Depends(db)):
        return LineSectionResponse(data=await setting_manager.get_line_sections(db=db))

    @router.get(
        "/organize_level",
        response_model=OrganizeLevelResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_organize_level(
        org_level: str | None = Query(
            default=None,
            description="division | department | section | line",
        ),
        db: AsyncSession = Depends(db),
    ):
        if org_level:
            if not validate_org(org_level):
                raise HTTPException(
                    status_code=400,
                    detail="Incorrect organize level option",
                )
        return OrganizeLevelResponse(
            data=await setting_manager.get_organize_level(org_level=org_level, db=db)
        )

    @router.get(
        "/parts", response_model=PartResponse, dependencies=[Depends(api_key_auth)]
    )
    @cache(expire=300)
    async def get_parts(part_no: str | None = None, db: AsyncSession = Depends(db)):
        return PartResponse(
            parts=await setting_manager.get_parts(part_no=part_no, db=db)
        )

    @router.get(
        "/parts_distinct_part_no",
        response_model=PartResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_parts_distinct_part_no(
        part_no: str | None = None, db: AsyncSession = Depends(db)
    ):
        return PartResponse(
            parts=await setting_manager.get_parts_distinct_part_no(
                part_no=part_no, db=db
            )
        )

    # @router.get(
    #     "/parts_by_line",
    #     response_model=PartLineResponse,
    #     dependencies=[Depends(api_key_auth)],
    # )
    # @cache(expire=300)
    # async def get_parts_by_line(line_id: int, db: AsyncSession = Depends(db)):
    #     return PartLineResponse(
    #         parts=await setting_manager.get_parts_by_line(line_id, db)
    #     )
    @router.get(
        "/parts_by_line",
        response_model=PartLineResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=300)
    async def get_parts_by_line(
        line_id: int,
        process: str | None = None,
        db: AsyncSession = Depends(db),
        app_db: AsyncSession = Depends(app_db),
    ):
        return PartLineResponse(
            parts=await setting_manager.get_parts_by_line(line_id, process, db, app_db)
        )

    @router.get(
        "/sub_lines_by_partline",
        response_model=SubLinesResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=300)
    async def get_sub_lines_by_partline(
        line_code_rx: str,
        part_no: str | None = None,
        db_ms: AsyncSession = Depends(db_ms),
    ):
        return SubLinesResponse(
            sub_lines=await setting_manager.get_sub_lines_by_partline(
                line_code_rx, part_no, db_ms
            )
        )

    @router.get(
        "/parts_by_org",
        response_model=LinePartResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_parts_by_org(
        org_name: str,
        org_level: str | None = Query(
            default=None,
            description="division | department | section | line",
        ),
        db: AsyncSession = Depends(db),
    ):
        if org_level:
            if not validate_org(org_level):
                raise HTTPException(
                    status_code=400,
                    detail="Incorrect organize level option",
                )
        return LinePartResponse(
            data=await setting_manager.get_parts_by_org(
                org_name=org_name, org_level=org_level, db=db
            )
        )

    @router.post(
        "/parts_substring_by_part_no",
        response_model=PartSubResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_parts_substring_by_part_no(
        data: PartSubReceive, db: AsyncSession = Depends(db)
    ):
        return PartSubResponse(
            data=await setting_manager.get_parts_substring_by_part_no(
                part_no=data.part_no, db=db
            )
        )

    @router.get(
        "/positions",
        response_model=PositionResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_positions(db: AsyncSession = Depends(db)):
        return PositionResponse(positions=await setting_manager.get_positions(db=db))

    @router.get(
        "/processes",
        response_model=ProcessResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=300)
    async def get_processes(
        process_id: int | None = None,
        line_id: int | None = None,
        db: AsyncSession = Depends(db),
    ):
        return ProcessResponse(
            processes=await setting_manager.get_processes(
                process_id=process_id, line_id=line_id, db=db
            )
        )

    @router.post("/processes", dependencies=[Depends(api_key_auth)])
    async def post_processes(
        data: List[ProcessRecieve], db: AsyncSession = Depends(db)
    ):
        await setting_manager.post_processes(data=data, db=db)
        return "Registered process successfully"

    @router.delete("/process_by_id", dependencies=[Depends(api_key_auth)])
    async def delete_process_by_id(process_id: int, db: AsyncSession = Depends(db)):
        await setting_manager.delete_process_by_id(process_id=process_id, db=db)
        return "Unregisterd process successfully"

    @router.get(
        "/process_line",
        response_model=ProcessLineResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_process_line(
        section_code: List[str] | None = Query(default=None),
        line_id: List[int] | None = Query(default=None),
        process_id: List[int] | None = Query(default=None),
        process_name: List[str] | None = Query(default=None),
        db: AsyncSession = Depends(db),
    ):
        return ProcessLineResponse(
            data=await setting_manager.get_process_line(
                section_code=section_code,
                line_id=line_id,
                process_id=process_id,
                process_name=process_name,
                db=db,
            )
        )

    @router.get(
        "/process_line_section",
        response_model=ProcessLineSectionResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_process_line_section(
        section_code: List[str] | None = Query(default=None),
        line_id: List[int] | None = Query(default=None),
        process_id: List[int] | None = Query(default=None),
        process_name: List[str] | None = Query(default=None),
        db: AsyncSession = Depends(db),
    ):
        return ProcessLineSectionResponse(
            data=await setting_manager.get_process_line_section(
                section_code=section_code,
                line_id=line_id,
                process_id=process_id,
                process_name=process_name,
                db=db,
            )
        )

    @router.get(
        "/product_line",
        response_model=ProductLineResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_product_line(db: AsyncSession = Depends(db)):
        return ProductLineResponse(data=await setting_manager.get_product_line(db=db))

    @router.get(
        "/sections",
        response_model=SectionResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_sections(indirect_only: bool = False, db: AsyncSession = Depends(db)):
        return SectionResponse(
            sections=await setting_manager.get_sections(
                indirect_only=indirect_only, db=db
            )
        )

    @router.get(
        "/sections_by_org",
        response_model=SectionResponse,
        dependencies=[Depends(api_key_auth)],
    )
    @cache(expire=300)
    async def get_sections_by_org(
        org_name: str,
        org_level: str | None = Query(
            default=None,
            description="division | department",
        ),
        db: AsyncSession = Depends(db),
    ):
        if org_level:
            if not validate_org(org_level, "section"):
                raise HTTPException(
                    status_code=400,
                    detail="Incorrect organize level option",
                )
        return SectionResponse(
            sections=await setting_manager.get_sections_by_org(
                org_name=org_name, org_level=org_level, db=db
            )
        )

    @router.get(
        "/sub_lines",
        response_model=SubLineResponse,
        dependencies=[Depends(api_key_auth)],
    )
    # @cache(expire=300)
    async def get_sub_lines(
        line_code_rx: str | None = Query(None),
        part_no: str | None = Query(None),
        db_ms: AsyncSession = Depends(db_ms),
    ):
        return SubLineResponse(
            sub_lines=await setting_manager.get_sub_lines(
                line_code_rx=line_code_rx, part_no=part_no, db=db_ms
            )
        )

    @router.get(
        "/symbols", response_model=SymbolResponse, dependencies=[Depends(api_key_auth)]
    )
    @cache(expire=300)
    async def get_symbols(db: AsyncSession = Depends(db)):
        return SymbolResponse(symbols=await setting_manager.get_symbols(db=db))

    return router
