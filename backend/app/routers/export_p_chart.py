from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, Optional, List
from datetime import datetime
import traceback

from app.functions import api_key_auth
from app.manager import Export_P_Chart_Manager


def export_p_chart_routers(
    db: AsyncGenerator,
    db_common_pg_async: AsyncGenerator,
    db_prod_ms: AsyncGenerator,
    db_prod_my: AsyncGenerator,
) -> APIRouter:
    router = APIRouter()
    export_p_chart_manager = Export_P_Chart_Manager()

    @router.get("/pchart-defect-records/", dependencies=[Depends(api_key_auth)])
    async def get_pchart_defect_records(
        month: Optional[str] = Query(None, description="Filter by month"),
        line_name: Optional[str] = Query(None, description="Filter by line name"),
        part_no: Optional[str] = Query(None, description="Filter by part number"),
        sub_line: Optional[str] = Query(None, description="Filter by sub line"),
        sub_line_label: Optional[str] = Query(
            None, description="Filter by sub line label"
        ),
        process: Optional[str] = Query(None, description="Filter by process"),
        shift: Optional[str] = Query(None, description="Filter by shift"),
        file_type: Optional[str] = Query(None, description="Select file type"),
        is_not_zero: Optional[bool] = Query(False, description="Select is not zero"),
        updated_at_start: Optional[datetime] = Query(
            None, description="Filter records updated after this date"
        ),
        updated_at_end: Optional[datetime] = Query(
            None, description="Filter records updated before this date"
        ),
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
        db_prod_ms: AsyncSession = Depends(db_prod_ms),
        db_prod_my: AsyncSession = Depends(db_prod_my),
    ):
        """
        Endpoint to query `pchart_defect_record` table with filter options.
        """
        try:
            filters = {
                "month": month,
                "line_name": line_name,
                "part_no": part_no,
                "process": process,
                "sub_line": sub_line,
                "sub_line_label": sub_line_label,
                "shift": shift,
                "file_type": file_type,
                "is_not_zero": is_not_zero,
                "updated_at_start": updated_at_start,
                "updated_at_end": updated_at_end,
            }
            # print("filters:", filters)
            records = await export_p_chart_manager.fetch_pchart_defect_records_service(
                filters=filters,
                db=db,
                db_common_pg_async=db_common_pg_async,
                db_prod_ms=db_prod_ms,
                db_prod_my=db_prod_my,
            )
            now = datetime.now()

            # Format as mm-yyyy
            month_year = now.strftime("%m-%Y")

            # Get the Unix timestamp
            unix_time = int(now.timestamp())

            if not records:
                traceback.print_exc()
                raise HTTPException(
                    status_code=404,
                    detail="No records found with the provided filters.",
                )
                # Return the PDF with inline Content-Disposition
            # print('filters["file_type"]:', filters["file_type"])
            part_no_filename = (
                filters["part_no"] if filters["process"] != "Outline" else "All"
            )
            if filters["file_type"] == "pdf":
                part_no_filename
                filename = f'P-Chart-{filters [ "process" ]}-{part_no_filename}-{filters [ "sub_line" ]}-{month_year}-{unix_time}.pdf'
                media_type = "application/pdf"
            elif filters["file_type"] == "excel":
                filename = f'P-Chart-{filters [ "process" ]}-{part_no_filename}-{filters [ "sub_line" ]}-{month_year}-{unix_time}.xlsx'
                media_type = (
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
            # print(f"records:{records} filename:{filename} media_type:{media_type}")
            return FileResponse(
                path=records,
                filename=filename,
                media_type=media_type,
                headers={"Content-Disposition": "inline"},
            )

        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    return router
