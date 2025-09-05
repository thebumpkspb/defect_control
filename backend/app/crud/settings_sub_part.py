from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from sqlalchemy.sql import text
from dotenv import load_dotenv
import requests
import json
import os

load_dotenv()


class Settings_SubPart_CRUD:
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
        print("get_line_id")
        print("list_line:", list_line)
        print("linename:", linename)
        index_select = list_line.index(linename)
        id_linename = list_line_id[index_select]

        return str(id_linename)

    async def table_view(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        line_name = data["line_name"]
        line_code_rx = data["line_code_rx"]
        # part_name = data["part_name"]
        # part_no = data["part_no"]
        # sub_line = data["sub_line"]

        ## query db
        where_stmt = " active = 'active' "

        line_id = self.get_line_id(line_name)

        ## check filter
        if line_name != "":
            where_stmt = where_stmt + " AND line_id = '" + str(line_id) + "' "

        # if part_name != "":
        #     where_stmt = where_stmt + " AND part_name = '" + part_name + "' "

        # if part_no != "":
        #     where_stmt = where_stmt + " AND part_no = '" + part_no + "' "

        # if sub_line != "":
        #     where_stmt = where_stmt + " AND sub_line = '" + sub_line + "' "

        stmt = f"SELECT * FROM master_sub_part WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        # print("stmt: ", stmt)
        return rs, data

    async def table_edit_view(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        print("data:", data)
        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]
        process = data["process"]
        sub_part_no = data["sub_part_no"]
        sub_part_name = data["sub_part_name"]
        unit_consumption = data["unit_consumption"]

        line_id = self.get_line_id(line_name)
        line_id_str = str(line_id) if line_id else "0"
        print("line_id:", line_id)
        print("line_id_str:", line_id_str)
        print("type(line_id_str):", type(line_id_str))
        ## query db
        where_stmt = (
            f"line_id = '"
            + line_id_str
            + "'"
            + " AND part_name = '"
            + part_name
            + "' AND part_no = '"
            + part_no
            + "' AND sub_line = '"
            + sub_line
            + "' AND process = '"
            + process
            + "' AND sub_part_no = '"
            + sub_part_no
            + "' AND sub_part_name = '"
            + sub_part_name
            + "' AND active = 'active' "
        )

        stmt = f"SELECT * FROM master_sub_part WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs, data

    async def table_edit_view_line_name_change(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def table_edit_save(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        print("data:", data)
        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]
        process = data["process"]
        sub_part_no = data["sub_part_no"]
        sub_part_name = data["sub_part_name"]
        supplier = data["supplier"]
        unit_consumption = data["unit_consumption"]
        creator = data["creator"]
        id = data["id"]

        line_id = self.get_line_id(line_name)

        status = True

        ## check new record ??
        ## query db
        stmt = (
            "UPDATE master_sub_part SET active = 'edit', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  id = "
            + str(id)
        )
        await db.execute(text(stmt))
        await db.commit()

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND process = '"
            + process
            + "' AND part_no = '"
            + part_no
            + "' AND part_name = '"
            + part_name
            + "' AND sub_line = '"
            + sub_line
            + "' AND sub_part_no = '"
            + sub_part_no
            + "' AND sub_part_name = '"
            + sub_part_name
            + "' AND unit_consumption = '"
            + str(unit_consumption)
            + "' AND supplier = '"
            + supplier
            + "' AND active in ('delete','edit','active') "
        )
        # ref = 0
        ## query db
        stmt = f"SELECT id,ref FROM master_sub_part WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db
            key_index = r._key_to_index
            # ref = r[key_index["ref"]]
            stmt = f"""UPDATE master_sub_part SET unit_consumption = {unit_consumption}, active = 'active', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()

            status = False

        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO master_sub_part ( line_id, process, part_no, part_name, sub_line, sub_part_no, sub_part_name, supplier, unit_consumption, creator, active,ref) SELECT '{line_id}','{process}','{part_no}','{part_name}','{sub_line}','{sub_part_no}','{sub_part_name}','{supplier}',{unit_consumption},'{creator}','active', ref FROM master_sub_part WHERE id={id} """
            await db.execute(text(stmt))
            await db.commit()

        return data

    async def table_delete(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]
        process = data["process"]
        sub_part_no = data["sub_part_no"]
        sub_part_name = data["sub_part_name"]
        unit_consumption = data["unit_consumption"]

        line_id = self.get_line_id(line_name)

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
            + "' AND sub_part_no = '"
            + sub_part_no
            + "' AND sub_part_name = '"
            + sub_part_name
            + "' AND unit_consumption = "
            + str(unit_consumption)
            + " AND active = 'active' "
        )

        stmt = f"""UPDATE master_sub_part SET active = 'delete', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
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

    async def add_row_ok(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_name = data["part_name"]
        part_no = data["part_no"]
        sub_line = data["sub_line"]
        process = data["process"]
        sub_part_no = data["sub_part_no"]
        sub_part_name = data["sub_part_name"]
        supplier = data["supplier"]
        unit_consumption = data["unit_consumption"]
        creator = data["creator"]

        line_id = self.get_line_id(line_name)

        status = True

        # check new record ??
        # query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND process = '"
            + process
            + "' AND part_no = '"
            + part_no
            + "' AND part_name = '"
            + part_name
            + "' AND sub_line = '"
            + sub_line
            + "' AND sub_part_no = '"
            + sub_part_no
            + "' AND sub_part_name = '"
            + sub_part_name
            + "' AND supplier = '"
            + supplier
            + "' AND active in ('delete','edit','active') "
        )

        stmt = f"SELECT id FROM master_sub_part WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db
            # stmt = f"""UPDATE master_sub_part
            # SET target_control = {target_percent},
            # active = 'active'
            # WHERE  {where_stmt if where_stmt is not None else ''} """
            # await db.execute(text(stmt))
            # await db.commit()

            status = False

        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO master_sub_part ( line_id, process, part_no, part_name, sub_line, sub_part_no, sub_part_name, supplier, creator, active) VALUES ( '{line_id}','{process}','{part_no}','{part_name}','{sub_line}','{sub_part_no}','{sub_part_name}','{supplier}','{creator}','active' )"""
            await db.execute(text(stmt))
            await db.commit()

        return data
