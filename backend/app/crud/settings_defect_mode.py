from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from sqlalchemy.sql import text
from dotenv import load_dotenv
import requests
import json
import os
from datetime import datetime
import calendar

load_dotenv()


class Settings_Defect_Mode_CRUD:
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

    async def table_view(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]

        line_id = self.get_line_id(line_name)

        ## query db
        ## check filter
        if line_name == "":
            where_stmt = " active = 'active' "

        # elif (part_name == "") | (part_no == ""):
        #     where_stmt = "line_id = '" + str(line_id) + "' AND active = 'active' "

        else:
            where_stmt = (
                "line_id = '"
                + str(line_id)
                # + "' AND part_name = '"
                # + part_name
                + "' AND part_no = '"
                + part_no
                + "' AND active = 'active' "
            )

        stmt = f"SELECT * FROM master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY ref"
        rs = await db.execute(text(stmt))
        # print("stmt: ", stmt)
        return rs, data

    async def table_edit_view(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        line_name = data["line_name"]
        process = data["process"]
        part_no = data["part_no"]
        part_name = data["part_name"]
        defect_type = data["defect_type"]
        defect_mode = data["defect_mode"]

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND process = '"
            + process
            + "' AND part_no = '"
            + part_no
            + "' AND part_name = '"
            + part_name
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defect_mode
            + "' AND active = 'active' "
        )

        stmt = f"SELECT * FROM master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs, data

    async def table_edit_view_line_name_change(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def table_edit_save(self, db: AsyncSession, where_stmt: str | None = None):
        # Get the current date
        now = datetime.now()

        # Get the first day of the current month
        start_date = datetime(now.year, now.month, 1)

        # Get the last day of the current month
        last_day = calendar.monthrange(now.year, now.month)[1]
        end_date = datetime(now.year, now.month, last_day)

        # Format the start and end dates as strings
        start_date_string = start_date.strftime("%Y-%m-%d")
        end_date_string = end_date.strftime("%Y-%m-%d")

        data = where_stmt.dict()

        id = data["id"]
        line_name = data["line_name"]
        process = data["process"]
        part_no = data["part_no"]
        part_name = data["part_name"]
        defect_type = data["defect_type"]
        defect_mode = data["defect_mode"]
        if data["category"]:
            category = "'{" + ",".join(data["category"]) + "}'"
        else:
            category = "NULL"
        creator = data["creator"]

        line_id = self.get_line_id(line_name)

        status = True

        ## query db
        ref_id = None

        stmt = f"SELECT ref,defect_mode FROM master_defect WHERE  id = " + str(id)
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            ref_id = r[key_index["ref"]]
            old_defect_mode = r[key_index["defect_mode"]]

        stmt = (
            "UPDATE master_defect SET active = 'edit', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  id = "
            + str(id)
        )
        await db.execute(text(stmt))
        await db.commit()

        ## check new record ??
        ## query db
        where_stmt = (
            f"line_id = '{str(line_id)}' AND process = '{process}' AND part_no = '{part_no}' AND part_name = '{part_name}' AND defect_type = '{defect_type}' AND defect_mode = '{defect_mode}'"
            + (
                f" AND category = {category}"
                if category != "NULL"
                else " AND category is NULL"
            )
            + " AND active in ('delete','edit','active') "
        )

        stmt = f"SELECT id FROM master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db
            stmt = f"""UPDATE master_defect SET active = 'active', ref = {ref_id}, updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()

            status = False

        if status == True:
            ## case new record
            ## query db
            if defect_type in ["M/C Set up", "Quality Test"]:
                defect_mode = ""

            stmt = f"""INSERT INTO master_defect ( line_id,process,part_no,part_name,defect_type,defect_mode,category,creator,created_at,updated_at,active) VALUES ( '{line_id}','{process}','{part_no}','{part_name}','{defect_type}','{defect_mode}',{category},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7','active' )"""
            await db.execute(text(stmt))
            await db.commit()

            new_id = None

            where_stmt = (
                f"line_id = '{str(line_id)}' AND process = '{process}' AND part_no = '{part_no}' AND part_name = '{part_name}' AND defect_type = '{defect_type}' AND defect_mode = '{defect_mode}' "
                + (
                    f" AND category = {category}"
                    if category != "NULL"
                    else " AND category is NULL"
                )
                + " AND creator = '"
                + creator
                + "' AND active = 'active' "
            )

            stmt = f"SELECT id FROM master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
            rs = await db.execute(text(stmt))
            for r in rs:
                key_index = r._key_to_index

                new_id = r[key_index["id"]]

            stmt = f"""UPDATE master_defect SET ref = {ref_id}, updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  id = {new_id}"""
            await db.execute(text(stmt))
            await db.commit()

        ###
        stmt = f"""UPDATE pchart_defect_record SET defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE defective_items = '{old_defect_mode}'AND  (date >= '{start_date_string}' AND date <= '{end_date_string}') """
        #!   AND  (date >= '{start_date_string}' AND date <= '{end_date_string}')
        await db.execute(text(stmt))
        await db.commit()

        return data

    async def table_re_index(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt
        # print("data:", data)
        stmt = text(
            'UPDATE master_defect SET "master_defect_index" = :master_defect_index WHERE id = :id'
        )
        params = [
            {"master_defect_index": row.master_defect_index, "id": row.id}
            for row in data
        ]
        await db.execute(stmt, params)
        await db.commit()

        # await db.execute(text(stmt))
        # await db.commit()

        return data

    async def table_delete(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        line_name = data["line_name"]
        process = data["process"]
        part_no = data["part_no"]
        part_name = data["part_name"]
        defect_type = data["defect_type"]
        defect_mode = data["defect_mode"]

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND process = '"
            + process
            + "' AND part_no = '"
            + part_no
            + "' AND part_name = '"
            + part_name
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defect_mode
            + "' AND active = 'active' "
        )

        stmt = f"""UPDATE master_defect SET active = 'delete', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
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

    async def get_sub_part(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        line_name = data["line_name"]
        process = data["process"]

        line_id = self.get_line_id(line_name)

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

    async def add_row_ok(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        process = data["process"]
        defect_type = data["defect_type"]
        defect_mode = data["defect_mode"]
        category = "{" + ",".join(data["category"]) + "}"
        creator = data["creator"]

        line_id = self.get_line_id(line_name)

        status = True

        ## check new record ??
        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND process = '"
            + process
            + "' AND part_no = '"
            + part_no
            + "' AND part_name = '"
            + part_name
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defect_mode
            + "' AND category = '"
            + category
            + "' AND active in ('delete','edit','active') "
        )

        stmt = f"SELECT id FROM master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db
            stmt = f"""UPDATE master_defect SET active = 'active', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()

            status = False

        if status == True:
            ## case new record
            ## query db
            if defect_type in ["M/C Set up", "Quality Test"]:
                defect_mode = ""

            stmt = f"""INSERT INTO master_defect ( line_id,process,part_no,part_name,defect_type,defect_mode,category,creator,created_at,updated_at,active) VALUES ( '{line_id}','{process}','{part_no}','{part_name}','{defect_type}','{defect_mode}','{category}','{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7','active' )"""
            await db.execute(text(stmt))
            await db.commit()

        return data
