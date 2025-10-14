from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from sqlalchemy.sql import text
from datetime import datetime, date
from dotenv import load_dotenv
import requests
import json
import os
import pandas as pd

load_dotenv()


class Inline_Outline_CRUD:
    def __init__(self):
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")

    def get_line_id(self, linename):
        id_linename = None
        list_line = []
        list_line_id = []
        #!error
        try:
            ## get list_line_id, list_line_name from api
            endpoint = self.BACKEND_URL_SERVICE + "/api/settings/lines?rx_only=false"
            headers = {"X-API-Key": self.BACKEND_API_SERVICE}

            response = requests.get(endpoint, headers=headers)
            # print("endpoint:", endpoint)
            # print(
            #     " response.status_code:",
            #     response.status_code,
            # )
            # print(
            #     " response.content:",
            #     response.content,
            # )
            response_json = response.json()
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

    def get_list_line_id(self, list_linename):
        id_linename = None
        list_id_linename = []
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

        for linename in list_linename:

            if linename == "'":
                break
            else:
                index_select = list_line.index(linename)
                list_id_linename.append(str(list_line_id[index_select]))

        id_linename = str(list_id_linename).replace("[", "").replace("]", "")

        return id_linename

    async def department_section_change(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def default_defect_summary(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def get_target_control(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        month = data["month"]
        department = data["department"]
        section = data["section"]
        line = data["line"]

        if len(line) > 1:
            ## query db
            if section != "-":  # check filter = 'section'
                where_stmt = (
                    "month_year = '"
                    + month
                    + "' AND target_level = 'Section' AND target_name = '"
                    + section
                    + "'AND target_type = 'Monthly' AND active = 'active' "
                )

            else:  # check filter = 'department'
                where_stmt = (
                    "month_year = '"
                    + month
                    + "' AND target_level = 'Department' AND target_name = '"
                    + department
                    + "'AND target_type = 'Monthly' AND active = 'active' "
                )

            stmt = f"SELECT target_control FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
            rs = await db.execute(text(stmt))

        else:  # check filter = 'line'

            line_id = self.get_line_id(line[0])

            ## query db
            where_stmt = (
                "month_year = '"
                + month
                + "' AND target_type = 'Monthly' AND line_id = '"
                + str(line_id)
                + "' AND process IN ('Inline','Outline','Inspection') AND active = 'active' "
            )
            stmt = f"SELECT target_control FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
            rs = await db.execute(text(stmt))

        return rs, data

    async def get_defect(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        target: float | None = None,
    ):
        data = where_stmt.dict()

        str_list_line_id = self.get_list_line_id(data["line"])

        month = data["month"]
        department = data["department"]
        section = data["section"]
        line = data["line"]
        shift = data["shift"]

        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        ## check fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_start = datetime.strptime(month + "-01", "%B-%Y-%d")
        d_end = datetime.strptime(month + "-" + str(day_in_month), "%B-%Y-%d")

        defect_percent = 0.0
        defect_status = True
        total_defect = 0
        scrap_qty = 0
        scrap_percent = 0.0
        repeat_qty = 0
        repeat_percent = 0.0

        current_day = datetime.now().strftime("%d")
        try:
            ##last day of month = 31
            date_prod_qty_obj = datetime.strptime(
                month + "-" + str(current_day), "%B-%Y-%d"
            )
        except:
            current_day = str(int(current_day) - 1)
            try:
                ##last day of month = 30
                date_prod_qty_obj = datetime.strptime(
                    month + "-" + str(current_day), "%B-%Y-%d"
                )
            except:
                current_day = str(int(current_day) - 1)
                try:
                    ##last day of month = 29
                    date_prod_qty_obj = datetime.strptime(
                        month + "-" + str(current_day), "%B-%Y-%d"
                    )
                except:
                    current_day = str(int(current_day) - 1)
                    try:
                        ##last day of month = 28
                        date_prod_qty_obj = datetime.strptime(
                            month + "-" + str(current_day), "%B-%Y-%d"
                        )
                    except:
                        pass

        date_prod_qty = date_prod_qty_obj.strftime("%Y-%m-%d")

        ## get list_line_id, list_line_name from api
        list_line = []
        list_line_id = []
        try:
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

        list_prod_qty = [0] * day_in_month

        for line_name in line:

            index_select = list_line.index(line_name)
            select_line_id = list_line_id[index_select]

            try:
                ## get prod_qty from api
                # endpoint = (
                #     self.BACKEND_URL_SERVICE
                #     + "/api/prods/prod_qty?line_id="
                #     + str(select_line_id)
                #     + "&shift=All&date="
                #     + date_prod_qty
                # )
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/prods/prod_qty?line_id="
                    + str(select_line_id)
                    + f"&shift={shift}&date="
                    + date_prod_qty
                )
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["prod_qty"])):
                    c = int(str(response_json["prod_qty"][i]["production_date"])[8:10])
                    list_prod_qty[c - 1] = (
                        list_prod_qty[c - 1]
                        + response_json["prod_qty"][i]["actual_val"]
                    )

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )

        line = str(data["line"]).replace("[", "").replace("]", "")

        ## query db
        #### defect all
        where_stmt = (
            "line_id in ("
            + str_list_line_id
            + ") AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' AND defect_type NOT IN ('Repeat') "
        )

        stmt = f"SELECT * FROM pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            ## get data from db
            # total_defect = total_defect + r[key_index["qty_shift_all"]]
            total_defect = total_defect + r[key_index[f"qty_shift_{shift.lower()}"]]

        ## query db
        #### defect Scrap
        where_stmt = (
            "line_id in ("
            + str_list_line_id
            + ") AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' AND defect_type = 'Scrap' "
        )

        stmt = f"SELECT * FROM pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            ## get data from db
            # scrap_qty = scrap_qty + r[key_index["qty_shift_all"]]
            scrap_qty = scrap_qty + r[key_index[f"qty_shift_{shift.lower()}"]]

        ## query db
        #### defect repeat NG
        where_stmt = (
            "line_id in ("
            + str_list_line_id
            + ") AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' AND defect_type = 'Repeat NG' "
        )

        stmt = f"SELECT * FROM pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            ## get data from db
            # repeat_qty = repeat_qty + r[key_index["qty_shift_all"]]
            repeat_qty = repeat_qty + r[key_index[f"qty_shift_{shift.lower()}"]]

        #### calculate defect_percent, scrap_percent, repeat_percent
        if sum(list_prod_qty) == 0:
            defect_percent = 0.00
            scrap_percent = 0.00
            repeat_percent = 0.00
        else:
            defect_percent = round((total_defect / sum(list_prod_qty)) * 100, 2)
            scrap_percent = round((scrap_qty / sum(list_prod_qty)) * 100, 2)
            repeat_percent = round((repeat_qty / sum(list_prod_qty)) * 100, 2)

        ## calculate status
        if defect_percent < target:
            defect_status = True
        else:
            defect_status = False

        return (
            defect_percent,
            defect_status,
            total_defect,
            scrap_qty,
            scrap_percent,
            repeat_qty,
            repeat_percent,
            list_prod_qty,
        )

    async def get_graph_yearly_defect_summary(  #! need to revise for performance -> 4
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        prod_qty: float | None = None,
        defect_name: str | None = None,
    ):
        data = where_stmt.dict()
        shift = data["shift"]
        str_list_line_id = self.get_list_line_id(data["line"])

        month = data["month"]
        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")

        current_year = int(datetime_object.strftime("%Y"))

        list_target_percent_yearly = []
        list_defect_percent_yearly = []
        list_defect_qty_yearly = []

        current_month = datetime_object.strftime("%b")
        ## check fiscal year
        if current_month in ["Jan", "Feb", "Mar"]:
            list_axis_x_yearly = [
                "AVG\nFY" + str(current_year - 3),
                "AVG\nFY" + str(current_year - 2),
                "AVG\nFY" + str(current_year - 1),
            ]
            list_year = [
                str(current_year - 3),
                str(current_year - 2),
                str(current_year - 1),
            ]
            s_year = str(current_year - 3)
            e_year = str(current_year)
        else:
            list_axis_x_yearly = [
                "AVG\nFY" + str(current_year - 2),
                "AVG\nFY" + str(current_year - 1),
                "AVG\nFY" + str(current_year),
            ]
            list_year = [
                str(current_year - 2),
                str(current_year - 1),
                str(current_year),
            ]
            s_year = str(current_year - 2)
            e_year = str(current_year + 1)

        list_month = [
            "April-",
            "May-",
            "June-",
            "July-",
            "August-",
            "September-",
            "October-",
            "November-",
            "December-",
            "January-",
            "February-",
            "March-",
        ]

        department = data["department"]
        section = data["section"]
        line = data["line"]

        list_target_percent_yearly = [0] * 3
        list_target_percent_yearly_process = {}
        c = 0
        list_process = ["Inline", "Outline", "Inspection"]
        if len(line) > 1:
            if section != "-":  # check filter = 'section'
                where_stmt = (
                    "month_year in "
                    + str(tuple(list_year))
                    + " AND target_level = 'Section' AND target_name = '"
                    + section
                    + "'AND target_type = 'Fiscal Year' AND active = 'active' "
                )

            else:  # check filter = 'department'
                where_stmt = (
                    "month_year in "
                    + str(tuple(list_year))
                    + " AND target_level = 'Department' AND target_name = '"
                    + department
                    + "'AND target_type = 'Fiscal Year' AND active = 'active' "
                )

            stmt = f"SELECT month_year,target_control FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
            # print("stmt GG1:", stmt)
            rs = await db.execute(text(stmt))  #!
            df_master_target_org = pd.DataFrame(rs.all(), columns=rs.keys())
            for process in list_process:
                c = 0
                for year in list_year:
                    target_percent = 0.0

                    # ## query db
                    # if section != "-":  # check filter = 'section'
                    #     where_stmt = (
                    #         "month_year = '"
                    #         + year
                    #         + "' AND target_level = 'Section' AND target_name = '"
                    #         + section
                    #         + "'AND target_type = 'Fiscal Year' AND active = 'active' "
                    #     )

                    # else:  # check filter = 'department'
                    #     where_stmt = (
                    #         "month_year = '"
                    #         + year
                    #         + "' AND target_level = 'Department' AND target_name = '"
                    #         + department
                    #         + "'AND target_type = 'Fiscal Year' AND active = 'active' "
                    #     )

                    # stmt = f"SELECT target_control FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
                    # print("stmt GG1:", stmt)
                    # rs = await db.execute(text(stmt))  #!
                    # rows = rs.all()
                    # columns = rs.keys()
                    # print("rows:", rows)
                    # for r in rs:
                    #     key_index = r._key_to_index

                    #     ## get data from db
                    #     target_percent = r[key_index["target_control"]]
                    #     break
                    if not df_master_target_org.empty:
                        # target_percent = (
                        #     df_master_target_org[
                        #         str(df_master_target_org["month_year"]) == str(year)
                        #     ]
                        # )["target_control"][0]
                        mask = df_master_target_org["month_year"].astype(str) == str(
                            year
                        )
                        filtered = df_master_target_org[mask]
                        if not filtered.empty:
                            target_percent = filtered["target_control"].iloc[0]
                    list_target_percent_yearly[c] = target_percent
                    # print("list_target_percent_yearly:", list_target_percent_yearly)
                    c += 1
                list_target_percent_yearly_process[process] = list_target_percent_yearly
        else:  # check filter = 'line'
            line_id = self.get_line_id(line[0])
            where_stmt = (
                "month_year in "
                + str(tuple(list_year))
                + " AND target_type = 'Fiscal Year' AND line_id = '"
                + str(line_id)
                + "' AND process IN ('Inline','Outline','Inspection') AND active = 'active' "
            )
            # TODO:
            stmt = f"SELECT process,month_year,target_control FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY array_position(ARRAY['Inline','Outline','Inspection']::varchar[], process);"
            # print("stmt GG2:", stmt)
            rs = await db.execute(text(stmt))  #!
            df_master_target_line = pd.DataFrame(rs.all(), columns=rs.keys())
            for process in list_process:
                c = 0
                for year in list_year:
                    target_percent = 0.0

                    ## query db
                    # where_stmt = (
                    #     "month_year = '"
                    #     + year
                    #     + "' AND target_type = 'Fiscal Year' AND line_id = '"
                    #     + str(line_id)
                    #     + "' AND process IN ('Inline','Outline','Inspection') AND active = 'active' "
                    # )

                    # stmt = f"SELECT target_control FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY array_position(ARRAY['Inline','Outline','Inspection']::varchar[], process);"
                    # print("stmt GG2:", stmt)
                    # rs = await db.execute(text(stmt))  #!

                    # for r in rs:
                    #     key_index = r._key_to_index

                    #     ## get data from db
                    #     target_percent = r[key_index["target_control"]]
                    #     break
                    if not df_master_target_line.empty:
                        # target_percent = (
                        #     df_master_target_line[
                        #         str(df_master_target_line["month_year"]) == str(year)
                        #     ]
                        # )["target_control"][0]
                        mask = (
                            df_master_target_line["month_year"].astype(str) == str(year)
                        ) and (
                            df_master_target_line["process"].astype(str) == str(process)
                        )
                        filtered = df_master_target_line[mask]
                        if not filtered.empty:
                            target_percent = filtered["target_control"].iloc[0]
                    list_target_percent_yearly[c] = target_percent
                    c += 1
                list_target_percent_yearly_process[process] = list_target_percent_yearly

        line = str(data["line"]).replace("[", "").replace("]", "")
        defect_type = []
        # print("list_target_percent_process_yearly:", list_target_percent_process_yearly)
        ## query db

        stmt = (
            f"SELECT process,defect_type, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
            + s_year
            + "-04-01' AND date <= '"
            + e_year
            + "-03-31' AND defect_type NOT IN ('Repeat') GROUP BY process,defect_type ORDER BY array_position(ARRAY['Repeat NG', 'Scrap', 'M/C Set up', 'Quality Test', 'Appearance', 'Dimension', 'Performance', 'Other']::varchar[], defect_type);"
        )

        rs = await db.execute(text(stmt))
        # df = pd.DataFrame(rs.all(), columns=rs.keys())
        # print("df:", df)
        defect_process = []
        for r in rs:
            key_index = r._key_to_index

            ## get data from db
            defect_process.append(r[key_index["process"]])
            defect_type.append(r[key_index["defect_type"]])

        list_qty = [0] * 3
        list_qty_process = {}
        list_defect_percent_yearly = [0] * 3
        list_defect_percent_yearly_process = {}
        list_defect_qty_yearly_process = {}
        # TODO:
        stmt = (
            f"SELECT process,date,defect_type, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + ") "
            # +
            # "AND defect_type = '"
            # + defect
            # + "' "
            + f"AND qty_shift_{shift.lower()} NOT IN (0) "
            # +"AND date >= '"
            # + str(d_start)[:10]
            # + "' AND date <= '"
            # + str(d_end)[:10]
            # + "'"
            + " GROUP BY process,date,defect_type ;"
        )

        rs = await db.execute(text(stmt))  #!
        df_defect_qty = pd.DataFrame(rs.all(), columns=rs.keys())
        df_defect_qty["date"] = pd.to_datetime(df_defect_qty["date"])
        for process in list_process:
            df_defect_qty_process = df_defect_qty[(df_defect_qty["process"] == process)]
            # df_defect_qty_process.to_excel(f"test_df_defect_qty_process_{process}.xlsx")
            list_defect_percent_yearly = [0] * 3
            list_qty = [0] * 3
            list_defect_qty_yearly = []
            for idx, defect in enumerate(defect_type):
                if defect_process[idx] == process:
                    del list_qty[:]
                    list_qty = [0] * 3
                    c = 0

                    for year in list_year:
                        ## check last year
                        if c == len(list_year) - 1:

                            datetime_object = datetime.strptime(
                                data["month"] + "-01", "%B-%Y-%d"
                            )
                            month_number = int(str(datetime_object)[5:7])
                            year_now = int(str(datetime_object)[:4])

                            if month_number != 12:
                                day_in_month = (
                                    date(year_now, month_number + 1, 1)
                                    - date(year_now, month_number, 1)
                                ).days
                            else:
                                day_in_month = (
                                    date(year_now + 1, 1, 1)
                                    - date(year_now, month_number, 1)
                                ).days

                            d_start = datetime.strptime(
                                "April-" + year + "-01", "%B-%Y-%d"
                            )
                            d_end = datetime.strptime(
                                data["month"] + "-" + str(day_in_month), "%B-%Y-%d"
                            )

                            ## query db
                            # stmt = (
                            #     "SELECT defect_type, SUM(qty_shift_all) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
                            #     + str_list_line_id
                            #     + ") AND defect_type = '"
                            #     + defect
                            #     + "' AND qty_shift_all NOT IN (0) AND date >= '"
                            #     + str(d_start)[:10]
                            #     + "' AND date <= '"
                            #     + str(d_end)[:10]
                            #     + "' GROUP BY defect_type ;"
                            # )

                            # rs = await db.execute(text(stmt))  #!

                            # for r in rs:
                            #     key_index = r._key_to_index

                            #     ## get data from db
                            #     list_qty[c] = r[key_index["defect_qty"]]
                            #     list_defect_percent_yearly[c] = (
                            #         list_defect_percent_yearly[c] + r[key_index["defect_qty"]]
                            #     )
                            df = df_defect_qty_process[
                                (df_defect_qty_process["defect_type"] == defect)
                                & (
                                    df_defect_qty_process["date"]
                                    >= pd.to_datetime(str(d_start)[:10])
                                )
                                & (
                                    df_defect_qty_process["date"]
                                    <= pd.to_datetime(str(d_end)[:10])
                                )
                            ]
                            df = df[["defect_type", "defect_qty"]]
                            df = (
                                df.groupby("defect_type")["defect_qty"]
                                .sum()
                                .reset_index()
                            )

                            for index, row in df.iterrows():
                                list_qty[c] = row["defect_qty"]
                                list_defect_percent_yearly[c] = (
                                    list_defect_percent_yearly[c] + row["defect_qty"]
                                )

                        else:
                            d_start = datetime.strptime(
                                "April-" + year + "-01", "%B-%Y-%d"
                            )
                            d_end = datetime.strptime(
                                "March-" + str(int(year) + 1) + "-31", "%B-%Y-%d"
                            )

                            ## query db
                            # stmt = (
                            #     "SELECT defect_type, SUM(qty_shift_all) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
                            #     + str_list_line_id
                            #     + ") AND defect_type = '"
                            #     + defect
                            #     + "' AND qty_shift_all NOT IN (0) AND date >= '"
                            #     + str(d_start)[:10]
                            #     + "' AND date <= '"
                            #     + str(d_end)[:10]
                            #     + "' GROUP BY defect_type ;"
                            # )

                            # rs = await db.execute(text(stmt))  #!
                            df = df_defect_qty_process[
                                (df_defect_qty_process["defect_type"] == defect)
                                & (
                                    df_defect_qty_process["date"]
                                    >= pd.to_datetime(str(d_start)[:10])
                                )
                                & (
                                    df_defect_qty_process["date"]
                                    <= pd.to_datetime(str(d_end)[:10])
                                )
                            ]
                            df = df[["defect_type", "defect_qty"]]
                            df = (
                                df.groupby("defect_type")["defect_qty"]
                                .sum()
                                .reset_index()
                            )

                            # for r in rs:
                            #     key_index = r._key_to_index

                            #     ## get data from db
                            #     list_qty[c] = r[key_index["defect_qty"]]
                            #     list_defect_percent_yearly[c] = (
                            #         list_defect_percent_yearly[c] + r[key_index["defect_qty"]]
                            #     )
                            for index, row in df.iterrows():
                                list_qty[c] = row["defect_qty"]
                                list_defect_percent_yearly[c] = (
                                    list_defect_percent_yearly[c] + row["defect_qty"]
                                )

                        c += 1

                    copied_list = list_qty.copy()

                    list_defect_qty_yearly.append([defect, copied_list])
            list_defect_percent_yearly_process[process] = list_defect_percent_yearly
            list_defect_qty_yearly_process[process] = list_defect_qty_yearly

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

        list_prod_qty = [0] * 3
        # print("list_year: ", list_year)
        # print("list_month: ", list_month)
        c = 0
        # print('data["line"]:', data["line"])
        for year in list_year:
            ## check last year
            if c == len(list_year) - 1:
                for month in list_month:

                    ## check fiscal year
                    if month in ["January-", "February-", "March-"]:
                        year = str(int(year) + 1)

                    datetime_object = datetime.strptime(
                        month + year + "-01", "%B-%Y-%d"
                    )
                    month_number_now = int(str(datetime_object)[5:7])
                    date_prod_qty = datetime_object.strftime("%Y-%m-%d")
                    # select_line_id_list=[]
                    select_line_id = ""
                    for line_name in data["line"]:

                        index_select = list_line.index(line_name)
                        # select_line_id_list.append(list_line_id[index_select])
                        select_line_id += f"&line_id={list_line_id[index_select]}"
                        # select_line_id = list_line_id[index_select]

                    try:
                        ## get prod_qty from api
                        endpoint = (
                            self.BACKEND_URL_SERVICE
                            + "/api/prods/prod_qty?"
                            + f"shift={shift}"
                            + str(select_line_id)
                            + "&date="
                            + date_prod_qty
                        )
                        response_json = requests.get(
                            endpoint, headers=headers
                        ).json()  #!

                        for i in range(0, len(response_json["prod_qty"])):
                            list_prod_qty[c] = (
                                list_prod_qty[c]
                                + response_json["prod_qty"][i]["actual_val"]
                            )

                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"because {e}",
                        )

                    datetime_object = datetime.strptime(
                        data["month"] + "-01", "%B-%Y-%d"
                    )
                    month_number_end = int(str(datetime_object)[5:7])

                    if month_number_now == month_number_end:
                        break

            else:
                for month in list_month:
                    ## check fiscal year
                    if month in ["January-", "February-", "March-"]:
                        year = str(int(year) + 1)

                    datetime_object = datetime.strptime(
                        month + year + "-01", "%B-%Y-%d"
                    )
                    date_prod_qty = datetime_object.strftime("%Y-%m-%d")

                    select_line_id = ""
                    for line_name in data["line"]:
                        index_select = list_line.index(line_name)
                        # select_line_id_list.append(list_line_id[index_select])
                        select_line_id += f"&line_id={list_line_id[index_select]}"
                        # index_select = list_line.index(line_name)
                        # select_line_id = list_line_id[index_select]

                    try:
                        ## get prod_qty from api
                        endpoint = (
                            self.BACKEND_URL_SERVICE
                            + "/api/prods/prod_qty?"
                            + f"shift={shift}"
                            + str(select_line_id)
                            + "&date="
                            + date_prod_qty
                        )
                        # print("endpoint: ", endpoint)
                        response_json = requests.get(
                            endpoint, headers=headers
                        ).json()  #!

                        for i in range(0, len(response_json["prod_qty"])):
                            list_prod_qty[c] = (
                                list_prod_qty[c]
                                + response_json["prod_qty"][i]["actual_val"]
                            )

                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"because {e}",
                        )
                c += 1

        ## calculate defect_percent_yearly
        for process in list_process:
            for i in range(0, len(list_prod_qty)):
                if list_prod_qty[i] == 0:
                    list_defect_percent_yearly_process[process][i] = 0.0
                else:
                    list_defect_percent_yearly_process[process][i] = round(
                        (
                            list_defect_percent_yearly_process[process][i]
                            / list_prod_qty[i]
                        )
                        * 100,
                        2,
                    )

        return (
            list_axis_x_yearly,
            list_target_percent_yearly_process,
            list_defect_percent_yearly_process,
            list_defect_qty_yearly_process,
        )

    async def get_graph_monthly_defect_summary(  #! need to revise for performance -> 5
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        prod_qty: float | None = None,
        defect_name: str | None = None,
    ):
        data = where_stmt.dict()
        shift = data["shift"]
        str_list_line_id = self.get_list_line_id(data["line"])

        list_axis_x_monthly = []
        list_target_percent_monthly = []
        list_defect_percent_monthly = []
        list_defect_qty_monthly = []

        month = data["month"]
        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])
        s_year = int(str(datetime_object)[2:4])

        ## transform list fiscal year
        if month_number in [1, 2, 3]:
            list_axis_x_monthly = [
                "Apr'" + str(s_year - 1),
                "May'" + str(s_year - 1),
                "Jun'" + str(s_year - 1),
                "Jul'" + str(s_year - 1),
                "Aug'" + str(s_year - 1),
                "Sep'" + str(s_year - 1),
                "Oct'" + str(s_year - 1),
                "Nov'" + str(s_year - 1),
                "Dec'" + str(s_year - 1),
                "Jan'" + str(s_year),
                "Feb'" + str(s_year),
                "Mar'" + str(s_year),
            ]

            list_month = [
                "April-20" + str(s_year - 1),
                "May-20" + str(s_year - 1),
                "June-20" + str(s_year - 1),
                "July-20" + str(s_year - 1),
                "August-20" + str(s_year - 1),
                "September-20" + str(s_year - 1),
                "October-20" + str(s_year - 1),
                "November-20" + str(s_year - 1),
                "December-20" + str(s_year - 1),
                "January-20" + str(s_year),
                "February-20" + str(s_year),
                "March-20" + str(s_year),
            ]

            s_year = "20" + str(s_year - 1)
            e_year = "20" + str(s_year)

        else:
            list_axis_x_monthly = [
                "Apr'" + str(s_year),
                "May'" + str(s_year),
                "Jun'" + str(s_year),
                "Jul'" + str(s_year),
                "Aug'" + str(s_year),
                "Sep'" + str(s_year),
                "Oct'" + str(s_year),
                "Nov'" + str(s_year),
                "Dec'" + str(s_year),
                "Jan'" + str(s_year + 1),
                "Feb'" + str(s_year + 1),
                "Mar'" + str(s_year + 1),
            ]

            list_month = [
                "April-20" + str(s_year),
                "May-20" + str(s_year),
                "June-20" + str(s_year),
                "July-20" + str(s_year),
                "August-20" + str(s_year),
                "September-20" + str(s_year),
                "October-20" + str(s_year),
                "November-20" + str(s_year),
                "December-20" + str(s_year),
                "January-20" + str(s_year + 1),
                "February-20" + str(s_year + 1),
                "March-20" + str(s_year + 1),
            ]

            e_year = "20" + str(s_year + 1)
            s_year = "20" + str(s_year)

        department = data["department"]
        section = data["section"]
        line = data["line"]

        if len(line) > 1:
            if section != "-":  # check filter = 'section'
                where_stmt = (
                    "month_year in "
                    + str(tuple(list_month))
                    + " AND target_level = 'Section' AND target_name = '"
                    + section
                    + "'AND target_type = 'Monthly' AND active = 'active' "
                )

            else:  # check filter = 'department'
                where_stmt = (
                    "month_year in "
                    + str(tuple(list_month))
                    + " AND target_level = 'Department' AND target_name = '"
                    + department
                    + "'AND target_type = 'Monthly' AND active = 'active' "
                )

            stmt = f"SELECT month_year,target_control FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
            rs = await db.execute(text(stmt))
            df_master_target_org = pd.DataFrame(rs.all(), columns=rs.keys())

            for month in list_month:
                target_percent = 0.0

                # query db
                # if section != "-":  # check filter = 'section'
                #     where_stmt = (
                #         "month_year = '"
                #         + month
                #         + "' AND target_level = 'Section' AND target_name = '"
                #         + section
                #         + "'AND target_type = 'Monthly' AND active = 'active' "
                #     )

                # else:  # check filter = 'department'
                #     where_stmt = (
                #         "month_year = '"
                #         + month
                #         + "' AND target_level = 'Department' AND target_name = '"
                #         + department
                #         + "'AND target_type = 'Monthly' AND active = 'active' "
                #     )

                # stmt = f"SELECT target_control FROM master_target_org WHERE {where_stmt if where_stmt is not None else ''} ORDER BY id"
                # rs = await db.execute(text(stmt))  #!
                if not df_master_target_org.empty:
                    # target_percent = (
                    #     df_master_target_org[
                    #         str(df_master_target_org["month_year"]) == str(month)
                    #     ]
                    # )["target_control"][0]
                    mask = df_master_target_org["month_year"].astype(str) == str(month)
                    filtered = df_master_target_org[mask]
                    if not filtered.empty:
                        target_percent = filtered["target_control"].iloc[0]
                # for r in rs:
                #     key_index = r._key_to_index

                #     # get data from db
                #     target_percent = r[key_index["target_control"]]
                #     break

                list_target_percent_monthly.append(target_percent)

        else:  # check filter = 'line'

            line_id = self.get_line_id(line[0])
            where_stmt = (
                "month_year in "
                + str(tuple(list_month))
                + " AND target_type = 'Monthly' AND line_id = '"
                + str(line_id)
                + "' AND process IN ('Inline','Outline','Inspection') AND active = 'active' "
            )
            # TODO:
            stmt = f"SELECT month_year,target_control FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY array_position(ARRAY['Inline','Outline','Inspection']::varchar[], process );"
            rs = await db.execute(text(stmt))
            df_master_target_line = pd.DataFrame(rs.all(), columns=rs.keys())
            # query db
            for month in list_month:
                target_percent = 0.0
                # where_stmt = (
                #     "month_year = '"
                #     + month
                #     + "' AND target_type = 'Monthly' AND line_id = '"
                #     + str(line_id)
                #     + "' AND process IN ('Inline','Outline','Inspection') AND active = 'active' "
                # )

                # stmt = f"SELECT target_control FROM master_target_line WHERE {where_stmt if where_stmt is not None else ''} ORDER BY array_position(ARRAY['Inline','Outline','Inspection']::varchar[], process );"
                # rs = await db.execute(text(stmt))  #!
                # for r in rs:
                #     key_index = r._key_to_index

                #     # get data from db
                #     target_percent = r[key_index["target_control"]]
                #     break
                if not df_master_target_line.empty:
                    # target_percent = (
                    #     df_master_target_line[
                    #         str(df_master_target_line["month_year"]) == str(month)
                    #     ]
                    # )["target_control"][0]
                    mask = df_master_target_line["month_year"].astype(str) == str(month)
                    filtered = df_master_target_line[mask]
                    if not filtered.empty:
                        target_percent = filtered["target_control"].iloc[0]

                list_target_percent_monthly.append(target_percent)

        line = str(data["line"]).replace("[", "").replace("]", "")

        datetime_object = datetime.strptime(data["month"] + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        # check fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_end = str(
            datetime.strptime(data["month"] + "-" + str(day_in_month), "%B-%Y-%d")
        )

        defect_name = []

        # query db
        # Repeat NG, Scrap, M/C Set up, Quality Test, Appearance, Dimension, Performance, Other
        stmt = (
            f"SELECT defect_type, defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type IN ('Repeat NG', 'Scrap') AND defective_items NOT IN ('') AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
            + s_year
            + "-04-01' AND date <= '"
            + d_end
            + "' GROUP BY defect_type, defective_items ORDER BY array_position(ARRAY['Repeat NG', 'Scrap']::varchar[], defect_type);"
        )
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            # get data from db
            defect_name.append(r[key_index["defective_items"]])

        # query db
        stmt = (
            f"SELECT defect_type, defect_type AS defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type IN ('M/C Set up','Quality Test') AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
            + s_year
            + "-04-01' AND date <= '"
            + d_end
            + "' GROUP BY defect_type ORDER BY array_position(ARRAY['M/C Set up', 'Quality Test']::varchar[], defect_type);"
        )
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            # get data from db
            defect_name.append(r[key_index["defective_items"]])

        # query db
        stmt = (
            f"SELECT defect_type, defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type NOT IN ('Repeat') AND defective_items NOT IN ('') AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
            + s_year
            + "-04-01' AND date <= '"
            + d_end
            + "' GROUP BY defect_type, defective_items ORDER BY array_position(ARRAY['Appearance', 'Dimension', 'Performance', 'Other']::varchar[], defect_type);"
        )
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            # get data from db
            defect_name.append(r[key_index["defective_items"]])

        defect_name = list(dict.fromkeys(defect_name))

        list_qty = [0] * 12
        list_defect_percent_monthly = [0] * 12
        # TODO:
        stmt = (
            f"SELECT date,defect_type,defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + ") "
            # "AND defect_type NOT IN ('Repeat') "
            # +"AND defective_items = '"
            # + defect
            + f" AND qty_shift_{shift.lower()} NOT IN (0) "
            # +"AND date >= '"
            # + str(d_start)[:10]
            # + "' AND date <= '"
            # + str(d_end)[:10]
            + " GROUP BY date,defect_type,defective_items ;"
        )

        rs = await db.execute(text(stmt))
        df_defect_qty = pd.DataFrame(rs.all(), columns=rs.keys())
        df_defect_qty["date"] = pd.to_datetime(df_defect_qty["date"])

        for defect in defect_name:

            del list_qty[:]
            list_qty = [0] * 12
            c = 0

            for month in list_month:

                datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
                month_number = int(str(datetime_object)[5:7])
                year = int(str(datetime_object)[:4])

                ## check fical year
                if month_number != 12:
                    day_in_month = (
                        date(year, month_number + 1, 1) - date(year, month_number, 1)
                    ).days
                else:
                    day_in_month = (
                        date(year + 1, 1, 1) - date(year, month_number, 1)
                    ).days

                d_start = datetime.strptime(month + "-01", "%B-%Y-%d")
                d_end = datetime.strptime(month + "-" + str(day_in_month), "%B-%Y-%d")

                # query db
                if (defect == "M/C Set up") | (defect == "Quality Test"):
                    df = df_defect_qty[
                        (df_defect_qty["defect_type"] == defect)
                        & (df_defect_qty["date"] >= pd.to_datetime(str(d_start)[:10]))
                        & (df_defect_qty["date"] <= pd.to_datetime(str(d_end)[:10]))
                    ]
                    df = df[["defect_type", "defect_qty"]]
                    df.columns = ["defective_items", "defect_qty"]
                    df = df.groupby("defective_items")["defect_qty"].sum().reset_index()
                    # stmt = (
                    #     "SELECT defect_type AS defective_items, SUM(qty_shift_all) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
                    #     + str_list_line_id
                    #     + ") AND defect_type = '"
                    #     + defect
                    #     + "' AND qty_shift_all NOT IN (0) AND date >= '"
                    #     + str(d_start)[:10]
                    #     + "' AND date <= '"
                    #     + str(d_end)[:10]
                    #     + "' GROUP BY defect_type ;"
                    # )

                else:
                    df = df_defect_qty[
                        (df_defect_qty["defective_items"] == defect)
                        & (df_defect_qty["defect_type"] != "Repeat")
                        & (df_defect_qty["date"] >= pd.to_datetime(str(d_start)[:10]))
                        & (df_defect_qty["date"] <= pd.to_datetime(str(d_end)[:10]))
                    ]
                    df = df[["defective_items", "defect_qty"]]
                    df = df.groupby("defective_items")["defect_qty"].sum().reset_index()
                    # stmt = (
                    #     "SELECT defective_items, SUM(qty_shift_all) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
                    #     + str_list_line_id
                    #     + ") AND defect_type NOT IN ('Repeat') AND defective_items = '"
                    #     + defect
                    #     + "' AND qty_shift_all NOT IN (0) AND date >= '"
                    #     + str(d_start)[:10]
                    #     + "' AND date <= '"
                    #     + str(d_end)[:10]
                    #     + "' GROUP BY defective_items ;"
                    # )

                # rs = await db.execute(text(stmt))  #!
                # for r in rs:
                #     key_index = r._key_to_index

                #     # get data from db
                #     list_qty[c] = r[key_index["defect_qty"]]
                #     list_defect_percent_monthly[c] = (
                #         list_defect_percent_monthly[c] + r[key_index["defect_qty"]]
                #     )
                for index, row in df.iterrows():
                    list_qty[c] = row["defect_qty"]
                    list_defect_percent_monthly[c] = (
                        list_defect_percent_monthly[c] + row["defect_qty"]
                    )
                if month == data["month"]:
                    break

                c += 1

            copied_list = list_qty.copy()

            list_defect_qty_monthly.append([defect, copied_list])

        list_line = []
        list_line_id = []

        try:
            endpoint = self.BACKEND_URL_SERVICE + "/api/settings/lines?rx_only=false"
            headers = {"X-API-Key": self.BACKEND_API_SERVICE}
            response_json = requests.get(endpoint, headers=headers).json()  #!

            for i in range(0, len(response_json["lines"])):
                list_line.append(response_json["lines"][i]["section_line"])
                list_line_id.append(response_json["lines"][i]["line_id"])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        list_prod_qty = [0] * 12

        c = 0
        for month in list_month:

            datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
            date_prod_qty = datetime_object.strftime("%Y-%m-%d")

            select_line_id = ""
            for line_name in data["line"]:

                # index_select = list_line.index(line_name)
                # select_line_id = list_line_id[index_select]
                index_select = list_line.index(line_name)
                select_line_id += f"&line_id={list_line_id[index_select]}"

            try:
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/prods/prod_qty?"
                    + f"shift={shift}"
                    + str(select_line_id)
                    + "&date="
                    + date_prod_qty
                )
                response_json = requests.get(endpoint, headers=headers).json()  #!

                for i in range(0, len(response_json["prod_qty"])):
                    list_prod_qty[c] = (
                        list_prod_qty[c] + response_json["prod_qty"][i]["actual_val"]
                    )

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )
            c += 1

        ## calculate defect_percent_monthly
        for i in range(0, len(list_prod_qty)):
            if list_prod_qty[i] == 0:
                list_defect_percent_monthly[i] = 0.0
            else:
                list_defect_percent_monthly[i] = round(
                    (list_defect_percent_monthly[i] / list_prod_qty[i]) * 100, 2
                )

        return (
            list_axis_x_monthly,
            list_target_percent_monthly,
            list_defect_percent_monthly,
            list_defect_qty_monthly,
        )

    async def get_graph_daily_defect_summary(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        prod_qty: float | None = None,
    ):
        data = where_stmt.dict()
        shift = data["shift"]
        str_list_line_id = self.get_list_line_id(data["line"])

        list_axis_x_daily = []
        list_axis_y_lift = ["0.00", "25.00", "50.00", "75.00", "100.00", "125.00"]
        list_axis_y_right = ["0.00%", "1.00%", "2.00%", "3.00%", "4.00%", "5.00%"]
        list_defect_percent_actual = []
        list_defect_qty_daily = []

        month = data["month"]
        line = str(data["line"]).replace("[", "").replace("]", "")

        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        # checl fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_start = datetime.strptime(month + "-01", "%B-%Y-%d")
        d_end = datetime.strptime(month + "-" + str(day_in_month), "%B-%Y-%d")

        list_axis_x_daily = list(
            range(int(str(d_start)[8:10]), int(str(d_end)[8:10]) + 1)
        )
        list_axis_x_daily = list(map(str, list_axis_x_daily))

        list_qty = [0] * day_in_month
        list_defect_percent_actual = [0] * day_in_month

        defect_name = []
        # query db
        # Repeat NG, Scrap, M/C Set up, Quality Test, Appearance, Dimension, Performance, Other
        stmt = (
            f"SELECT defect_type, defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type IN ('Repeat NG', 'Scrap') AND defective_items NOT IN ('') AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' GROUP BY defect_type, defective_items ORDER BY array_position(ARRAY['Repeat NG', 'Scrap']::varchar[], defect_type);"
        )
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            # get data from db
            defect_name.append(r[key_index["defective_items"]])

        stmt = (
            f"SELECT defect_type, defect_type AS defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type IN ('M/C Set up','Quality Test') AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' GROUP BY defect_type ORDER BY array_position(ARRAY['M/C Set up', 'Quality Test']::varchar[], defect_type);"
        )
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            # get data from db
            defect_name.append(r[key_index["defective_items"]])

        # query db
        stmt = (
            f"SELECT defect_type, defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type NOT IN ('Repeat') AND defective_items NOT IN ('') AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' GROUP BY defect_type, defective_items ORDER BY array_position(ARRAY['Appearance', 'Dimension', 'Performance', 'Other']::varchar[], defect_type);"
        )
        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            # get data from db
            defect_name.append(r[key_index["defective_items"]])

        defect_name = list(dict.fromkeys(defect_name))

        for defect in defect_name:
            del list_qty[:]
            list_qty = [0] * day_in_month

            # query db
            if (defect == "M/C Set up") | (defect == "Quality Test"):

                stmt = (
                    f"SELECT date,defect_type AS defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
                    + str_list_line_id
                    + ") AND defect_type = '"
                    + defect
                    + f"' AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
                    + str(d_start)
                    + "' AND date <= '"
                    + str(d_end)
                    + "' GROUP BY defect_type,date ORDER BY date ASC;"
                )

            else:
                stmt = (
                    f"SELECT date,defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
                    + str_list_line_id
                    + ") AND defect_type NOT IN ('Repeat') AND defective_items = '"
                    + defect
                    + f"' AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
                    + str(d_start)
                    + "' AND date <= '"
                    + str(d_end)
                    + "' GROUP BY defective_items,date ORDER BY date ASC;"
                )

            rs = await db.execute(text(stmt))
            for r in rs:
                key_index = r._key_to_index

                # get data from db
                list_qty[int(str(r[key_index["date"]])[8:10]) - 1] = r[
                    key_index["defect_qty"]
                ]
                list_defect_percent_actual[int(str(r[key_index["date"]])[8:10]) - 1] = (
                    list_defect_percent_actual[int(str(r[key_index["date"]])[8:10]) - 1]
                    + r[key_index["defect_qty"]]
                )

            copied_list = list_qty.copy()

            # get list_defect_qty_daily
            list_defect_qty_daily.append([r[key_index["defective_items"]], copied_list])

        ## calulate prod_qty
        if len(data["line"]) == 1:
            cal_prod_qty = prod_qty
        else:
            cal_prod_qty = [0] * day_in_month

            j = 0
            for i in range(0, len(prod_qty)):
                cal_prod_qty[j] = cal_prod_qty[j] + prod_qty[i]
                j += 1
                if j == len(cal_prod_qty):
                    j = 0

        ## calulate list_defect_percent_actual
        for i in range(0, len(cal_prod_qty)):
            if prod_qty[i] == 0:
                list_defect_percent_actual[i] = 0.0
            else:
                list_defect_percent_actual[i] = round(
                    (list_defect_percent_actual[i] / cal_prod_qty[i]) * 100, 2
                )

        return (
            list_axis_x_daily,
            list_axis_y_lift,
            list_axis_y_right,
            list_defect_percent_actual,
            list_defect_qty_daily,
        )

    async def get_graph_defect_summary_by_type(
        self,
        db: AsyncSession,
        where_stmt: str | None = None,
        prod_qty: float | None = None,
    ):
        data = where_stmt.dict()
        shift = data["shift"]
        str_list_line_id = self.get_list_line_id(data["line"])

        total = 0.0
        list_defect_by_type = []
        sum_defect_qty = 0

        month = data["month"]
        line = str(data["line"]).replace("[", "").replace("]", "")

        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        # checl fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_start = datetime.strptime(month + "-01", "%B-%Y-%d")
        d_end = datetime.strptime(month + "-" + str(day_in_month), "%B-%Y-%d")

        # query db
        # TODO:
        stmt = (
            f"SELECT defect_type AS defective_items, SUM(qty_shift_{shift.lower()}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type NOT IN ('Repeat') AND qty_shift_{shift.lower()} NOT IN (0) AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' GROUP BY defect_type ORDER BY defect_qty DESC;"
        )

        rs = await db.execute(text(stmt))
        for r in rs:
            key_index = r._key_to_index

            # get data from db
            if sum(prod_qty) != 0:
                percent_defect = round(
                    ((r[key_index["defect_qty"]] / sum(prod_qty)) * 100), 2
                )
            else:
                percent_defect = 0
            list_defect_by_type.append(
                [
                    r[key_index["defective_items"]],
                    r[key_index["defect_qty"]],
                    percent_defect,
                ]
            )
            total = total + r[key_index["defect_qty"]]
            sum_defect_qty = sum_defect_qty + r[key_index["defect_qty"]]

        if sum(prod_qty) == 0:
            total = 0.00
        else:
            total = round(((total / sum(prod_qty)) * 100), 2)

        return total, list_defect_by_type, sum_defect_qty

    async def cause_of_abnormal(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        str_list_line_id = self.get_list_line_id(data["line"])

        month = data["month"]
        line = str(data["line"]).replace("[", "").replace("]", "")
        # shift= data["shift"]
        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        # checl fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_start = datetime.strptime(month + "-01", "%B-%Y-%d")
        d_end = datetime.strptime(month + "-" + str(day_in_month), "%B-%Y-%d")

        # query db
        if data["shift"] != "All":
            where_stmt = (
                "line_id in ("
                + str_list_line_id
                + ") AND date >= '"
                + str(d_start)
                + "' AND date <= '"
                + str(d_end)
                + "' AND shift = '"
                + data["shift"]
                + "' AND status = 'action' "
            )
        else:
            where_stmt = (
                "line_id in ("
                + str_list_line_id
                + ") AND date >= '"
                + str(d_start)
                + "' AND date <= '"
                + str(d_end)
                + "' AND shift in ('A','B') AND status = 'action' "
            )

        stmt = f"SELECT * FROM abnormal_occurrence WHERE {where_stmt if where_stmt is not None else ''} ORDER BY date"
        rs = await db.execute(text(stmt))

        return rs, data

    async def get_defect_qty_pareto_chart(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()
        str_list_line_id = self.get_list_line_id(data["line"])
        month = data["month"]
        line = str(data["line"]).replace("[", "").replace("]", "")
        shift = data["shift"].lower()
        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        # checl fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_start = datetime.strptime(month + "-01", "%B-%Y-%d")
        d_end = datetime.strptime(month + "-" + str(day_in_month), "%B-%Y-%d")
        # query db
        stmt = (
            f"SELECT process,defect_type AS defective_items, SUM(qty_shift_{shift}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type IN ('M/C Set up','Quality Test') AND qty_shift_{shift} NOT IN (0) AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + f"' GROUP BY defect_type,process UNION SELECT process,defective_items, SUM(qty_shift_{shift}) AS defect_qty FROM pchart_defect_record WHERE line_id IN ("
            + str_list_line_id
            + f") AND defect_type NOT IN ('Repeat') AND defective_items NOT IN ('') AND qty_shift_{shift} NOT IN (0) AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            + "' GROUP BY process,defective_items ORDER BY defect_qty DESC;"
        )
        rs = await db.execute(text(stmt))
        return rs

    async def defect_pareto_chart(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        str_list_line_id = self.get_list_line_id(data["line"])

        month = data["month"]
        line = str(data["line"]).replace("[", "").replace("]", "")

        datetime_object = datetime.strptime(month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])
        shift = "'" + data["shift"] + "'" if data["shift"] != "All" else "'A','B'"
        # checl fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        d_start = datetime.strptime(month + "-01", "%B-%Y-%d")
        d_end = datetime.strptime(month + "-" + str(day_in_month), "%B-%Y-%d")

        # query db
        where_stmt = (
            "line_id in ("
            + str_list_line_id
            + ") AND date >= '"
            + str(d_start)
            + "' AND date <= '"
            + str(d_end)
            # + "' AND shift in ('A','B') AND status = 'action' "
            + f"' AND shift in ({shift}) AND status = 'action' "
        )

        stmt = f"SELECT * FROM abnormal_occurrence WHERE {where_stmt if where_stmt is not None else ''} ORDER BY date"
        # print("stmt:", stmt)
        rs = await db.execute(text(stmt))

        return rs, data

    async def get_defect_qty(
        self,
        db: AsyncSession,
        date: str | None = None,
        line: str | None = None,
        part_no: str | None = None,
        sub_line: str | None = None,
        process: str | None = None,
        shift: str | None = None,
    ):
        shift = shift.lower()
        if shift == None:
            shift = "all"
        line_id = self.get_line_id(line)
        # query db
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
            + str(sub_line)
            + "' AND defect_type NOT IN ('Repeat') "
        )

        stmt = f"SELECT sum(qty_shift_{shift}) as defect_qty FROM pchart_defect_record WHERE {where_stmt if where_stmt is not None else ''} "
        # print("stmt:", stmt)
        rs = await db.execute(text(stmt))

        return rs

    async def export_abnormal_occurrence(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        data = where_stmt.dict()

        return data

    async def export_description(self, db: AsyncSession, where_stmt: str | None = None):
        data = where_stmt.dict()

        return data
