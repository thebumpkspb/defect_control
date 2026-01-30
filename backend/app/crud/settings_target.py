from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from sqlalchemy.sql import text
from dotenv import load_dotenv
import requests
import json
import os
from app.schemas.settings import (
    # CalendarResponse,
    # GroupPartsResponse,
    # LinePartProcessResponse,
    # LinePartProcessesReceive,
    # LinePartProcessesResponse,
    LineResponse,
    # OrganizeLevelResponse,
    # LinePartResponse,
    # PartLineResponse,
    # PartResponse,
    # PartSubReceive,
    # PartSubResponse,
    # PositionResponse,
    # ProcessRecieve,
    # ProcessResponse,
    # ProcessLineResponse,
    # ProductLineResponse,
    # SectionResponse,
    # SymbolResponse,
    # LineSectionResponse,
    # ProcessLineSectionResponse,
    # SubLineResponse,
)

load_dotenv()


class Settings_Target_CRUD:
    def __init__(self):
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")
        from app.manager import SettingsManager
        from app.manager import ProductionsManager

        self.setting_manager = SettingsManager()
        self.prod_manager = ProductionsManager()

    async def get_line_id(self, linename, db_common_pg_async: AsyncSession):
        id_linename = None
        list_line = []
        list_line_id = []
        response = LineResponse(
            lines=await self.setting_manager.get_lines(
                rx_only=False, db=db_common_pg_async
            )
        )
        response_str = response.json()
        response_json = json.loads(response_str)
        for i in range(0, len(response_json["lines"])):
            list_line.append(response_json["lines"][i]["section_line"])
            list_line_id.append(response_json["lines"][i]["line_id"])
        # try:
        #     ## get list_line_id, list_line_name from api
        #     endpoint = self.BACKEND_URL_SERVICE + "/api/settings/lines?rx_only=false"
        #     headers = {"X-API-Key": self.BACKEND_API_SERVICE}
        #     response_json = requests.get(endpoint, headers=headers).json()

        #     for i in range(0, len(response_json["lines"])):
        #         list_line.append(response_json["lines"][i]["section_line"])
        #         list_line_id.append(response_json["lines"][i]["line_id"])

        # except Exception as e:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail=f"because {e}",
        #     )

        index_select = list_line.index(linename)
        id_linename = list_line_id[index_select]

        return id_linename

    async def table_view(
        self,
        db: AsyncSession,
        db_common_pg_async: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        process = data["process"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]

        ## query db
        where_stmt = " active = 'active' "

        line_id = await self.get_line_id(
            linename=line_name, db_common_pg_async=db_common_pg_async
        )

        ## check filter
        if line_name != "":
            where_stmt = where_stmt + " AND line_id = '" + str(line_id) + "' "

        if process:
            where_stmt = where_stmt + " AND process = '" + process + "' "

        if part_name:
            where_stmt = where_stmt + " AND part_name = '" + part_name + "' "

        if part_no:
            where_stmt = where_stmt + " AND part_no = '" + part_no + "' "

        if sub_line:
            where_stmt = where_stmt + " AND sub_line = '" + sub_line + "' "

        stmt = f"SELECT * FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        # print("stmt: ", stmt)
        return rs, data

    async def table_edit_view(
        self,
        db: AsyncSession,
        db_common_pg_async: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]
        process = data["process"]
        target_type = data["target_type"]
        month_year = data["month_year"]
        target_control = data["target_control"]

        line_id = await self.get_line_id(line_name, db_common_pg_async)

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            # + "' AND part_name = '"
            # + part_name
            # + "' AND part_no = '"
            # + part_no
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND process = '"
            + process
            + "' AND target_type = '"
            + target_type
            + "' AND month_year = '"
            + month_year
            + "' AND active = 'active' "
        )
        if part_name:
            where_stmt = where_stmt + " AND part_name = '" + part_name + "'"
        else:
            where_stmt = where_stmt + " AND part_name is null"
        if part_no:
            where_stmt = where_stmt + " AND part_no = '" + part_no + "'"
        else:
            where_stmt = where_stmt + " AND part_no is null"
        if sub_line:
            where_stmt = where_stmt + " AND sub_line = '" + sub_line + "'"
        else:
            where_stmt = where_stmt + " AND sub_line is null"
        stmt = f"SELECT * FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs, data

    async def table_edit_view_line_name_change(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def table_edit_save(
        self,
        db: AsyncSession,
        db_common_pg_async: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]
        process = data["process"]
        target_type = data["target_type"]
        month_year = data["month_year"]
        target_control = data["target_control"]
        creator = data["creator"]
        id = data["id"]

        line_id = await self.get_line_id(line_name, db_common_pg_async)

        status = True

        ## check new record ??
        ## query db
        stmt = (
            "UPDATE master_target_line SET active = 'edit', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  id = "
            + str(id)
        )
        await db.execute(text(stmt))
        await db.commit()

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND process = '"
            + process
            # + "' AND part_no = '"
            # + part_no
            # + "' AND part_name = '"
            # + part_name
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND target_type = '"
            + target_type
            + "' AND month_year = '"
            + month_year
            + "' AND active in ('delete','edit','active') "
        )
        if part_name:
            where_stmt = where_stmt + " AND part_name = '" + part_name + "'"
        else:
            where_stmt = where_stmt + " AND part_name is null"
        if part_no:
            where_stmt = where_stmt + " AND part_no = '" + part_no + "'"
        else:
            where_stmt = where_stmt + " AND part_no is null"
        if sub_line:
            where_stmt = where_stmt + " AND sub_line = '" + sub_line + "'"
        else:
            where_stmt = where_stmt + " AND sub_line is null"
        part_name = "'" + part_name + "'" if part_name else "null"
        part_no = "'" + part_no + "'" if part_no else "null"
        sub_line = "'" + sub_line + "'" if sub_line else "null"
        ## query db
        stmt = f"SELECT id FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db
            stmt = f"""UPDATE master_target_line SET target_control = {target_control}, active = 'active', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()

            status = False

        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO master_target_line ( line_id, process, part_no, part_name, sub_line, target_type, month_year, target_control, creator, created_at, updated_at, active) VALUES ( '{line_id}','{process}',{part_no},{part_name},{sub_line},'{target_type}','{month_year}',{target_control},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7','active' )"""
            await db.execute(text(stmt))
            await db.commit()

        return data

    async def table_delete(
        self,
        db: AsyncSession,
        db_common_pg_async: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]
        process = data["process"]
        target_type = data["target_type"]
        month_year = data["month_year"]
        target_control = data["target_control"]

        line_id = await self.get_line_id(line_name, db_common_pg_async)

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_name = '"
            + part_name
            + "' AND part_no = '"
            + part_no
            + "' AND sub_line = '"
            + sub_line
            + "' AND process = '"
            + process
            + "' AND target_type = '"
            + target_type
            + "' AND month_year = '"
            + month_year
            + "' AND target_control = "
            + str(target_control)
            + " AND active = 'active' "
        )

        stmt = f"""UPDATE master_target_line SET active = 'delete', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
        await db.execute(text(stmt))
        await db.commit()

        return data

    async def add_row_view(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        return data

    async def add_row_view_line_name_change(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def get_sub_part(
        self,
        db: AsyncSession,
        db_common_pg_async: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        process = data["process"]

        line_id = await self.get_line_id(line_name, db_common_pg_async)

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND process = '"
            + process
            + "' AND active = 'active' "
        )
        stmt = f"""SELECT DISTINCT ON (sub_part_no) id,
                    line_id,
                    sub_part_no,
                    sub_part_name
                FROM master_sub_part
                
                WHERE  {where_stmt if where_stmt is not None else ''}
                ORDER BY sub_part_no"""
        # stmt = f"SELECT * FROM master_sub_part WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs

    async def add_row_ok(
        self,
        db: AsyncSession,
        db_common_pg_async: AsyncSession,
        where_stmt: str | None = None,
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]
        # part_name = f"""'{data["part_name"]}'""" if data["part_name"] else "null"
        # part_no = f"""'{data["part_no"]}'""" if data["part_no"] else "null"
        # sub_line = f"""'{data["sub_line"]}'""" if data["sub_line"] else "null"
        process = data["process"]
        target_type = data["target_type"]
        month_year = data["month_year"]
        target_percent = data["target_percent"]
        creator = data["creator"]

        line_id = await self.get_line_id(line_name, db_common_pg_async)

        status = True

        ## check new record ??
        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND process = '"
            + process
            # + "' AND part_no = '"
            # + part_no
            # + "' AND part_name = '"
            # + part_name
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND target_type = '"
            + target_type
            + "' AND month_year = '"
            + month_year
            + "' AND active in ('delete','edit','active') "
        )
        if part_name:
            where_stmt = where_stmt + " AND part_name = '" + part_name + "'"
        else:
            where_stmt = where_stmt + " AND part_name is null"
        if part_no:
            where_stmt = where_stmt + " AND part_no = '" + part_no + "'"
        else:
            where_stmt = where_stmt + " AND part_no is null"
        if sub_line:
            where_stmt = where_stmt + " AND sub_line = '" + sub_line + "'"
        else:
            where_stmt = where_stmt + " AND sub_line is null"
        part_name = "'" + part_name + "'" if part_name else "null"
        part_no = "'" + part_no + "'" if part_no else "null"
        sub_line = "'" + sub_line + "'" if sub_line else "null"
        stmt = f"SELECT id FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db
            stmt = f"""UPDATE master_target_line SET target_control = {target_percent}, active = 'active', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()

            status = False

        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO master_target_line ( line_id, process, part_no, part_name, sub_line, target_type, month_year, target_control, creator, created_at, updated_at, active) VALUES ( '{line_id}','{process}',{part_no},{part_name},{sub_line},'{target_type}','{month_year}',{target_percent},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7','active' )"""
            await db.execute(text(stmt))
            await db.commit()

        return data
