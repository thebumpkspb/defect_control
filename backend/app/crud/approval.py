import os
from fastapi import HTTPException
import requests
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text
from starlette import status
from app.functions import (
    get_week_in_month_and_year_month,
    get_half_month_and_year_month,
)


class ApprovalCRUD:
    def __init__(self):
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")

    def get_line_id(self, linename):
        id_linename = None
        list_line = []
        list_line_id = []

        try:
            ## get list_line_id, list_line_name from api
            endpoint = self.BACKEND_URL_SERVICE + "/api/settings/lines?rx_only=false"
            headers = {"X-API-Key": self.BACKEND_API_SERVICE}
            response_json = requests.get(endpoint, headers=headers).json()

            for i in range(0, len(response_json["lines"])):
                list_line.append(response_json["lines"][i]["section_line"])
                list_line_id.append(response_json["lines"][i]["line_id"])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        index_select = list_line.index(linename)
        id_linename = list_line_id[index_select]

        return id_linename

    async def daily_approval(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()
        # month = data["date"][0:7]
        date = data["date"]
        line_name = data["line_name"]
        part_no = f"'{data['part_no']}'" if data["part_no"] else "null"
        process = data["process"]
        shift = data["shift"]
        sub_line = f"'{data['sub_line']}'" if data["sub_line"] else "null"
        user_uuid = data["user_uuid"]
        user_name = data["user_name"]
        line_id = self.get_line_id(line_name)
        if shift == "All":
            stmt = f"""
                        INSERT INTO public.approval_daily(
                            date, line_id, part_no, process, sub_line, shift, user_uuid, user_name)
                            VALUES ( 
                                        '{date}', 
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        'A',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (date, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name
                        
                    """

            await db.execute(text(stmt))
            stmt = f"""
                        INSERT INTO public.approval_daily(
                            date, line_id, part_no, process, sub_line, shift, user_uuid, user_name)
                            VALUES ( 
                                        '{date}', 
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        'B',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (date, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name
                    """

            await db.execute(text(stmt))
        else:
            stmt = f"""
                        INSERT INTO public.approval_daily(
                            date, line_id, part_no, process, sub_line, shift, user_uuid, user_name)
                            VALUES ( 
                                        '{date}', 
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        '{shift}',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (date, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name
                    """

            await db.execute(text(stmt))
        await db.commit()
        return data

    async def weekly_approval(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()
        # month = data["date"][0:7]
        date = data["date"]
        week_number, year_month = get_week_in_month_and_year_month(date)
        line_name = data["line_name"]
        part_no = f"'{data['part_no']}'" if data["part_no"] else "null"
        process = data["process"]
        shift = data["shift"]
        sub_line = f"'{data['sub_line']}'" if data["sub_line"] else "null"
        user_uuid = data["user_uuid"]
        user_name = data["user_name"]
        line_id = self.get_line_id(line_name)
        if shift == "All":
            stmt = f"""
                        INSERT INTO public.approval_weekly(
                            week_number, year_month, line_id, part_no, process, sub_line, shift, checked_status, user_uuid, user_name)
                            VALUES ( 
                                        '{week_number}', 
                                        '{year_month}',
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        'A',
                                        'True',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (week_number, year_month, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name,
                                checked_status = excluded.checked_status
                        
                    """

            await db.execute(text(stmt))
            stmt = f"""
                        INSERT INTO public.approval_weekly(
                            week_number, year_month, line_id, part_no, process, sub_line, shift, checked_status, user_uuid, user_name)
                            VALUES ( 
                                        '{week_number}', 
                                        '{year_month}',
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        'B',
                                        'True',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (week_number, year_month, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name,
                                checked_status = excluded.checked_status
                    """

            await db.execute(text(stmt))
        else:
            stmt = f"""
                        INSERT INTO public.approval_weekly(
                            week_number, year_month, line_id, part_no, process, sub_line, shift, checked_status, user_uuid, user_name)
                            VALUES ( 
                                        '{week_number}', 
                                        '{year_month}',
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        '{shift}',
                                        'True',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (week_number, year_month, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name,
                                checked_status = excluded.checked_status
                    """

            await db.execute(text(stmt))
        await db.commit()
        return data

    async def biweekly_approval(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()
        # month = data["date"][0:7]
        date = data["date"]
        half_month, year_month = get_half_month_and_year_month(date)
        line_name = data["line_name"]
        part_no = f"'{data['part_no']}'" if data["part_no"] else "null"
        process = data["process"]
        shift = data["shift"]
        sub_line = f"'{data['sub_line']}'" if data["sub_line"] else "null"
        user_uuid = data["user_uuid"]
        user_name = data["user_name"]
        line_id = self.get_line_id(line_name)
        if shift == "All":
            stmt = f"""
                        INSERT INTO public.approval_bi_weekly(
                            half_month, year_month, line_id, part_no, process, sub_line, shift, checked_status, user_uuid, user_name)
                            VALUES ( 
                                        '{half_month}', 
                                        '{year_month}',
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        'A',
                                        'True',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (half_month, year_month, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name,
                                checked_status = excluded.checked_status
                        
                    """

            await db.execute(text(stmt))
            stmt = f"""
                        INSERT INTO public.approval_bi_weekly(
                            half_month, year_month, line_id, part_no, process, sub_line, shift, checked_status, user_uuid, user_name)
                            VALUES ( 
                                        '{half_month}', 
                                        '{year_month}',
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        'B',
                                        'True',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (half_month, year_month, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name,
                                checked_status = excluded.checked_status
                    """

            await db.execute(text(stmt))
        else:
            stmt = f"""
                        INSERT INTO public.approval_bi_weekly(
                            half_month, year_month, line_id, part_no, process, sub_line, shift, checked_status, user_uuid, user_name)
                            VALUES ( 
                                        '{half_month}', 
                                        '{year_month}',
                                        '{line_id}',
                                        {part_no},
                                        '{process}',
                                        {sub_line},
                                        '{shift}',
                                        'True',
                                        '{user_uuid}',
                                        '{user_name}'
                                    )
                            ON CONFLICT (half_month, year_month, line_id, part_no, process, sub_line, shift)   
                            DO UPDATE SET  
                                user_uuid = excluded.user_uuid,  
                                user_name = excluded.user_name,
                                checked_status = excluded.checked_status
                    """

            await db.execute(text(stmt))
        await db.commit()
        return data
