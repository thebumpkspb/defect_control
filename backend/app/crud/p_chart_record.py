from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from sqlalchemy.sql import text
from datetime import datetime, date
from dotenv import load_dotenv
import requests
import json
import os

from app.functions import (
    convert_month_year_to_date,
    get_first_and_last_date_of_month,
    get_initials,
    transform_approval_data,
)

load_dotenv()


class P_Chart_Record_CRUD:
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

    async def general_information(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        process = data["process"]
        sub_line = data["sub_line"]
        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "month = '"
            + month
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift = '"
            + shift
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' "
        )

        stmt = f"SELECT * FROM  pchart_report WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        select_target_control = 0.00

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND target_type = 'Monthly' AND month_year = '"
            + month
            + "' AND active = 'active' "
        )

        stmt = f"SELECT target_control FROM master_target_line WHERE  {where_stmt if where_stmt is not None else ''} "
        rs_target_control = await db.execute(text(stmt))

        for r in rs_target_control:
            key_index = r._key_to_index

            ## get data from db
            select_target_control = r[key_index["target_control"]]

        return rs, select_target_control, data

    async def p_chart_record_graph(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        process = data["process"]
        sub_line = data["sub_line"]

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "month = '"
            + month
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift = '"
            + shift
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' "
        )

        stmt = f"SELECT * FROM pchart_report_graph WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        # print("stmt:", stmt)
        rs = await db.execute(text(stmt))

        return rs, data

    async def p_chart_record_table(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND active = 'active' "
        )

        stmt = f"SELECT defect_type, defect_mode, category FROM  master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY CASE defect_type WHEN 'Repeat' THEN 0 WHEN 'Scrap' THEN 1 WHEN 'Appearance' THEN 2  WHEN 'Dimension' THEN 3  WHEN 'Performance' THEN 4  WHEN 'Other' THEN 5  WHEN 'M/C Set up' THEN 6  WHEN 'Quality Test' THEN 7 END, master_defect_index ASC;"
        rs = await db.execute(text(stmt))

        return rs, data

    async def record_data_general_information(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        data_save: str | None = None,
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data_save["shift"]
        n_bar = data_save["n_bar"]
        p_bar = data_save["p_bar"]
        k = data_save["k"]
        uclp = data_save["uclp"]
        lclp = data_save["lclp"]

        now_month = data["month"]
        datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        ## check fiscal year
        if month_number != 1:
            last_month = month_number - 1
        else:
            last_month = 12
            year = year - 1

        last_month = datetime.strptime(
            str(last_month) + "-" + str(year), "%m-%Y"
        ).strftime("%B-%Y")

        line_id = self.get_line_id(line_name)

        p_bar_last = 0.0
        where_stmt = (
            "month = '"
            + last_month
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift = '"
            + shift
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' "
        )

        ## query db
        stmt = f"SELECT p_bar FROM  pchart_report WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        row = await db.execute(text(stmt))
        for r in row:
            p_bar_last = r[0]

        status = True

        ## check new record ??
        ## query db
        where_stmt = (
            "month = '"
            + month
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift = '"
            + shift
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' "
        )

        stmt = f"SELECT id FROM pchart_report WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        for r in rs:

            status = False

            ## case old record
            ## query db
            stmt = (
                "UPDATE pchart_report SET n_bar = "
                + str(n_bar)
                + ", p_bar = "
                + str(p_bar)
                + ", k = "
                + str(k)
                + ", uclp = "
                + str(uclp)
                + ", lclp = "
                + str(lclp)
                + ", p_bar_last = "
                + str(p_bar_last)
                + ", updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE id = "
                + str(r[0])
            )
            await db.execute(text(stmt))
            await db.commit()

        if status == True:
            ## case new record
            ## query db
            part_name = None

            where_stmt = (
                "line_id = '" + str(line_id) + "' AND part_no = '" + part_no + "' "
            )

            stmt = f"SELECT part_name FROM master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id DESC LIMIT 1"
            rs = await db.execute(text(stmt))
            for r in rs:
                part_name = r[0]

            if part_name != None:

                stmt = f"""INSERT INTO pchart_report ( month, line_id, part_no, part_name, shift, process, sub_line, n_bar, p_bar, k, uclp, lclp, p_bar_last, updated_at) VALUES ('{month}', '{line_id}','{part_no}','{part_name}','{shift}','{process}','{sub_line}','{n_bar}','{p_bar}','{k}','{uclp}','{lclp}','{p_bar_last}',current_timestamp AT TIME ZONE 'Etc/GMT-7') """

                await db.execute(text(stmt))
                await db.commit()

    async def p_chart_record_table_qty_defective_items(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        data_search: str | None = None,
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]

        s_date = data_search["date_start"]
        e_date = data_search["date_end"]
        defect_type = data_search["defect_type"]
        defective_items = data_search["defective_items"]

        line_id = self.get_line_id(line_name)

        ## query db
        id_defective_items = None

        flag = 0
        if defect_type == "Repeat NG":
            defect_type = "Repeat"
            flag = 1

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defective_items
            + "' AND active = 'active' "
        )
        stmt = f"SELECT ref FROM master_defect WHERE {where_stmt if where_stmt is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            id_defective_items = r[key_index["ref"]]

        if flag == 1:
            defect_type = "Repeat NG"

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND date >= '"
            + s_date
            + "' AND date <= '"
            + e_date
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' ORDER BY date ASC"
        )

        stmt = f"SELECT date, qty_shift_all, qty_shift_a, qty_shift_b FROM  pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} "
        # print("stmt:", stmt)
        rs = await db.execute(text(stmt))

        return rs

    async def p_chart_record_table_qty_all_defective_items(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        data_search: str | None = None,
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        start_date = data_search["start_date"]
        end_date = data_search["end_date"]
        # defect_type = data_search["defect_type"]
        # defective_items = data_search["defective_items"]

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "t1.line_id = '"
            + str(line_id)
            + "' AND t1.part_no = '"
            + part_no
            + "' AND t1.process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND t1.date >= '"
            + start_date
            + "' AND t1.date <= '"
            + end_date
            # + "' AND defect_type = '"
            # + defect_type
            # + "' AND defective_items = '"
            # + defective_items
            + "'AND t2.active='active' ORDER BY t1.date ASC"
        )

        # print("where_stmt: ", where_stmt)
        # stmt = f"SELECT qty_shift_all, qty_shift_a, qty_shift_b FROM  pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} "
        # stmt = f"""SELECT date,qty_shift_all, qty_shift_a, qty_shift_b,defect_type,defective_items
        # FROM  pchart_defect_record
        #             WHERE {where_stmt if where_stmt is not None else ''} """

        # stmt = f"""
        #  SELECT
        #     date, qty_shift_all, qty_shift_a, qty_shift_b,t2.defect_type,t2.defect_mode as defective_items
        #     FROM  pchart_defect_record  t1
        #     left join master_defect t2 using(part_no,process,line_id,defect_type)
        #      WHERE {where_stmt if where_stmt is not None else ''}
        # """

        stmt = f"""
        select date, qty_shift_all, qty_shift_a, qty_shift_b,t1.defect_type,t2.defect_mode as defective_items        
            FROM  pchart_defect_record  t1
            left join master_defect t2 --using(part_no,process,line_id,defect_type)
			on t1.part_no=t2.part_no and
                t1.process=t2.process 
                and t1.line_id=t2.line_id 
                -- and t1.defect_type=t2.defect_type 
                and t1.id_defective_items=t2.ref 
                -- and t1.defective_items=t2.defect_mode
             WHERE {where_stmt if where_stmt is not None else ''}
        """
        # print("stmt:", stmt)
        rs = await db.execute(text(stmt))

        return rs

    async def p_chart_record_table_p_bar_last_month(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        process = data["process"]
        sub_line = data["sub_line"]
        now_month = data["month"]
        datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        ## check fiscal year
        if month_number != 1:
            last_month = month_number - 1
        else:
            last_month = 12
            year = year - 1

        month = datetime.strptime(str(last_month) + "-" + str(year), "%m-%Y").strftime(
            "%B-%Y"
        )

        p_bar = 0
        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "month = '"
            + month
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND shift = '"
            + shift
            + "' AND sub_line = '"
            + sub_line
            + "' "
        )
        stmt = f"SELECT p_bar FROM  pchart_report WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            ## get data from db
            p_bar = r[key_index["p_bar"]]

        return p_bar

    async def p_chart_record_table_p_bar_last_month_All(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        process = data["process"]
        sub_line = data["sub_line"]

        now_month = data["month"]
        datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        ## check fiscal year
        if month_number != 1:
            last_month = month_number - 1
        else:
            last_month = 12
            year = year - 1

        month = datetime.strptime(str(last_month) + "-" + str(year), "%m-%Y").strftime(
            "%B-%Y"
        )

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "month = '"
            + month
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND shift = '"
            + shift
            + "' "
        )
        stmt = f"SELECT p_bar FROM  pchart_report WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        # print("stmt:", stmt)
        rs = await db.execute(text(stmt))

        return rs

    async def save_pchart_report_graph(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        graph_data: str | None = None,
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        process = data["process"]
        sub_line = data["sub_line"]

        str_graph_json = str(graph_data).replace("'", "''")

        status = True

        line_id = self.get_line_id(line_name)

        ## check new record ??
        ## query db
        where_stmt = (
            "month = '"
            + month
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift = '"
            + shift
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' "
        )

        stmt = f"SELECT id FROM pchart_report_graph WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:

            status = False

            ## case old record
            ## query db
            stmt = f"""UPDATE pchart_report_graph SET pchart_graph = '{str_graph_json}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()

        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO pchart_report_graph ( month, line_id, part_no, shift, process, sub_line, pchart_graph, updated_at) VALUES ('{month}', '{line_id}','{part_no}','{shift}','{process}','{sub_line}','{str_graph_json}', current_timestamp AT TIME ZONE 'Etc/GMT-7' )"""

            await db.execute(text(stmt))
            await db.commit()

        return rs

    async def save_pchart_report_table(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        graph_data: str | None = None,
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        process = data["process"]
        sub_line = data["sub_line"]

        str_table_json = str(graph_data).replace("'", "''")

        status = True

        line_id = self.get_line_id(line_name)

        ## check new record ??
        ## query db
        where_stmt = (
            "month = '"
            + month
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift = '"
            + shift
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' "
        )

        stmt = f"SELECT id FROM pchart_report_table WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:

            status = False
            ## case old record
            ## query db
            stmt = f"""UPDATE pchart_report_table SET pchart_table = '{str_table_json}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            await db.execute(text(stmt))
            await db.commit()

        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO pchart_report_table ( month, line_id, part_no, shift, process, sub_line, pchart_table, updated_at) VALUES ('{month}', '{line_id}','{part_no}','{shift}','{process}','{sub_line}','{str_table_json}', current_timestamp AT TIME ZONE 'Etc/GMT-7' )"""

            await db.execute(text(stmt))
            await db.commit()

        pchart_table = ""

        ## query db
        stmt = f"SELECT * FROM pchart_report_table WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs

    async def add_new_record_view(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        defect_mode: str | None = None,
    ):
        data = where_stmt.dict()

        date = data["date"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        defect_type = data["defect_type"]
        defective_items = defect_mode

        line_id = self.get_line_id(line_name)

        ## query db
        id_defective_items = None

        flag = 0
        if defect_type == "Repeat NG":
            defect_type = "Repeat"
            flag = 1

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defective_items
            + "' AND active = 'active' "
        )
        stmt = f"SELECT ref FROM master_defect WHERE {where_stmt if where_stmt is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            id_defective_items = r[key_index["ref"]]

        if flag == 1:
            defect_type = "Repeat NG"

        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' "
        )

        stmt = f"SELECT * FROM pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        sum_A = 0

        where_stmt_A = where_stmt + " AND shift ='A' AND active = 'active' "
        stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_A if where_stmt_A is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            if r[key_index["sum"]] == None:
                sum_A = 0
            else:
                sum_A = r[key_index["sum"]]

        sum_B = 0

        where_stmt_B = where_stmt + " AND shift ='B' AND active = 'active' "
        stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_B if where_stmt_B is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            if r[key_index["sum"]] == None:
                sum_B = 0
            else:
                sum_B = r[key_index["sum"]]

        return rs, data, sum_A, sum_B

    async def add_new_record_view_defect_mode(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        defect_type = data["defect_type"]

        if defect_type == "Repeat NG":
            defect_type = "Repeat"

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND defect_type = '"
            + defect_type
            + "' AND active = 'active' "
        )

        stmt = f"SELECT * FROM master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs

    async def add_new_record_view_defect_mode_by_part(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        defect_type = data["defect_type"]

        if defect_type == "Repeat NG":
            defect_type = "Repeat"

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            # + "' AND part_no = '"
            # + part_no
            # + "' AND process = '"
            # + process
            # + "' AND defect_type = '"
            # + defect_type
            + "' AND active = 'active' "
        )

        stmt = f"SELECT * FROM master_defect WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs

    async def change_new_record_view(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        date = data["date"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        defect_type = data["defect_type"]
        defective_items = data["defect_mode"]

        line_id = self.get_line_id(line_name)

        ## query db
        id_defective_items = None

        flag = 0
        if defect_type == "Repeat NG":
            defect_type = "Repeat"
            flag = 1

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defective_items
            + "' AND active = 'active' "
        )
        stmt = f"SELECT ref FROM master_defect WHERE {where_stmt if where_stmt is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            id_defective_items = r[key_index["ref"]]

        if flag == 1:
            defect_type = "Repeat NG"

        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' "
        )

        stmt = f"SELECT * FROM pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        sum_A = 0

        where_stmt_A = where_stmt + " AND shift ='A' AND active = 'active' "
        stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_A if where_stmt_A is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            if r[key_index["sum"]] == None:
                sum_A = 0
            else:
                sum_A = r[key_index["sum"]]

        sum_B = 0

        where_stmt_B = where_stmt + " AND shift ='B' AND active = 'active' "
        stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_B if where_stmt_B is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            if r[key_index["sum"]] == None:
                sum_B = 0
            else:
                sum_B = r[key_index["sum"]]

        return rs, data, sum_A, sum_B

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

    async def add_new_record_save(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()
        # print("data:", data)
        date = data["date"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        defect_type = data["defect_type"]
        defective_items = data["defective_items"]
        pic = f"""'{data["pic"]}'""" if data["pic"] is not None else "NULL"
        creator = data["creator"]
        comment = data["comment"]

        defect_qty_a = 0
        defect_qty_b = 0
        shift = ""

        if data["defect_qty_A"] != None:
            defect_qty_a = int(data["defect_qty_A"])
            shift = "A"

        if data["defect_qty_B"] != None:
            defect_qty_b = int(data["defect_qty_B"])
            shift = "B"

        ########

        line_id = self.get_line_id(line_name)

        ## query db
        id_defective_items = None

        flag = 0
        if defect_type == "Repeat NG":
            defect_type = "Repeat"
            flag = 1

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defective_items
            + "' AND active = 'active' "
        )
        stmt = f"SELECT ref FROM master_defect WHERE {where_stmt if where_stmt is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            id_defective_items = r[key_index["ref"]]

        if flag == 1:
            defect_type = "Repeat NG"

        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' "
        )

        sum_A = 0

        where_stmt_A = where_stmt + " AND shift ='A' AND active = 'active' "
        stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_A if where_stmt_A is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            if r[key_index["sum"]] == None:
                sum_A = 0
            else:
                sum_A = r[key_index["sum"]]

        sum_B = 0

        where_stmt_B = where_stmt + " AND shift ='B' AND active = 'active' "
        stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_B if where_stmt_B is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            if r[key_index["sum"]] == None:
                sum_B = 0
            else:
                sum_B = r[key_index["sum"]]

        defect_qty_a_new = str(int(defect_qty_a) + int(sum_A))
        defect_qty_b_new = str(int(defect_qty_b) + int(sum_B))
        ##########

        defect_qty_all_new = str(int(defect_qty_a_new) + int(defect_qty_b_new))

        status = True

        line_id = self.get_line_id(line_name)

        ## check new record ??
        ## query db
        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' "
        )

        stmt = f"SELECT id, qty_shift_a, qty_shift_b FROM pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:

            status = False

            ## case old record
            ## query db
            qty_shift_a = str(defect_qty_a)
            qty_shift_b = str(defect_qty_b)

            qty_shift_all_sum = defect_qty_all_new
            qty_shift_a_sum = defect_qty_a_new
            qty_shift_b_sum = defect_qty_b_new

            if shift == "A":

                stmt = f"""INSERT INTO pchart_defect_record_log ( date, line_id, part_no, process, sub_line, defect_type, defective_items, id_defective_items, shift, qty, pic, creator, updated_at, active) VALUES ('{date}', '{line_id}','{part_no}','{process}','{sub_line}','{defect_type}','{defective_items}','{id_defective_items}','A','{qty_shift_a}',{pic},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7', 'active' )"""

                await db.execute(text(stmt))
                await db.commit()

                where_stmt_log = (
                    " date = '"
                    + str(date)
                    + "' AND line_id = '"
                    + str(line_id)
                    + "' AND part_no = '"
                    + part_no
                    + "' AND process = '"
                    + process
                    + "' AND sub_line = '"
                    + sub_line
                    + "' AND defect_type = '"
                    + defect_type
                    + "' AND shift = 'A' AND qty = '"
                    + str(qty_shift_a)
                    + "' AND creator = '"
                    + creator
                    + "' AND active = 'active' AND id = (SELECT MAX(id) FROM pchart_defect_record_log)"
                )

                stmt = f"""UPDATE pchart_defect_record_log SET ref = id WHERE  {where_stmt_log if where_stmt_log is not None else ''} """
                await db.execute(text(stmt))
                await db.commit()

                stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all_sum}, qty_shift_a = {qty_shift_a_sum}, qty_shift_b = {qty_shift_b_sum}, comment_shift_a = '{comment}', defective_items = '{defective_items}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

            else:

                stmt = f"""INSERT INTO pchart_defect_record_log ( date, line_id, part_no, process, sub_line, defect_type, defective_items, id_defective_items, shift, qty, pic, creator, updated_at, active) 
                VALUES ('{date}', '{line_id}','{part_no}','{process}','{sub_line}','{defect_type}','{defective_items}','{id_defective_items}','B','{qty_shift_b}',{pic},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7', 'active' )"""

                await db.execute(text(stmt))
                await db.commit()

                where_stmt_log = (
                    " date = '"
                    + str(date)
                    + "' AND line_id = '"
                    + str(line_id)
                    + "' AND part_no = '"
                    + part_no
                    + "' AND process = '"
                    + process
                    + "' AND sub_line = '"
                    + sub_line
                    + "' AND defect_type = '"
                    + defect_type
                    + "' AND shift = 'B' AND qty = '"
                    + str(qty_shift_b)
                    + "' AND creator = '"
                    + creator
                    + "' AND active = 'active' AND id = (SELECT MAX(id) FROM pchart_defect_record_log)"
                )

                stmt = f"""UPDATE pchart_defect_record_log SET ref = id WHERE  {where_stmt_log if where_stmt_log is not None else ''} """
                await db.execute(text(stmt))
                await db.commit()

                stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all_sum}, qty_shift_a = {qty_shift_a_sum}, qty_shift_b = {qty_shift_b_sum}, comment_shift_b = '{comment}', defective_items = '{defective_items}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

            await db.execute(text(stmt))
            await db.commit()

            break

        if status == True:
            ## case new record
            ## query db
            qty_shift_a = str(defect_qty_a)
            qty_shift_b = str(defect_qty_b)

            qty_shift_all_sum = defect_qty_all_new
            qty_shift_a_sum = defect_qty_a_new
            qty_shift_b_sum = defect_qty_b_new

            if shift == "A":
                stmt = f"""INSERT INTO pchart_defect_record_log ( date, line_id, part_no, process, sub_line, defect_type, defective_items, id_defective_items, shift, qty, pic, creator, updated_at, active) 
                VALUES ('{date}', '{line_id}','{part_no}','{process}','{sub_line}','{defect_type}','{defective_items}','{id_defective_items}','A','{qty_shift_a}',{pic},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7', 'active' )"""

                await db.execute(text(stmt))
                await db.commit()

                where_stmt_log = (
                    " date = '"
                    + str(date)
                    + "' AND line_id = '"
                    + str(line_id)
                    + "' AND part_no = '"
                    + part_no
                    + "' AND process = '"
                    + process
                    + "' AND sub_line = '"
                    + sub_line
                    + "' AND defect_type = '"
                    + defect_type
                    + "' AND shift = 'A' AND qty = '"
                    + str(qty_shift_a)
                    + "' AND creator = '"
                    + creator
                    + "' AND active = 'active' AND id = (SELECT MAX(id) FROM pchart_defect_record_log)"
                )

                stmt = f"""UPDATE pchart_defect_record_log SET ref = id WHERE  {where_stmt_log if where_stmt_log is not None else ''} """
                await db.execute(text(stmt))
                await db.commit()

                stmt = f"""INSERT INTO pchart_defect_record ( date, line_id, part_no, process, sub_line, defect_type, defective_items, id_defective_items, qty_shift_all, qty_shift_a, qty_shift_b, comment_shift_a, creator, created_at, updated_at) 
                VALUES ('{date}', '{line_id}','{part_no}','{process}','{sub_line}','{defect_type}','{defective_items}','{id_defective_items}','{qty_shift_all_sum}','{qty_shift_a_sum}','{qty_shift_b_sum}','{comment}','{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7' )"""

            else:
                stmt = f"""INSERT INTO pchart_defect_record_log ( date, line_id, part_no, process, sub_line, defect_type, defective_items, id_defective_items, shift, qty, pic, creator, updated_at, active) 
                VALUES ('{date}', '{line_id}','{part_no}','{process}','{sub_line}','{defect_type}','{defective_items}','{id_defective_items}','B','{qty_shift_b}',{pic},'{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7', 'active' )"""

                await db.execute(text(stmt))
                await db.commit()

                where_stmt_log = (
                    " date = '"
                    + str(date)
                    + "' AND line_id = '"
                    + str(line_id)
                    + "' AND part_no = '"
                    + part_no
                    + "' AND process = '"
                    + process
                    + "' AND sub_line = '"
                    + sub_line
                    + "' AND defect_type = '"
                    + defect_type
                    + "' AND shift = 'B' AND qty = '"
                    + str(qty_shift_b)
                    + "' AND creator = '"
                    + creator
                    + "' AND active = 'active' AND id = (SELECT MAX(id) FROM pchart_defect_record_log)"
                )
                stmt = f"""UPDATE pchart_defect_record_log SET ref = id WHERE  {where_stmt_log if where_stmt_log is not None else ''} """
                await db.execute(text(stmt))
                await db.commit()

                stmt = f"""INSERT INTO pchart_defect_record ( date, line_id, part_no, process, sub_line, defect_type, defective_items, id_defective_items, qty_shift_all, qty_shift_a, qty_shift_b, comment_shift_b, creator, created_at, updated_at) 
                VALUES ('{date}', '{line_id}','{part_no}','{process}','{sub_line}','{defect_type}','{defective_items}','{id_defective_items}','{qty_shift_all_sum}','{qty_shift_a_sum}','{qty_shift_b_sum}','{comment}','{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7' )"""

            await db.execute(text(stmt))
            await db.commit()

        return data, qty_shift_a_sum, qty_shift_b_sum

    async def abnormal_occurrence_view(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        process = data["process"]
        sub_line = data["sub_line"]

        line_id = self.get_line_id(line_name)

        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month = str(datetime_object)[:7]
        if shift == "All":
            shift = "'A','B'"
        else:
            shift = f"'{shift}'"

        ## query db
        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift in ("
            + shift
            + ") AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND to_char(date, 'YYYY-MM') = '"
            + month
            + "' AND status = 'action' "
        )

        stmt = f"SELECT * FROM abnormal_occurrence WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        # print("stmt:", stmt)
        rs = await db.execute(text(stmt))

        return rs, data

    async def abnormal_occurrence_edit_view(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        id = data["id"]

        ## query db
        where_stmt = "id = " + str(id)

        stmt = f"SELECT * FROM abnormal_occurrence WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs

    async def abnormal_occurrence_edit_save(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        date = data["date"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        process = data["process"]
        sub_line = data["sub_line"]
        defect_item = "{" + ",".join(str(x) for x in data["defect_item"]) + "}"
        category = "{" + ",".join(data["category"]) + "}"
        trouble = data["trouble"]
        action = data["action"]
        in_change = data["in_change"]
        manager = data["manager"]
        detect_by = data["detect_by"]
        defect_detail = data["defect_detail"]
        rank = data["rank"]
        root_cause_process = data["root_cause_process"]
        process_supplier_name = data["process_name_supplier_name"]
        cause = data["cause"]
        new_re_occur = data["new_re_occur"]
        creator = data["creator"]

        id = data["id"]

        status = True

        ## query db
        stmt = f"""UPDATE abnormal_occurrence SET status = 'edit', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE id = {id} """
        await db.execute(text(stmt))
        await db.commit()

        line_id = self.get_line_id(line_name)

        ## check new record ??
        ## query db
        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift = '"
            + shift
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND defect_item = '"
            + defect_item
            + "' AND defect_category = '"
            + category
            + "' AND trouble = '"
            + trouble
            + "' AND action = '"
            + action
            + "' AND in_change = '"
            + in_change
            + "' AND manager = '"
            + manager
            + "' AND detect_by = '"
            + detect_by
            + "' AND defect_detail = '"
            + defect_detail
            + "' AND rank = '"
            + rank
            + "' AND root_cause_process = '"
            + root_cause_process
            + "' AND process_supplier_name = '"
            + process_supplier_name
            + "' AND cause = '"
            + cause
            + "' AND new_re_occur = '"
            + new_re_occur
            + "' "
        )

        stmt = f"SELECT status FROM abnormal_occurrence WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:

            status = False

            ## case old record
            ## query db
            if r[0] != "action":
                stmt = f"""UPDATE abnormal_occurrence SET status = 'action', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
                await db.execute(text(stmt))
                await db.commit()

        if status == True:
            ## case new record
            ## query db
            stmt = f"""UPDATE abnormal_occurrence SET date = '{date}', line_id = '{line_id}', part_no = '{part_no}', shift = '{shift}', process = '{process}', sub_line = '{sub_line}', defect_item = '{defect_item}', defect_category = '{category}', trouble = '{trouble}', action = '{action}', in_change = '{in_change}', manager = '{manager}', detect_by = '{detect_by}', defect_detail = '{defect_detail}', rank = '{rank}', root_cause_process = '{root_cause_process}', process_supplier_name = '{process_supplier_name}', cause = '{cause}', new_re_occur = '{new_re_occur}', status = 'action', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE id = {id} """
            await db.execute(text(stmt))
            await db.commit()

        return data

    async def abnormal_occurrence_delete(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        id = data["id"]

        ## query db
        where_stmt = "id = " + str(id)

        stmt = f"""UPDATE abnormal_occurrence SET status = 'delete', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
        await db.execute(text(stmt))
        await db.commit()

        ## query db
        stmt = f"SELECT * FROM abnormal_occurrence WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs, data

    async def abnormal_occurrence_add_row_view(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def abnormal_occurrence_add_row_ok(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        date = data["date"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        shift = data["shift"]
        defect_item = "{" + ",".join(str(x) for x in data["defect_item"]) + "}"
        category = "{" + ",".join(data["category"]) + "}"
        process = data["process"]
        sub_line = data["sub_line"]
        trouble = data["trouble"]
        action = data["action"]
        in_change = data["in_change"]
        manager = data["manager"]
        detect_by = data["detect_by"]
        defect_detail = data["defect_detail"]
        rank = data["rank"]
        root_cause_process = data["root_cause_process"]
        process_supplier_name = data["process_name_supplier_name"]
        cause = data["cause"]
        new_re_occur = data["new_re_occur"]
        creator = data["creator"]

        status = True

        line_id = self.get_line_id(line_name)

        ## check new record ??
        ## query db
        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND shift = '"
            + shift
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND trouble = '"
            + trouble
            + "' AND action = '"
            + action
            + "' AND in_change = '"
            + in_change
            + "' AND manager = '"
            + manager
            + "' AND detect_by = '"
            + detect_by
            + "' AND defect_detail = '"
            + defect_detail
            + "' AND rank = '"
            + rank
            + "' AND root_cause_process = '"
            + root_cause_process
            + "' AND process_supplier_name = '"
            + process_supplier_name
            + "' AND cause = '"
            + cause
            + "' AND new_re_occur = '"
            + new_re_occur
            + "' "
        )

        stmt = f"SELECT status FROM abnormal_occurrence WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:

            status = False

            ## case old record
            ## query db
            if r[0] != "action":
                stmt = f"""UPDATE abnormal_occurrence SET status = 'action', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
                await db.execute(text(stmt))
                await db.commit()

        if status == True:
            ## case new record
            ## query db
            stmt = f"""INSERT INTO abnormal_occurrence ( date, line_id, part_no, shift, defect_item, defect_category, process, sub_line, trouble, action, in_change, manager, detect_by, defect_detail, rank,root_cause_process, process_supplier_name, cause, new_re_occur, creator, created_at, updated_at, status) VALUES ('{date}', '{line_id}','{part_no}','{shift}','{defect_item}','{category}','{process}','{sub_line}','{trouble}','{action}','{in_change}','{manager}','{detect_by}','{defect_detail}','{rank}','{root_cause_process}','{process_supplier_name}','{cause}','{new_re_occur}','{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7',current_timestamp AT TIME ZONE 'Etc/GMT-7', 'action') """
            # print("stmt:", stmt)
            await db.execute(text(stmt))
            await db.commit()

        return data

    async def history_records_view(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        month = data["month"]
        line_name = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]
        if shift == "All":
            shift = "'A','B'"
        else:
            shift = f"'{shift}'"
        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        # check fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_start = datetime.strptime(month + "-01", "%B-%Y-%d")
        d_end = datetime.strptime(month + "-" + str(day_in_month), "%B-%Y-%d")

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "pchart_defect_record_log.date >= '"
            + str(d_start)
            + "' AND pchart_defect_record_log.date <= '"
            + str(d_end)
            + "' AND pchart_defect_record_log.line_id = '"
            + str(line_id)
            + "' AND pchart_defect_record_log.part_no = '"
            + part_no
            + "' AND pchart_defect_record_log.process = '"
            + process
            + "' AND pchart_defect_record_log.sub_line = '"
            + sub_line
            + "' AND pchart_defect_record_log.shift in ("
            + shift
            + ") AND pchart_defect_record_log.active = 'active' "
        )

        stmt = f"SELECT  pchart_defect_record_log.id, pchart_defect_record_log.date, pchart_defect_record_log.line_id, pchart_defect_record_log.part_no, pchart_defect_record_log.process, pchart_defect_record_log.sub_line, pchart_defect_record_log.defect_type, pchart_defect_record_log.defective_items, pchart_defect_record_log.shift, pchart_defect_record_log.qty, pchart_defect_record_log.pic, pchart_defect_record_log.creator, pchart_defect_record_log.ref, pchart_defect_record_log.id_defective_items, master_defect.defect_mode, master_defect.category FROM pchart_defect_record_log INNER JOIN master_defect ON pchart_defect_record_log.id_defective_items = master_defect.id WHERE {where_stmt if where_stmt is not None else ''} ORDER BY pchart_defect_record_log.date, ref"
        # print("stmt:", stmt)
        rs = await db.execute(text(stmt))

        return rs, data

    async def history_records_edit_view(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        date = data["date"]
        line = data["line"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]
        defect_type = data["defect_type"]
        defect_mode = data["defect_mode"]

        line_id = self.get_line_id(line)

        ## query db
        id_defective_items = None

        flag = 0
        if defect_type == "Repeat NG":
            defect_type = "Repeat"
            flag = 1

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defect_mode
            + "'"
            # + "' AND active = 'active' "
        )
        stmt = f"SELECT ref FROM master_defect WHERE {where_stmt if where_stmt is not None else ''}"
        # print("stmt:", stmt)
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            id_defective_items = r[key_index["ref"]]

        if flag == 1:
            defect_type = "Repeat NG"

        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' AND shift = '"
            + shift
            + "' "
        )

        stmt = f"SELECT qty, id FROM pchart_defect_record_log WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))

        return rs, data

    async def history_records_get_defect_mode(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        list_defect_mode = []

        return list_defect_mode

    async def history_records_edit_view_change(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def history_records_edit_save(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        id = data["id"]
        date = data["date"]
        line = data["line"]
        part_no = data["part_no"]
        pic = data["pic"]
        update_pic = f"'{pic}'" if pic != None else "NULL"
        where_pic = f"' AND pic = '{pic}'" if pic != None else "' AND pic is NULL "
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]
        defect_type = data["defect_type"]
        defect_mode = data["defect_mode"]
        qty = data["qty"]
        creator = data["creator"]

        status = True

        ## query db
        stmt = (
            "UPDATE pchart_defect_record_log SET active = 'edit', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  id = "
            + str(id)
        )
        await db.execute(text(stmt))
        await db.commit()

        stmt = f"SELECT ref FROM pchart_defect_record_log WHERE id = " + str(id)
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            ref_id = r[key_index["ref"]]

        line_id = self.get_line_id(line)

        ## check new record ??
        ## query db
        id_defective_items = None

        flag = 0
        if defect_type == "Repeat NG":
            defect_type = "Repeat"
            flag = 1

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defect_mode
            + "'"
            # + "' AND active = 'active' "
        )
        stmt = f"SELECT ref FROM master_defect WHERE {where_stmt if where_stmt is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            id_defective_items = r[key_index["ref"]]

        if flag == 1:
            defect_type = "Repeat NG"

        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            # + "' AND pic = '"
            # + pic
            + where_pic
            + " AND sub_line = '"
            + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' AND shift = '"
            + shift
            + "' AND qty = "
            + str(qty)
            + " AND active in ('delete','edit') "
        )

        stmt = f"SELECT id FROM pchart_defect_record_log WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id Limit 1"
        # print("stmt1:", stmt)
        rs = await db.execute(text(stmt))
        for r in rs:
            ## case old record
            ## query db

            where_stmt = (
                "date = '"
                + date
                + "' AND line_id = '"
                + str(line_id)
                + "' AND part_no = '"
                + part_no
                + "' AND process = '"
                + process
                # + "' AND pic = '"
                # + pic
                # + where_pic
                + "' AND sub_line = '"
                + sub_line
                + "' AND defect_type = '"
                + defect_type
                + "' AND id_defective_items = '"
                + str(id_defective_items)
                + "' AND shift = '"
                + shift
                + "' AND qty = "
                + str(qty)
                + " AND active in ('delete','edit') AND id = (SELECT MAX(id) FROM pchart_defect_record_log WHERE "
                + "date = '"
                + date
                + "' AND line_id = '"
                + str(line_id)
                + "' AND part_no = '"
                + part_no
                + "' AND process = '"
                + process
                + "' AND sub_line = '"
                + sub_line
                + "' AND defect_type = '"
                + defect_type
                + "' AND id_defective_items = '"
                + str(id_defective_items)
                + "' AND shift = '"
                + shift
                + "' AND qty = "
                + str(qty)
                + " AND active in ('delete','edit') )"
            )

            stmt = f"""UPDATE pchart_defect_record_log SET active = 'active', creator = '{creator}', ref = {ref_id}, defective_items = '{defect_mode}', pic = {update_pic}, updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
            # print("stmt2:", stmt)
            await db.execute(text(stmt))
            await db.commit()

            ################

            where_stmt = (
                "date = '"
                + date
                + "' AND line_id = '"
                + str(line_id)
                + "' AND part_no = '"
                + part_no
                + "' AND process = '"
                + process
                + "' AND sub_line = '"
                + sub_line
                + "' AND defect_type = '"
                + defect_type
                + "' AND id_defective_items = '"
                + str(id_defective_items)
                + "' "
            )

            sum_A = 0

            where_stmt_A = where_stmt + " AND shift ='A' AND active = 'active' "
            stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_A if where_stmt_A is not None else ''}"
            res = await db.execute(text(stmt))
            for r in res:
                key_index = r._key_to_index

                if r[key_index["sum"]] == None:
                    sum_A = 0
                else:
                    sum_A = r[key_index["sum"]]

            sum_B = 0

            where_stmt_B = where_stmt + " AND shift ='B' AND active = 'active' "
            stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_B if where_stmt_B is not None else ''}"
            res = await db.execute(text(stmt))
            for r in res:
                key_index = r._key_to_index

                if r[key_index["sum"]] == None:
                    sum_B = 0
                else:
                    sum_B = r[key_index["sum"]]

            if shift == "A":
                qty_shift_a = int(sum_A)
                qty_shift_b = int(sum_B)
                qty_shift_all = qty_shift_a + qty_shift_b

                stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all}, qty_shift_a = {qty_shift_a}, qty_shift_b = {qty_shift_b}, defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

            else:
                qty_shift_a = int(sum_A)
                qty_shift_b = int(sum_B)
                qty_shift_all = qty_shift_a + qty_shift_b

                stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all}, qty_shift_a = {qty_shift_a}, qty_shift_b = {qty_shift_b}, defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

            await db.execute(text(stmt))
            await db.commit()

            status = False

            break

        if status == True:
            ## case new record
            ## query db

            if shift == "A":
                stmt = f"""INSERT INTO pchart_defect_record_log ( date, line_id, part_no, process, pic, sub_line, defect_type, defective_items, id_defective_items, shift, qty, creator, updated_at, active) VALUES ('{date}', '{line_id}','{part_no}','{process}',{update_pic},'{sub_line}','{defect_type}','{defect_mode}','{id_defective_items}','A','{qty}','{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7', 'active')"""

                await db.execute(text(stmt))
                await db.commit()

                where_stmt_log = (
                    " date = '"
                    + str(date)
                    + "' AND line_id = '"
                    + str(line_id)
                    + "' AND part_no = '"
                    + part_no
                    + "' AND process = '"
                    + process
                    + "' AND sub_line = '"
                    + sub_line
                    + "' AND defect_type = '"
                    + defect_type
                    + "' AND shift = 'A' AND qty = '"
                    + str(qty)
                    + "' AND creator = '"
                    + creator
                    + "' AND active = 'active' "
                )

                stmt = f"""UPDATE pchart_defect_record_log SET ref = {ref_id}, defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt_log if where_stmt_log is not None else ''} """

                await db.execute(text(stmt))
                await db.commit()

                #############
                where_stmt = (
                    "date = '"
                    + date
                    + "' AND line_id = '"
                    + str(line_id)
                    + "' AND part_no = '"
                    + part_no
                    + "' AND process = '"
                    + process
                    + "' AND sub_line = '"
                    + sub_line
                    + "' AND defect_type = '"
                    + defect_type
                    + "' AND id_defective_items = '"
                    + str(id_defective_items)
                    + "' "
                )

                sum_A = 0

                where_stmt_A = where_stmt + " AND shift ='A' AND active = 'active' "
                stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_A if where_stmt_A is not None else ''}"
                res = await db.execute(text(stmt))
                for r in res:
                    key_index = r._key_to_index

                    if r[key_index["sum"]] == None:
                        sum_A = 0
                    else:
                        sum_A = r[key_index["sum"]]

                sum_B = 0

                where_stmt_B = where_stmt + " AND shift ='B' AND active = 'active' "
                stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_B if where_stmt_B is not None else ''}"
                res = await db.execute(text(stmt))
                for r in res:
                    key_index = r._key_to_index

                    if r[key_index["sum"]] == None:
                        sum_B = 0
                    else:
                        sum_B = r[key_index["sum"]]

                if shift == "A":
                    qty_shift_a = int(sum_A)
                    qty_shift_b = int(sum_B)
                    qty_shift_all = qty_shift_a + qty_shift_b

                    stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all}, qty_shift_a = {qty_shift_a}, qty_shift_b = {qty_shift_b}, defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

                else:
                    qty_shift_a = int(sum_A)
                    qty_shift_b = int(sum_B)
                    qty_shift_all = qty_shift_a + qty_shift_b

                    stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all}, qty_shift_a = {qty_shift_a}, qty_shift_b = {qty_shift_b}, defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

                await db.execute(text(stmt))
                await db.commit()

            else:
                stmt = f"""INSERT INTO pchart_defect_record_log ( date, line_id, part_no, process, pic, sub_line, defect_type, defective_items, id_defective_items, shift, qty, creator, updated_at, active) VALUES ('{date}', '{line_id}','{part_no}','{process}',{update_pic},'{sub_line}','{defect_type}','{defect_mode}','{id_defective_items}','B','{qty}','{creator}',current_timestamp AT TIME ZONE 'Etc/GMT-7', 'active' )"""
                await db.execute(text(stmt))
                await db.commit()

                where_stmt_log = (
                    " date = '"
                    + str(date)
                    + "' AND line_id = '"
                    + str(line_id)
                    + "' AND part_no = '"
                    + part_no
                    + "' AND process = '"
                    + process
                    + "' AND sub_line = '"
                    + sub_line
                    + "' AND defect_type = '"
                    + defect_type
                    + "' AND shift = 'B' AND qty = '"
                    + str(qty)
                    + "' AND creator = '"
                    + creator
                    + "' AND active = 'active' "
                )

                stmt = f"""UPDATE pchart_defect_record_log SET ref = {ref_id}, defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt_log if where_stmt_log is not None else ''} """
                await db.execute(text(stmt))
                await db.commit()

                #############

                where_stmt = (
                    "date = '"
                    + date
                    + "' AND line_id = '"
                    + str(line_id)
                    + "' AND part_no = '"
                    + part_no
                    + "' AND process = '"
                    + process
                    + "' AND sub_line = '"
                    + sub_line
                    + "' AND defect_type = '"
                    + defect_type
                    + "' AND id_defective_items = '"
                    + str(id_defective_items)
                    + "' "
                )

                sum_A = 0

                where_stmt_A = where_stmt + " AND shift ='A' AND active = 'active' "
                stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_A if where_stmt_A is not None else ''}"
                res = await db.execute(text(stmt))
                for r in res:
                    key_index = r._key_to_index

                    if r[key_index["sum"]] == None:
                        sum_A = 0
                    else:
                        sum_A = r[key_index["sum"]]

                sum_B = 0

                where_stmt_B = where_stmt + " AND shift ='B' AND active = 'active' "
                stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_B if where_stmt_B is not None else ''}"
                res = await db.execute(text(stmt))
                for r in res:
                    key_index = r._key_to_index

                    if r[key_index["sum"]] == None:
                        sum_B = 0
                    else:
                        sum_B = r[key_index["sum"]]

                if shift == "A":
                    qty_shift_a = int(sum_A)
                    qty_shift_b = int(sum_B)
                    qty_shift_all = qty_shift_a + qty_shift_b

                    stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all}, qty_shift_a = {qty_shift_a}, qty_shift_b = {qty_shift_b}, defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

                else:
                    qty_shift_a = int(sum_A)
                    qty_shift_b = int(sum_B)
                    qty_shift_all = qty_shift_a + qty_shift_b

                    stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all}, qty_shift_a = {qty_shift_a}, qty_shift_b = {qty_shift_b}, defective_items = '{defect_mode}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

                await db.execute(text(stmt))
                await db.commit()

        return data

    async def history_records_view_edit_save(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        month = data["date"][0:7]
        line_name = data["line"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]

        datetime_object = datetime.strptime(month + "-01", "%Y-%m-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        # check fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_start = datetime.strptime(month + "-01", "%Y-%m-%d")
        d_end = datetime.strptime(month + "-" + str(day_in_month), "%Y-%m-%d")

        line_id = self.get_line_id(line_name)

        ## query db
        where_stmt = (
            "date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND shift = '"
            + shift
            + "' AND active = 'active' "
        )

        stmt = f"SELECT * FROM pchart_defect_record_log WHERE {where_stmt if where_stmt is not None else ''} ORDER BY date, ref"
        rs = await db.execute(text(stmt))

        return rs

    async def history_records_delete(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        date = data["date"]
        line = data["line"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]
        defect_type = data["defect_type"]
        defect_mode = data["defect_mode"]
        qty = data["qty"]
        creator = data["creator"]
        id = data["id"]

        line_id = self.get_line_id(line)

        ## query db
        id_defective_items = None

        flag = 0
        if defect_type == "Repeat NG":
            defect_type = "Repeat"
            flag = 1

        where_stmt = (
            "line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            # + "' AND sub_line = '"
            # + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND defect_mode = '"
            + defect_mode
            + "'"
            # + "' AND active = 'active' "
        )
        stmt = f"SELECT ref FROM master_defect WHERE {where_stmt if where_stmt is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            id_defective_items = r[key_index["ref"]]

        if flag == 1:
            defect_type = "Repeat NG"

        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' AND shift = '"
            + shift
            + "' AND qty = "
            + str(qty)
            + " AND active = 'active'"
            + " AND id = "
            + str(id)
        )

        stmt = f"""UPDATE pchart_defect_record_log SET active = 'delete', creator = '{creator}', updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """
        await db.execute(text(stmt))
        await db.commit()

        #######
        where_stmt = (
            "date = '"
            + date
            + "' AND line_id = '"
            + str(line_id)
            + "' AND part_no = '"
            + part_no
            + "' AND process = '"
            + process
            + "' AND sub_line = '"
            + sub_line
            + "' AND defect_type = '"
            + defect_type
            + "' AND id_defective_items = '"
            + str(id_defective_items)
            + "' "
        )

        sum_A = 0

        where_stmt_A = where_stmt + " AND shift ='A' AND active = 'active' "
        stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_A if where_stmt_A is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            if r[key_index["sum"]] == None:
                sum_A = 0
            else:
                sum_A = r[key_index["sum"]]

        sum_B = 0

        where_stmt_B = where_stmt + " AND shift ='B' AND active = 'active' "
        stmt = f"SELECT sum(qty) FROM pchart_defect_record_log WHERE {where_stmt_B if where_stmt_B is not None else ''}"
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            if r[key_index["sum"]] == None:
                sum_B = 0
            else:
                sum_B = r[key_index["sum"]]

        if shift == "A":
            qty_shift_a = int(sum_A)
            qty_shift_b = int(sum_B)
            qty_shift_all = qty_shift_a + qty_shift_b

            stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all}, qty_shift_a = {qty_shift_a}, qty_shift_b = {qty_shift_b}, updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

        else:
            qty_shift_a = int(sum_A)
            qty_shift_b = int(sum_B)
            qty_shift_all = qty_shift_a + qty_shift_b

            stmt = f"""UPDATE pchart_defect_record SET qty_shift_all = {qty_shift_all}, qty_shift_a = {qty_shift_a}, qty_shift_b = {qty_shift_b}, updated_at = current_timestamp AT TIME ZONE 'Etc/GMT-7' WHERE  {where_stmt if where_stmt is not None else ''} """

        await db.execute(text(stmt))
        await db.commit()

        return data

    async def get_defect_qty_by_date(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()
        date = data["date"]
        line = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]
        shift = shift.lower()
        line_id = self.get_line_id(line)
        stmt = f"""SELECT line_id,part_no,process,date,sum(qty_shift_{shift}) as defect_qty FROM public.pchart_defect_record
                    where 
                    line_id='{line_id}' and
                    part_no='{part_no}' and
                    process='{process}' and
                    process='{process}' and
                    sub_line='{sub_line}' and 
                    defect_type <>'Repeat'
                    group by line_id,part_no,process,date
                """
        # print("stmt2:", stmt)
        res = await db.execute(text(stmt))
        defect_qty = 0
        for r in res:
            key_index = r._key_to_index

            defect_qty = r[key_index["defect_qty"]]
        return {
            "line": line,
            "part_no": part_no,
            "process": process,
            "sub_line": sub_line,
            "date": date,
            "shift": shift,
            "defect_qty": defect_qty,
        }

    async def get_amount_action_record(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()
        date = data["date"]
        line = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]
        if shift == "All":
            shift = "'A','B'"
        else:
            shift = f"'{shift}'"

        line_id = self.get_line_id(line)
        stmt = f"""SELECT count(id) as amount_action_record FROM public.abnormal_occurrence
        where line_id='{line_id}' and part_no='{part_no}' and process='{process}' and sub_line='{sub_line}' and date='{date}' and shift in ({shift})
        """
        # print("stmt:", stmt)
        res = await db.execute(text(stmt))
        for r in res:
            key_index = r._key_to_index

            amount_action_record = r[key_index["amount_action_record"]]
        return {
            "month": data["month"],
            "line_name": line,
            "part_no": part_no,
            "process": process,
            "sub_line": sub_line,
            "date": date,
            "shift": shift,
            "amount_action_record": amount_action_record,
        }

    async def get_record_by(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        # date = data["date"]
        month = data["month"]
        date = convert_month_year_to_date(month)
        line = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"].lower()
        first_date, last_date = get_first_and_last_date_of_month(date)
        # if shift == "All":
        #     shift = "'A','B'"
        # else:
        #     shift = f"'{shift}'"

        line_id = self.get_line_id(line)
        stmt = f"""WITH RankedRecords AS (  
                        SELECT  
                            date,  
                            creator,  
                            created_at,  
                            ROW_NUMBER() OVER (PARTITION BY date ORDER BY created_at ASC) AS rn  
                        FROM  
                            public.pchart_defect_record
                        where  line_id='{line_id}' and part_no='{part_no}' and process='{process}' and sub_line='{sub_line}' and qty_shift_{shift}>0 and date >='{first_date}' and date <='{last_date}'
                    )  
                    SELECT  
                        date,  
                        creator as record_by
                    FROM  
                        RankedRecords  
                    WHERE  
                        rn = 1 ;  
                """
        # print("stmt:", stmt)
        res = await db.execute(text(stmt))
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                {
                    "date": r[key_index["date"]],
                    "record_by": get_initials(r[key_index["record_by"]]),
                }
            )
            # amount_action_record = r[key_index["amount_action_record"]]
        return return_list

    async def get_review_by_tl(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        month = data["month"]
        date = convert_month_year_to_date(month)
        line = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]  # .lower()
        first_date, last_date = get_first_and_last_date_of_month(date)
        if shift == "All":
            shift = "'A','B'"
        else:
            shift = f"'{shift}'"

        line_id = self.get_line_id(line)
        stmt = f"""
                    SELECT  
                        date::text,  
                        JSON_OBJECT_AGG(  
                            'shift_' || LOWER(shift), user_name  
                        ) AS review_by_tl  
                    FROM  
                        public.approval_daily 
                    WHERE   line_id='{line_id}' and 
                            part_no='{part_no}' and 
                            process='{process}' and 
                            sub_line='{sub_line}' and 
                            shift in ({shift}) and 
                            date >='{first_date}' and date <='{last_date}'
                            group by date
                """
        # print("stmt:", stmt)
        res = await db.execute(text(stmt))
        return_list = []
        for r in res:
            key_index = r._key_to_index
            temp = r[key_index["review_by_tl"]]
            review_by_tl = {}
            if data["shift"] == "All":
                review_by_tl = {"shift_a": None, "shift_b": None}
            if "shift_a" in temp and temp["shift_a"] != None:
                review_by_tl["shift_a"] = get_initials(temp["shift_a"])
            if "shift_b" in temp and temp["shift_b"] != None:
                review_by_tl["shift_b"] = get_initials(temp["shift_b"])
            return_list.append(
                {
                    "date": r[key_index["date"]],
                    "review_by_tl": review_by_tl,
                }
            )
        return return_list

    async def get_review_by_mgr(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        month = data["month"]
        date = convert_month_year_to_date(month)
        line = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]  # .lower()
        first_date, last_date = get_first_and_last_date_of_month(date)
        if shift == "All":
            shift = "'A','B'"
        else:
            shift = f"'{shift}'"

        line_id = self.get_line_id(line)
        stmt = f"""
                    SELECT  
                        week_number::text,
		                year_month::text,  
                        JSON_OBJECT_AGG(  
                            'shift_' || LOWER(shift), user_name  
                        ) AS review_by_mgr
                    FROM  
                        public.approval_weekly
                    WHERE   line_id='{line_id}' and 
                            part_no='{part_no}' and 
                            process='{process}' and 
                            sub_line='{sub_line}' and 
                            shift in ({shift}) and 
                            year_month='{first_date}' 
                            group by week_number,year_month
                """
        # print("stmt:", stmt)
        res = await db.execute(text(stmt))
        temp_list = []
        for r in res:
            key_index = r._key_to_index
            temp_list.append(
                {
                    "week_number": r[key_index["week_number"]],
                    "year_month": r[key_index["year_month"]],
                    "review_by_mgr": r[key_index["review_by_mgr"]],
                }
            )
        # print("temp_list1:", temp_list)
        temp_list = transform_approval_data("weekly", temp_list)
        # print("temp_list2:", temp_list)
        return_list = []
        for item in temp_list:
            # key_index = r._key_to_index
            temp = item["review_by_mgr"]
            review_by_mgr = {}
            if data["shift"] == "All":
                review_by_mgr = {"shift_a": None, "shift_b": None}
            if "shift_a" in temp and temp["shift_a"] != None:
                review_by_mgr["shift_a"] = get_initials(temp["shift_a"])
            if "shift_b" in temp and temp["shift_b"] != None:
                review_by_mgr["shift_b"] = get_initials(temp["shift_b"])
            return_list.append(
                {
                    "date": item["date"],
                    "review_by_mgr": review_by_mgr,
                }
            )
        # print("return_list:", return_list)
        return return_list

    async def get_review_by_gm(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()
        month = data["month"]
        date = convert_month_year_to_date(month)
        line = data["line_name"]
        part_no = data["part_no"]
        process = data["process"]
        sub_line = data["sub_line"]
        shift = data["shift"]  # .lower()
        first_date, last_date = get_first_and_last_date_of_month(date)
        if shift == "All":
            shift = "'A','B'"
        else:
            shift = f"'{shift}'"

        line_id = self.get_line_id(line)
        stmt = f"""
                    SELECT  
                        half_month::text,
		                year_month::text,  
                        JSON_OBJECT_AGG(  
                            'shift_' || LOWER(shift), user_name  
                        ) AS review_by_gm
                    FROM  
                        public.approval_bi_weekly
                    WHERE   line_id='{line_id}' and 
                            part_no='{part_no}' and 
                            process='{process}' and 
                            sub_line='{sub_line}' and 
                            shift in ({shift}) and 
                            year_month='{first_date}' 
                            group by half_month,year_month
                """
        # print("stmt:", stmt)
        res = await db.execute(text(stmt))
        temp_list = []
        for r in res:
            key_index = r._key_to_index
            temp_list.append(
                {
                    "half_month": r[key_index["half_month"]],
                    "year_month": r[key_index["year_month"]],
                    "review_by_gm": r[key_index["review_by_gm"]],
                }
            )
        # print("temp_list1:", temp_list)
        temp_list = transform_approval_data("biweekly", temp_list)
        # print("temp_list2:", temp_list)
        return_list = []
        for item in temp_list:
            # key_index = r._key_to_index
            temp = item["review_by_gm"]
            review_by_gm = {}
            if data["shift"] == "All":
                review_by_gm = {"shift_a": None, "shift_b": None}
            if "shift_a" in temp and temp["shift_a"] != None:
                review_by_gm["shift_a"] = get_initials(temp["shift_a"])
            if "shift_b" in temp and temp["shift_b"] != None:
                review_by_gm["shift_b"] = get_initials(temp["shift_b"])
            return_list.append(
                {
                    "date": item["date"],
                    "review_by_gm": review_by_gm,
                }
            )
        # print("return_list:", return_list)
        return return_list
