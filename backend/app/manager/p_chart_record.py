from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from datetime import datetime, date
from dotenv import load_dotenv
import requests
import json
import math
import time
import os
import pandas as pd
import ast

load_dotenv()

from app.schemas.p_chart_record import (
    Check_Over_UCL_Target,
    General_Information_Result,
    Get_Amount_Action_Record,
    P_Chart_Graph_Result,
    Defect_Graph,
    P_Chart_Record_Table_Result,
    Defect_table,
    Add_New_Record_Result,
    Add_New_Record_View_Result,
    Abnormal_Occurrence_View_Result,
    Abnormal_Occurrence_Edit_View_Result,
    Abnormal_Occurrence_Add_View_Result,
    History_Records,
    History_Records_Result,
    History_Records_Edit,
    Add_New_Record_View_By_Part_Result,
)
from app.functions import get_last_day_from_month_year, parse_defect_string
from app.crud.p_chart_record import P_Chart_Record_CRUD
from app.utils.logger import get_logger

logger = get_logger(__name__)


class P_Chart_Record_Manager:
    def __init__(self):
        self.crud = P_Chart_Record_CRUD()
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")

    async def post_general_information(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data general_information from db
        res, select_target_control, data = await self.crud.general_information(
            db=db, where_stmt=text_data
        )
        ## get data p_chart_record_table_p_bar_last_month from db
        list_p_last_month = await self.crud.p_chart_record_table_p_bar_last_month(
            db=db, where_stmt=text_data
        )

        return_list = []

        try:
            for r in res:
                key_index = r._key_to_index

                return_list.append(
                    General_Information_Result(
                        id=r[key_index["id"]],
                        month=r[key_index["month"]],
                        line_name=data["line_name"],
                        part_no=r[key_index["part_no"]],
                        part_name=r[key_index["part_name"]],
                        process=r[key_index["process"]],
                        shift=r[key_index["shift"]],
                        target_control=select_target_control,
                        p_last_month=list_p_last_month,
                        n_bar=r[key_index["n_bar"]],
                        p_bar=r[key_index["p_bar"]],
                        k=r[key_index["k"]],
                        uclp=r[key_index["uclp"]],
                        lclp=r[key_index["lclp"]],
                    )
                )
            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="General_Information_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_general_information because {e}",
            )

    async def post_p_chart_record_graph(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        pchart_graph = ""

        ## get p_chart_record_graph data from db
        res, data = await self.crud.p_chart_record_graph(db=db, where_stmt=text_data)
        for r in res:
            key_index = r._key_to_index

            ## get data
            pchart_graph = r[key_index["pchart_graph"]]
        # print("pchart_graph:", pchart_graph)
        ## tramsform data for P_Chart_Graph_Result
        defect = pchart_graph[
            pchart_graph.find("defect") + 9 : pchart_graph.find("p_bar") - 4
        ]
        defect = defect.replace(")", "))")
        defect = defect.replace("Defect_Graph", "")
        defect = defect[1:-1].split("),")

        list_defect = []
        # print("defect:", defect)
        for d in defect:
            # print("d1:", d)
            #!! need to fix this method
            # d = d.replace("(", "{")
            # d = d.replace(")", "}")
            # d = d.replace("id=", '"id":')
            # d = d.replace("defect_name=", '"defect_name":')
            # d = d.replace("value=", '"value":')
            # d = d.replace("=", ":")
            # print("d2:", d)
            # dict_defect = json.loads(d)
            dict_defect = parse_defect_string(d)
            list_defect.append(
                Defect_Graph(
                    id=dict_defect["id"],
                    defect_name=dict_defect["defect_name"],
                    value=dict_defect["value"],
                )
            )

        x_axis_label = pchart_graph[
            pchart_graph.find("x_axis_label")
            + 16 : pchart_graph.find("x_axis_value")
            - 4
        ]
        x_axis_label = x_axis_label.split(",")

        x_axis_value = pchart_graph[
            pchart_graph.find("x_axis_value")
            + 16 : pchart_graph.find("x_axis_maxmin")
            - 4
        ]
        x_axis_value = x_axis_value.split(",")
        x_axis_value = list(map(float, x_axis_value))

        x_axis_maxmin = pchart_graph[
            pchart_graph.find("x_axis_maxmin")
            + 17 : pchart_graph.find("y_left_axis")
            - 4
        ]
        x_axis_maxmin = x_axis_maxmin.split(",")
        x_axis_maxmin = list(map(float, x_axis_maxmin))

        y_left_axis = pchart_graph[
            pchart_graph.find("y_left_axis")
            + 15 : pchart_graph.find("y_right_axis")
            - 4
        ]
        y_left_axis = y_left_axis.split(",")
        y_left_axis = list(map(int, y_left_axis))

        y_right_axis = pchart_graph[
            pchart_graph.find("y_right_axis") + 16 : pchart_graph.find("}") - 1
        ]
        y_right_axis = y_right_axis.split(",")
        y_right_axis = list(map(float, y_right_axis))

        p_bar = pchart_graph[
            pchart_graph.find("p_bar") + 9 : pchart_graph.find("percent_defect") - 4
        ]
        if p_bar == "on":
            p_bar = [0.0] * len(x_axis_label)
        else:
            p_bar = p_bar.split(",")
            p_bar = list(map(float, p_bar))

        percent_defect = pchart_graph[
            pchart_graph.find("percent_defect")
            + 18 : pchart_graph.find("ucl_target")
            - 4
        ]
        percent_defect = percent_defect.split(",")
        percent_defect = list(map(float, percent_defect))

        ucl_target = pchart_graph[
            pchart_graph.find("ucl_target") + 14 : pchart_graph.find("x_axis_label") - 4
        ]
        ucl_target = ucl_target.split(",")
        ucl_target = list(map(float, ucl_target))

        now_month = data["month"]
        datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        list_x_axis_label = []
        list_x_axis_value = []

        for i in range(0, day_in_month):
            list_x_axis_label.append(str(i + 1))
            list_x_axis_value.append(i + 1)

        return_list = []

        try:
            return_list.append(
                P_Chart_Graph_Result(
                    month=data["month"],
                    line_name=data["line_name"],
                    part_no=data["part_no"],
                    shift=data["shift"],
                    process=data["process"],
                    defect=list_defect,
                    p_bar=p_bar,
                    percent_defect=percent_defect,
                    ucl_target=ucl_target,
                    x_axis_label=list_x_axis_label,
                    x_axis_value=list_x_axis_value,
                    x_axis_maxmin=x_axis_maxmin,
                    y_left_axis=y_left_axis,
                    y_right_axis=y_right_axis,
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="P_Chart_Graph_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_p_chart_record_graph because {e}",
            )

    async def p_chart_record_table_qty_all_defective_items(
        self, where_stmt: str, data_search: str | None = None, db: AsyncSession = None
    ):
        start_date = data_search["start_date"]
        end_date = data_search["end_date"]
        res = await self.crud.p_chart_record_table_qty_all_defective_items(
            db=db,
            where_stmt=where_stmt,
            data_search={
                "start_date": start_date,
                "end_date": end_date,
            },
        )
        return_list = []
        # try:
        # print("res:", res)
        # if len(res) > 0:
        for r in res:
            # print("r:", r)
            key_index = r._key_to_index

            return_list.append(
                {
                    "date": r[key_index["date"]],
                    "defect_type": r[key_index["defect_type"]],
                    "defective_items": r[key_index["defective_items"]],
                    "qty_shift_all": r[key_index["qty_shift_all"]],
                    "qty_shift_a": r[key_index["qty_shift_a"]],
                    "qty_shift_b": r[key_index["qty_shift_b"]],
                }
            )
        df = pd.DataFrame(return_list)
        if len(return_list) == 0:
            return df
            # raise HTTPException(
            #     status_code=status.HTTP_404_NOT_FOUND,
            #     detail="p_chart_record_table_qty_defective_items not found",
            # )
        # # print("return_list:", return_list)
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
        return df

        # except Exception as e:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail=f"Unable to p_chart_record_table_qty_all_defective_items because {e}",
        #     )

    async def post_p_chart_record_table_All(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        start_time = time.time()
        # print("Start:", start_time)
        data = text_data.dict()
        sub_line = data["sub_line"]
        data_process = data["process"]
        list_line = []
        list_line_id = []
        # # print("1")
        try:
            ## get line, line_id from api
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
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration1: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        # # print("2")
        ## get p_chart_record_table data from db
        res, data = await self.crud.p_chart_record_table(db=db, where_stmt=text_data)

        index_select = list_line.index(data["line_name"])
        select_line_id = list_line_id[index_select]

        current_year = datetime.now().strftime("%Y")
        current_month = datetime.now().strftime("%B-%Y")
        current_month_no = datetime.now().strftime("%m")
        current_day = datetime.now().strftime("%d")
        now_month = data["month"]
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration2: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        # # print("3")
        try:
            # last day of month = 31
            date_prod_qty_obj = datetime.strptime(
                now_month + "-" + str(current_day), "%B-%Y-%d"
            )
        except:
            current_day = str(int(current_day) - 1)
            try:
                # last day of month = 30
                date_prod_qty_obj = datetime.strptime(
                    now_month + "-" + str(current_day), "%B-%Y-%d"
                )
            except:
                current_day = str(int(current_day) - 1)
                try:
                    # last day of month = 29
                    date_prod_qty_obj = datetime.strptime(
                        now_month + "-" + str(current_day), "%B-%Y-%d"
                    )
                except:
                    current_day = str(int(current_day) - 1)
                    try:
                        # last day of month = 28
                        date_prod_qty_obj = datetime.strptime(
                            now_month + "-" + str(current_day), "%B-%Y-%d"
                        )
                    except:
                        pass
        # # print("4")
        date_prod_qty = date_prod_qty_obj.strftime("%Y-%m-%d")

        datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        ## check fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days
        # # print("day_in_month1:", day_in_month)
        list_prod_qty_all = [0] * day_in_month
        list_prod_qty_a = [0] * day_in_month
        list_prod_qty_b = [0] * day_in_month
        list_record_by = [""] * day_in_month
        list_review_by_tl = [""] * day_in_month
        list_review_by_mgr = [""] * day_in_month
        list_review_by_gm = [""] * day_in_month
        res_record_by = await self.crud.get_record_by(db=db, where_stmt=text_data)
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration3: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        for i in range(0, len(res_record_by)):
            c = int(str(res_record_by[i]["date"])[8:10])
            list_record_by[c - 1] = res_record_by[i]["record_by"]

        res_review_by_tl = await self.crud.get_review_by_tl(db=db, where_stmt=text_data)
        # # print("res_review_by_tl:", type(res_review_by_tl))
        for i in range(0, len(res_review_by_tl)):
            c = int(str(res_review_by_tl[i]["date"])[8:10])
            list_review_by_tl[c - 1] = res_review_by_tl[i]["review_by_tl"]

        res_review_by_mgr = await self.crud.get_review_by_mgr(
            db=db, where_stmt=text_data
        )
        for i in range(0, len(res_review_by_mgr)):
            c = int(str(res_review_by_mgr[i]["date"])[8:10])
            list_review_by_mgr[c - 1] = res_review_by_mgr[i]["review_by_mgr"]

        res_review_by_gm = await self.crud.get_review_by_gm(db=db, where_stmt=text_data)
        for i in range(0, len(res_review_by_gm)):
            c = int(str(res_review_by_gm[i]["date"])[8:10])
            list_review_by_gm[c - 1] = res_review_by_gm[i]["review_by_gm"]
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration4: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        try:
            ## get prod_qty shift=All from api
            if data["shift"] == "All":
                if data_process == "Outline":
                    endpoint = (
                        self.BACKEND_URL_SERVICE
                        + "/api/prods/prod_qty?line_id="
                        + str(select_line_id)
                        + "&shift=All&date="
                        + date_prod_qty
                    )
                else:
                    endpoint = (
                        self.BACKEND_URL_SERVICE
                        + "/api/prods/prod_qty?part_line_id="
                        + str(sub_line)
                        + "&shift=All&date="
                        + date_prod_qty
                    )
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["prod_qty"])):
                    c = int(str(response_json["prod_qty"][i]["production_date"])[8:10])
                    list_prod_qty_all[c - 1] = response_json["prod_qty"][i][
                        "actual_val"
                    ]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration5: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        # # print("6")
        if now_month != current_month:

            datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            month_number = int(str(datetime_object)[5:7])
            year = int(str(datetime_object)[:4])

            if year == int(current_year):

                if month_number < int(current_month_no):

                    if month_number != 12:
                        day_in_month = (
                            date(year, month_number + 1, 1)
                            - date(year, month_number, 1)
                        ).days
                    else:
                        day_in_month = (
                            date(year + 1, 1, 1) - date(year, month_number, 1)
                        ).days

                elif month_number > int(current_month_no):
                    day_in_month = 0

            elif year < int(current_year):

                if month_number != 12:
                    day_in_month = (
                        date(year, month_number + 1, 1) - date(year, month_number, 1)
                    ).days
                else:
                    day_in_month = (
                        date(year + 1, 1, 1) - date(year, month_number, 1)
                    ).days

            elif year > int(current_year):
                day_in_month = 0

        else:
            #!fix
            datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            month_number = int(str(datetime_object)[5:7])
            year = int(str(datetime_object)[:4])

            if year == int(current_year):
                # day_in_month = int(current_day)
                day_in_month = (
                    date(year, month_number + 1, 1) - date(year, month_number, 1)
                ).days
            else:
                day_in_month = 0
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration6: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        ### day_in_month graph
        if month_number != 12:
            day_in_month_graph = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month_graph = (
                date(year + 1, 1, 1) - date(year, month_number, 1)
            ).days

        list_defect_type = []
        list_defective_items = []
        list_defect_category = []
        # # print("7")
        for r in res:
            key_index = r._key_to_index

            list_defect_type.append(r[key_index["defect_type"]]),
            list_defective_items.append(r[key_index["defect_mode"]]),
            list_defect_category.append(r[key_index["category"]]),

            if r[key_index["defect_type"]] == "Repeat":
                list_defect_type.append("Repeat NG"),
                list_defective_items.append(r[key_index["defect_mode"]]),
                list_defect_category.append(r[key_index["category"]]),
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration7: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        defect_table_all = []
        defect_table_graph_all = []
        list_value_all = []
        list_value_graph_all = []
        defect_qty_all = [0] * day_in_month
        defect_ratio_all = [0] * day_in_month

        c = 0
        c_id = 0
        c_repeat = list_defect_type.count("Repeat")

        # TODO New
        s_date = datetime.strptime(now_month + "-" + "01", "%B-%Y-%d")
        s_date = str(s_date)[:10]
        e_date = datetime.strptime(now_month + "-" + str(day_in_month), "%B-%Y-%d")
        e_date = str(e_date)[:10]

        df_qty = await self.p_chart_record_table_qty_all_defective_items(
            db=db,
            where_stmt=text_data,
            data_search={"start_date": s_date, "end_date": e_date},
        )
        # TODO New
        # print("df_qty:", df_qty)
        for defect in list_defect_type:

            del list_value_all[:]
            del list_value_graph_all[:]
            list_value_all = [0] * (day_in_month + 1)
            list_value_graph_all = [0] * day_in_month_graph

            s_date = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            s_date = str(s_date)[:10]

            e_date = datetime.strptime(now_month + "-" + str(day_in_month), "%B-%Y-%d")
            e_date = str(e_date)[:10]
            temp_qty = pd.DataFrame()
            if not (df_qty.empty):
                temp_qty = df_qty[
                    (df_qty["defect_type"] == defect)
                    & (df_qty["defective_items"] == list_defective_items[c])
                    # & (df_qty["date"] == s_date)
                ]  # ["qty_shift_all"].reset_index(drop=True)
            # # print("temp_qty:", temp_qty)
            #     if len(temp_qty) > 0:
            #         qty_shift_all = temp_qty[0]
            # else:
            #     qty_shift_all = 0

            # res_qty = await self.crud.p_chart_record_table_qty_defective_items(
            #     db=db,
            #     where_stmt=text_data,
            #     data_search={
            #         "date_start": s_date,
            #         "date_end": e_date,
            #         "defect_type": defect,
            #         "defective_items": list_defective_items[c],
            #     },
            # )

            # for r in res_qty:
            #     key_index = r._key_to_index

            #     d = int(str(r[key_index["date"]])[8:10])
            #     list_value_all[d - 1] = r[key_index["qty_shift_all"]]
            #     list_value_graph_all[d - 1] = r[key_index["qty_shift_all"]]

            #     if defect != "Repeat":

            #         defect_qty_all[d - 1] = (
            #             defect_qty_all[d - 1] + r[key_index["qty_shift_all"]]
            #         )

            for idx, r in temp_qty.iterrows():
                # Extract day as integer from date string ('YYYY-MM-DD')
                d = int(str(r["date"])[8:10])  # Get day as int
                list_value_all[d - 1] = r["qty_shift_all"]
                list_value_graph_all[d - 1] = r["qty_shift_all"]

                if defect != "Repeat":
                    defect_qty_all[d - 1] += r["qty_shift_all"]

            # for d in range(1, day_in_month + 1):
            #     list_value_all[d - 1] = qty_shift_all
            #     list_value_graph_all[d - 1] = qty_shift_all
            #     if defect != "Repeat":
            #         defect_qty_all[d - 1] = defect_qty_all[d - 1] + qty_shift_all

            list_value_all[-1] = sum(list_value_all)

            if defect == "Repeat":
                c_id += 1
                defect_table_all.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_all,
                    )
                )

            elif defect == "Repeat NG":
                defect_table_all.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id + c_repeat,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_all,
                    )
                )
                defect_table_graph_all.append(
                    Defect_Graph(
                        id=c_id,
                        defect_name=list_defective_items[c],
                        value=list_value_graph_all,
                    )
                )

            else:
                c_id += 1
                defect_table_all.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id + c_repeat,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_all,
                    )
                )

                if (defect == "Quality Test") | (defect == "M/C Set up"):
                    defect_table_graph_all.append(
                        Defect_Graph(
                            id=c_id, defect_name=defect, value=list_value_graph_all
                        )
                    )

                else:
                    defect_table_graph_all.append(
                        Defect_Graph(
                            id=c_id,
                            defect_name=list_defective_items[c],
                            value=list_value_graph_all,
                        )
                    )

            c += 1

        else:
            if c == 0:

                list_value_all = [0] * (day_in_month + 1)
                list_value_graph_all = [0] * day_in_month_graph
                list_value_all[-1] = sum(list_value_all)
                defect_table_all.append(
                    Defect_table(
                        defect_type="",
                        id=0,
                        defect_item="",
                        category=[],
                        value=list_value_all,
                    )
                )
                defect_table_graph_all.append(
                    Defect_Graph(id=0, defect_name="", value=list_value_graph_all)
                )
        # # print("8")
        list_index = []
        list_day = []
        # # print("day_in_month:", day_in_month)
        for i in range(0, day_in_month):
            list_index.append(str(i + 1))
            list_day.append(
                datetime.strptime(now_month + "-" + str(i + 1), "%B-%Y-%d").strftime(
                    "%a"
                )
            )

            try:
                if list_prod_qty_all[i] != 0:
                    defect_ratio_all[i] = round(
                        ((defect_qty_all[i] / list_prod_qty_all[i]) * 100), 2
                    )

                    # # print(i, defect_ratio_all[i], defect_qty_all[i], list_prod_qty_all[i])
            except:
                list_prod_qty_all.append(0)
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration8: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        ## graph
        list_x_axis_label = []
        list_x_axis_value = []

        ucl_target_all = [0] * day_in_month_graph
        ucl_target_graph_all = [0] * day_in_month_graph

        ###
        list_p_bar_all = None

        res_p_bar_last_month = (
            await self.crud.p_chart_record_table_p_bar_last_month_All(
                db=db, where_stmt=text_data
            )
        )
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration9: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        for r in res_p_bar_last_month:
            key_index = r._key_to_index

            list_p_bar_all = [r[key_index["p_bar"]]] * day_in_month_graph
        # # print("day_in_month_graph:", day_in_month_graph)
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration10: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        n_amount = 0
        for i in range(0, day_in_month_graph):
            list_x_axis_label.append(str(i + 1))
            list_x_axis_value.append(i + 1)
            if list_prod_qty_all[i] != 0:
                n_amount = n_amount + 1
            # n_bar_all = round((sum(list_prod_qty_all[: i + 1]) / (i + 1)), 2)

            n_bar_all = round(
                (sum(list_prod_qty_all[: i + 1]) / (n_amount if n_amount != 0 else 1)),
                2,
            )
            # # print("day: ", i, " n_bar_all: ", n_bar_all)
            if sum(list_prod_qty_all[: i + 1]) != 0:
                p_bar_all = round(
                    (
                        (sum(defect_qty_all[: i + 1]) / sum(list_prod_qty_all[: i + 1]))
                        * 100
                    ),
                    2,
                )
            else:
                p_bar_all = 0.0

            try:
                if list_prod_qty_all[i] != 0:
                    p_bar_graph_all = round(defect_ratio_all[i], 2)
                else:
                    p_bar_graph_all = 0.0
            except:
                p_bar_graph_all = 0.0
            # # print("9")
            try:
                if n_bar_all != 0:
                    k_all = round(
                        (math.sqrt((100 - p_bar_all) * p_bar_all / n_bar_all)) * 3, 2
                    )
                    k_graph_all = round(
                        (
                            math.sqrt(
                                (100 - list_p_bar_all[i])
                                * list_p_bar_all[i]
                                / list_prod_qty_all[i]
                            )
                        )
                        * 3,
                        2,
                    )
                    # if i == 0:
                    # print("defect_ratio_all[i]:", defect_ratio_all[i])
                    # print("defect_ratio_all[i]:", defect_ratio_all[i])
                else:
                    k_all = 0.0
                    k_graph_all = 0.0
            except:
                k_all = 0.0
                k_graph_all = 0.0
            # # print("p_bar_all:", p_bar_all)
            ucl_target_all[i] = round(p_bar_all + k_all, 2)
            if list_p_bar_all:
                p_bar = list_p_bar_all[0]
            else:
                p_bar = 0
            if list_prod_qty_all[i] != 0:
                ucl_target_graph_all[i] = round(p_bar + k_graph_all, 2)
            else:
                ucl_target_graph_all[i] = 0
            # if i == 0:
            # print("ucl_target_graph_all[i]:", ucl_target_graph_all[i])
            # print("p_bar:", p_bar)
            # print("k_graph_all:", k_graph_all)
            ### record n_bar, p_bar, k, uclp, lclp to db
            # # print("10")
            if i == day_in_month_graph - 1:
                await self.crud.record_data_general_information(
                    db=db,
                    where_stmt=text_data,
                    data_save={
                        "shift": "All",
                        "n_bar": n_bar_all,
                        "p_bar": p_bar_all,
                        "k": k_all,
                        "uclp": ucl_target_all[-1],
                        "lclp": 0,
                    },
                )

                await self.crud.save_pchart_report_graph(
                    db=db,
                    where_stmt=text_data,
                    graph_data={
                        "defect": defect_table_graph_all,
                        "p_bar": list_p_bar_all,
                        "percent_defect": defect_ratio_all,
                        "ucl_target": ucl_target_graph_all,
                        "x_axis_label": list_x_axis_label,
                        "x_axis_value": list_x_axis_value,
                        "x_axis_maxmin": [
                            min(list_x_axis_value),
                            max(list_x_axis_value),
                        ],
                        "y_left_axis": [0, 10, 20, 30, 40, 50],
                        "y_right_axis": [0.00, 1.00, 2.00, 3.00, 4.00, 5.00],
                    },
                )
            # # print("11")
            # # print("list_index:", list_index)
            if sum(list_prod_qty_all) != 0:
                if i == day_in_month_graph - 1:
                    await self.crud.save_pchart_report_table(
                        db=db,
                        where_stmt=text_data,
                        graph_data={
                            "day": list_day,
                            "index": list_index + ["Total"],
                            "prod_qty": list_prod_qty_all + [sum(list_prod_qty_all)],
                            "defect_qty": defect_qty_all + [sum(defect_qty_all)],
                            "defect_ratio": defect_ratio_all
                            + [
                                round(
                                    (
                                        (sum(defect_qty_all) / sum(list_prod_qty_all))
                                        * 100
                                    ),
                                    2,
                                )
                            ],
                            "defect_table": defect_table_all,
                            "record_by": list_record_by,
                            "review_by_tl": list_review_by_tl,
                            "review_by_mgr": list_review_by_mgr,
                            "review_by_gm": list_review_by_gm,
                        },
                    )

                defect_ratio = defect_ratio_all + [
                    round(((sum(defect_qty_all) / sum(list_prod_qty_all)) * 100), 2)
                ]

            else:
                if i == day_in_month_graph - 1:
                    await self.crud.save_pchart_report_table(
                        db=db,
                        where_stmt=text_data,
                        graph_data={
                            "day": list_day,
                            "index": list_index + ["Total"],
                            "prod_qty": list_prod_qty_all + [sum(list_prod_qty_all)],
                            "defect_qty": defect_qty_all + [sum(defect_qty_all)],
                            "defect_ratio": defect_ratio_all + [0.0],
                            "defect_table": defect_table_all,
                            "record_by": list_record_by,
                            "review_by_tl": list_review_by_tl,
                            "review_by_mgr": list_review_by_mgr,
                            "review_by_gm": list_review_by_gm,
                        },
                    )

                defect_ratio = defect_ratio_all + [0.0]
        # # print("12")
        ######
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration11: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        return_list = []

        try:
            return_list.append(
                P_Chart_Record_Table_Result(
                    month=data["month"],
                    line_name=data["line_name"],
                    part_no=data["part_no"],
                    shift="All",
                    process=data["process"],
                    ## table
                    index=list_index + ["Total"],
                    prod_qty=list_prod_qty_all + [sum(list_prod_qty_all)],
                    defect_qty=defect_qty_all + [sum(defect_qty_all)],
                    defect_ratio=defect_ratio,
                    defect_table=defect_table_all,
                    record_by=list_record_by,
                    review_by_tl=list_review_by_tl,
                    review_by_mgr=list_review_by_mgr,
                    review_by_gm=list_review_by_gm,
                    ## graph
                    defect=defect_table_graph_all,
                    p_bar=list_p_bar_all,
                    percent_defect=defect_ratio_all,
                    ucl_target=ucl_target_graph_all,
                    x_axis_label=list_x_axis_label,
                    x_axis_value=list_x_axis_value,
                    x_axis_maxmin=[min(list_x_axis_value), max(list_x_axis_value)],
                    y_left_axis=[0, 10, 20, 30, 40, 50],
                    y_right_axis=[0.00, 1.00, 2.00, 3.00, 4.00, 5.00],
                )
            )

            if len(return_list) == 0:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="P_Chart_Record_Table_Result not found",
                )
            end_time = time.time()
            # print("End:", end_time)
            duration = end_time - start_time
            minutes = int(duration // 60)
            seconds = duration % 60

            # print(f"Duration12: {minutes} min {seconds:.2f} sec")
            start_time = time.time()
            # print("Start:", start_time)
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_p_chart_record_table because {e}",
            )

    async def post_p_chart_record_table_A(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        data = text_data.dict()
        sub_line = data["sub_line"]
        data_process = data["process"]
        list_line = []
        list_line_id = []
        try:
            ## get line, line_id from api
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
        ## get p_chart_record_table data from db
        res, data = await self.crud.p_chart_record_table(db=db, where_stmt=text_data)
        index_select = list_line.index(data["line_name"])
        select_line_id = list_line_id[index_select]
        print("select_line_id:", select_line_id)
        current_year = datetime.now().strftime("%Y")
        current_month = datetime.now().strftime("%B-%Y")
        current_month_no = datetime.now().strftime("%m")
        current_day = datetime.now().strftime("%d")
        now_month = data["month"]

        try:
            # last day of month = 31
            date_prod_qty_obj = datetime.strptime(
                now_month + "-" + str(current_day), "%B-%Y-%d"
            )
        except:
            current_day = str(int(current_day) - 1)
            try:
                # last day of month = 30
                date_prod_qty_obj = datetime.strptime(
                    now_month + "-" + str(current_day), "%B-%Y-%d"
                )
            except:
                current_day = str(int(current_day) - 1)
                try:
                    # last day of month = 29
                    date_prod_qty_obj = datetime.strptime(
                        now_month + "-" + str(current_day), "%B-%Y-%d"
                    )
                except:
                    current_day = str(int(current_day) - 1)
                    try:
                        # last day of month = 28
                        date_prod_qty_obj = datetime.strptime(
                            now_month + "-" + str(current_day), "%B-%Y-%d"
                        )
                    except:
                        pass

        date_prod_qty = date_prod_qty_obj.strftime("%Y-%m-%d")

        datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])
        ## check fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        list_prod_qty_all = [0] * day_in_month
        list_prod_qty_a = [0] * day_in_month
        list_prod_qty_b = [0] * day_in_month
        list_record_by = [""] * day_in_month
        list_review_by_tl = [""] * day_in_month
        list_review_by_mgr = [""] * day_in_month
        list_review_by_gm = [""] * day_in_month
        res_record_by = await self.crud.get_record_by(db=db, where_stmt=text_data)
        for i in range(0, len(res_record_by)):
            c = int(str(res_record_by[i]["date"])[8:10])
            list_record_by[c - 1] = res_record_by[i]["record_by"]

        res_review_by_tl = await self.crud.get_review_by_tl(db=db, where_stmt=text_data)
        for i in range(0, len(res_review_by_tl)):
            c = int(str(res_review_by_tl[i]["date"])[8:10])
            list_review_by_tl[c - 1] = res_review_by_tl[i]["review_by_tl"]
        # # print("list_review_by_tl:", list_review_by_tl)

        res_review_by_mgr = await self.crud.get_review_by_mgr(
            db=db, where_stmt=text_data
        )
        for i in range(0, len(res_review_by_mgr)):
            c = int(str(res_review_by_mgr[i]["date"])[8:10])
            list_review_by_mgr[c - 1] = res_review_by_mgr[i]["review_by_mgr"]

        res_review_by_gm = await self.crud.get_review_by_gm(db=db, where_stmt=text_data)
        for i in range(0, len(res_review_by_gm)):
            c = int(str(res_review_by_gm[i]["date"])[8:10])
            list_review_by_gm[c - 1] = res_review_by_gm[i]["review_by_gm"]
        try:
            ## get prod_qty shift=A from api\
            if data_process == "Outline":
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/prods/prod_qty?line_id="
                    + str(select_line_id)
                    + "&shift=A&date="
                    + date_prod_qty
                )
            else:
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/prods/prod_qty?part_line_id="
                    + str(sub_line)
                    + "&shift=A&date="
                    + date_prod_qty
                )
            response_json = requests.get(endpoint, headers=headers).json()

            for i in range(0, len(response_json["prod_qty"])):
                c = int(str(response_json["prod_qty"][i]["production_date"])[8:10])
                list_prod_qty_a[c - 1] = response_json["prod_qty"][i]["actual_val"]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        if now_month != current_month:

            datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            month_number = int(str(datetime_object)[5:7])
            year = int(str(datetime_object)[:4])

            if year == int(current_year):

                if month_number < int(current_month_no):

                    if month_number != 12:
                        day_in_month = (
                            date(year, month_number + 1, 1)
                            - date(year, month_number, 1)
                        ).days
                    else:
                        day_in_month = (
                            date(year + 1, 1, 1) - date(year, month_number, 1)
                        ).days

                elif month_number > int(current_month_no):
                    day_in_month = 0

            elif year < int(current_year):

                if month_number != 12:
                    day_in_month = (
                        date(year, month_number + 1, 1) - date(year, month_number, 1)
                    ).days
                else:
                    day_in_month = (
                        date(year + 1, 1, 1) - date(year, month_number, 1)
                    ).days

            elif year > int(current_year):
                day_in_month = 0

        else:
            datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            month_number = int(str(datetime_object)[5:7])
            year = int(str(datetime_object)[:4])

            if year == int(current_year):
                # day_in_month = int(current_day)
                day_in_month = (
                    date(year, month_number + 1, 1) - date(year, month_number, 1)
                ).days
            else:
                day_in_month = 0

        ### day_in_month graph
        if month_number != 12:
            day_in_month_graph = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month_graph = (
                date(year + 1, 1, 1) - date(year, month_number, 1)
            ).days

        list_defect_type = []
        list_defective_items = []
        list_defect_category = []
        for r in res:
            key_index = r._key_to_index

            list_defect_type.append(r[key_index["defect_type"]]),
            list_defective_items.append(r[key_index["defect_mode"]]),
            list_defect_category.append(r[key_index["category"]]),

            if r[key_index["defect_type"]] == "Repeat":
                list_defect_type.append("Repeat NG"),
                list_defective_items.append(r[key_index["defect_mode"]]),
                list_defect_category.append(r[key_index["category"]]),

        defect_table_a = []
        defect_table_graph_a = []
        list_value_a = []
        list_value_graph_a = []
        defect_qty_a = [0] * day_in_month
        defect_ratio_a = [0] * day_in_month

        c = 0
        c_id = 0
        c_repeat = list_defect_type.count("Repeat")
        # TODO New
        s_date = datetime.strptime(now_month + "-" + "01", "%B-%Y-%d")
        s_date = str(s_date)[:10]
        e_date = datetime.strptime(now_month + "-" + str(day_in_month), "%B-%Y-%d")
        e_date = str(e_date)[:10]

        df_qty = await self.p_chart_record_table_qty_all_defective_items(
            db=db,
            where_stmt=text_data,
            data_search={"start_date": s_date, "end_date": e_date},
        )
        # TODO New
        for defect in list_defect_type:

            del list_value_a[:]
            del list_value_graph_a[:]
            list_value_a = [0] * (day_in_month + 1)
            list_value_graph_a = [0] * day_in_month_graph

            s_date = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            s_date = str(s_date)[:10]

            e_date = datetime.strptime(now_month + "-" + str(day_in_month), "%B-%Y-%d")
            e_date = str(e_date)[:10]

            temp_qty = pd.DataFrame()
            if not (df_qty.empty):

                temp_qty = df_qty[
                    (df_qty["defect_type"] == defect)
                    & (df_qty["defective_items"] == list_defective_items[c])
                ]
            # res_qty = await self.crud.p_chart_record_table_qty_defective_items(
            #     db=db,
            #     where_stmt=text_data,
            #     data_search={
            #         "date_start": s_date,
            #         "date_end": e_date,
            #         "defect_type": defect,
            #         "defective_items": list_defective_items[c],
            #     },
            # )
            for idx, r in temp_qty.iterrows():
                # Extract day as integer from date string ('YYYY-MM-DD')
                d = int(str(r["date"])[8:10])  # Get day as int
                list_value_a[d - 1] = r["qty_shift_a"]
                list_value_graph_a[d - 1] = r["qty_shift_a"]

                if defect != "Repeat":
                    defect_qty_a[d - 1] += r["qty_shift_a"]

            # for r in res_qty:
            #     key_index = r._key_to_index

            #     d = int(str(r[key_index["date"]])[8:10])
            #     list_value_a[d - 1] = r[key_index["qty_shift_a"]]
            #     list_value_graph_a[d - 1] = r[key_index["qty_shift_a"]]

            #     if defect != "Repeat":
            #         defect_qty_a[d - 1] = (
            #             defect_qty_a[d - 1] + r[key_index["qty_shift_a"]]
            #         )

            list_value_a[-1] = sum(list_value_a)

            if defect == "Repeat":

                c_id += 1
                defect_table_a.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_a,
                    )
                )

            elif defect == "Repeat NG":

                defect_table_a.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id + c_repeat,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_a,
                    )
                )
                defect_table_graph_a.append(
                    Defect_Graph(
                        id=c_id,
                        defect_name=list_defective_items[c],
                        value=list_value_graph_a,
                    )
                )

            else:
                c_id += 1
                defect_table_a.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id + c_repeat,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_a,
                    )
                )

                if (defect == "Quality Test") | (defect == "M/C Set up"):
                    defect_table_graph_a.append(
                        Defect_Graph(
                            id=c_id, defect_name=defect, value=list_value_graph_a
                        )
                    )

                else:
                    defect_table_graph_a.append(
                        Defect_Graph(
                            id=c_id,
                            defect_name=list_defective_items[c],
                            value=list_value_graph_a,
                        )
                    )

            c += 1

        else:
            if c == 0:
                list_value_a = [0] * (day_in_month + 1)
                list_value_graph_a = [0] * day_in_month_graph
                list_value_a[-1] = sum(list_value_a)
                defect_table_a.append(
                    Defect_table(
                        defect_type="",
                        id=0,
                        defect_item="",
                        category=[],
                        value=list_value_a,
                    )
                )
                defect_table_graph_a.append(
                    Defect_Graph(id=0, defect_name="", value=list_value_graph_a)
                )

        list_index = []
        list_day = []
        # print("8")
        for i in range(0, day_in_month):
            list_index.append(str(i + 1))
            list_day.append(
                datetime.strptime(now_month + "-" + str(i + 1), "%B-%Y-%d").strftime(
                    "%a"
                )
            )

            try:
                if list_prod_qty_a[i] != 0:
                    defect_ratio_a[i] = round(
                        ((defect_qty_a[i] / list_prod_qty_a[i]) * 100), 2
                    )
            except:
                list_prod_qty_a.append(0)

        ## graph
        list_x_axis_label = []
        list_x_axis_value = []

        ucl_target_a = [0] * day_in_month_graph
        ucl_target_graph_a = [0] * day_in_month_graph

        ###
        list_p_bar_a = None

        res_p_bar_last_month = (
            await self.crud.p_chart_record_table_p_bar_last_month_All(
                db=db, where_stmt=text_data
            )
        )
        for r in res_p_bar_last_month:
            key_index = r._key_to_index

            list_p_bar_a = [r[key_index["p_bar"]]] * day_in_month_graph
        # # print("list_p_bar_a:", list_p_bar_a)
        n_amount = 0

        # # print("list_record_by:", list_record_by)
        for i in range(0, day_in_month_graph):
            list_x_axis_label.append(str(i + 1))
            list_x_axis_value.append(i + 1)

            if list_prod_qty_a[i] != 0:
                n_amount = n_amount + 1
            ############################################## shift A
            # n_bar_a = round((sum(list_prod_qty_a[: i + 1]) / (i + 1)), 2)
            n_bar_a = round(
                (sum(list_prod_qty_a[: i + 1]) / (n_amount if n_amount != 0 else 1)), 2
            )

            if sum(list_prod_qty_a[: i + 1]) != 0:
                p_bar_a = round(
                    (
                        (sum(defect_qty_a[: i + 1]) / sum(list_prod_qty_a[: i + 1]))
                        * 100
                    ),
                    2,
                )
            else:
                p_bar_a = 0.0

            try:
                if list_prod_qty_a[i] != 0:
                    p_bar_graph_a = round(defect_ratio_a[i], 2)
                else:
                    p_bar_graph_a = 0.0
            except:
                p_bar_graph_a = 0.0

            try:
                if n_bar_a != 0:
                    k_a = round((math.sqrt((100 - p_bar_a) * p_bar_a / n_bar_a)) * 3, 2)
                    k_graph_a = round(
                        (
                            math.sqrt(
                                (100 - list_p_bar_a[i])
                                * list_p_bar_a[i]
                                / list_prod_qty_a[i]
                            )
                        )
                        * 3,
                        2,
                    )
                else:
                    k_a = 0.0
                    k_graph_a = 0.0
            except:
                k_a = 0.0
                k_graph_a = 0.0

            ucl_target_a[i] = round(p_bar_a + k_a, 2)
            if list_p_bar_a:
                p_bar = list_p_bar_a[0]
            else:
                p_bar = 0
            # ucl_target_graph_a[i] = round(p_bar + k_graph_a, 2)
            if list_prod_qty_a[i] != 0:
                ucl_target_graph_a[i] = round(p_bar + k_graph_a, 2)
            else:
                ucl_target_graph_a[i] = 0
            ### record n_bar, p_bar, k, uclp, lclp to db
            if i == day_in_month_graph - 1:
                await self.crud.record_data_general_information(
                    db=db,
                    where_stmt=text_data,
                    data_save={
                        "shift": "A",
                        "n_bar": n_bar_a,
                        "p_bar": p_bar_a,
                        "k": k_a,
                        "uclp": ucl_target_a[-1],
                        "lclp": 0,
                    },
                )

                await self.crud.save_pchart_report_graph(
                    db=db,
                    where_stmt=text_data,
                    graph_data={
                        "defect": defect_table_graph_a,
                        "p_bar": list_p_bar_a,
                        "percent_defect": defect_ratio_a,
                        "ucl_target": ucl_target_graph_a,
                        "x_axis_label": list_x_axis_label,
                        "x_axis_value": list_x_axis_value,
                        "x_axis_maxmin": [
                            min(list_x_axis_value),
                            max(list_x_axis_value),
                        ],
                        "y_left_axis": [0, 10, 20, 30, 40],
                        "y_right_axis": [0.00, 1.00, 2.00, 3.00, 4.00],
                    },
                )

            if sum(list_prod_qty_a) != 0:
                if i == day_in_month_graph - 1:
                    await self.crud.save_pchart_report_table(
                        db=db,
                        where_stmt=text_data,
                        graph_data={
                            "day": list_day,
                            "index": list_index + ["Total"],
                            "prod_qty": list_prod_qty_a + [sum(list_prod_qty_a)],
                            "defect_qty": defect_qty_a + [sum(defect_qty_a)],
                            "defect_ratio": defect_ratio_a
                            + [
                                round(
                                    ((sum(defect_qty_a) / sum(list_prod_qty_a)) * 100),
                                    2,
                                )
                            ],
                            "defect_table": defect_table_a,
                            "record_by": list_record_by,
                            "review_by_tl": list_review_by_tl,
                            "review_by_mgr": list_review_by_mgr,
                            "review_by_gm": list_review_by_gm,
                        },
                    )

                defect_ratio = defect_ratio_a + [
                    round(((sum(defect_qty_a) / sum(list_prod_qty_a)) * 100), 2)
                ]

            else:
                if i == day_in_month_graph - 1:
                    await self.crud.save_pchart_report_table(
                        db=db,
                        where_stmt=text_data,
                        graph_data={
                            "day": list_day,
                            "index": list_index + ["Total"],
                            "prod_qty": list_prod_qty_a + [sum(list_prod_qty_a)],
                            "defect_qty": defect_qty_a + [sum(defect_qty_a)],
                            "defect_ratio": defect_ratio_a + [0.0],
                            "defect_table": defect_table_a,
                            "record_by": list_record_by,
                            "review_by_tl": list_review_by_tl,
                            "review_by_mgr": list_review_by_mgr,
                            "review_by_gm": list_review_by_gm,
                        },
                    )

                defect_ratio = defect_ratio_a + [0.0]

        ######
        # print("9")
        return_list = []

        try:
            return_list.append(
                P_Chart_Record_Table_Result(
                    month=data["month"],
                    line_name=data["line_name"],
                    part_no=data["part_no"],
                    shift="A",
                    process=data["process"],
                    ## table
                    index=list_index + ["Total"],
                    prod_qty=list_prod_qty_a + [sum(list_prod_qty_a)],
                    defect_qty=defect_qty_a + [sum(defect_qty_a)],
                    defect_ratio=defect_ratio,
                    defect_table=defect_table_a,
                    record_by=list_record_by,
                    review_by_tl=list_review_by_tl,
                    review_by_mgr=list_review_by_mgr,
                    review_by_gm=list_review_by_gm,
                    ## graph
                    defect=defect_table_graph_a,
                    p_bar=list_p_bar_a,
                    percent_defect=defect_ratio_a,
                    ucl_target=ucl_target_graph_a,
                    x_axis_label=list_x_axis_label,
                    x_axis_value=list_x_axis_value,
                    x_axis_maxmin=[min(list_x_axis_value), max(list_x_axis_value)],
                    y_left_axis=[0, 10, 20, 30, 40],
                    y_right_axis=[0.00, 1.00, 2.00, 3.00, 4.00],
                )
            )

            if len(return_list) == 0:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="P_Chart_Record_Table_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_p_chart_record_table because {e}",
            )

    async def post_p_chart_record_table_B(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        data = text_data.dict()
        sub_line = data["sub_line"]
        data_process = data["process"]
        list_line = []
        list_line_id = []

        try:
            ## get line, line_id from api
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

        ## get p_chart_record_table data from db
        res, data = await self.crud.p_chart_record_table(db=db, where_stmt=text_data)

        index_select = list_line.index(data["line_name"])
        select_line_id = list_line_id[index_select]

        current_year = datetime.now().strftime("%Y")
        current_month = datetime.now().strftime("%B-%Y")
        current_month_no = datetime.now().strftime("%m")
        current_day = datetime.now().strftime("%d")
        now_month = data["month"]

        try:
            # last day of month = 31
            date_prod_qty_obj = datetime.strptime(
                now_month + "-" + str(current_day), "%B-%Y-%d"
            )
        except:
            current_day = str(int(current_day) - 1)
            try:
                # last day of month = 30
                date_prod_qty_obj = datetime.strptime(
                    now_month + "-" + str(current_day), "%B-%Y-%d"
                )
            except:
                current_day = str(int(current_day) - 1)
                try:
                    # last day of month = 29
                    date_prod_qty_obj = datetime.strptime(
                        now_month + "-" + str(current_day), "%B-%Y-%d"
                    )
                except:
                    current_day = str(int(current_day) - 1)
                    try:
                        # last day of month = 28
                        date_prod_qty_obj = datetime.strptime(
                            now_month + "-" + str(current_day), "%B-%Y-%d"
                        )
                    except:
                        pass

        date_prod_qty = date_prod_qty_obj.strftime("%Y-%m-%d")

        datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
        month_number = int(str(datetime_object)[5:7])
        year = int(str(datetime_object)[:4])

        ## check fiscal year
        if month_number != 12:
            day_in_month = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month = (date(year + 1, 1, 1) - date(year, month_number, 1)).days

        list_prod_qty_all = [0] * day_in_month
        list_prod_qty_a = [0] * day_in_month
        list_prod_qty_b = [0] * day_in_month
        list_record_by = [""] * day_in_month
        list_review_by_tl = [""] * day_in_month
        list_review_by_mgr = [""] * day_in_month
        list_review_by_gm = [""] * day_in_month
        res_record_by = await self.crud.get_record_by(db=db, where_stmt=text_data)
        for i in range(0, len(res_record_by)):
            c = int(str(res_record_by[i]["date"])[8:10])
            list_record_by[c - 1] = res_record_by[i]["record_by"]

        res_review_by_tl = await self.crud.get_review_by_tl(db=db, where_stmt=text_data)
        for i in range(0, len(res_review_by_tl)):
            c = int(str(res_review_by_tl[i]["date"])[8:10])
            list_review_by_tl[c - 1] = res_review_by_tl[i]["review_by_tl"]
        # # print("list_review_by_tl:", list_review_by_tl)
        res_review_by_mgr = await self.crud.get_review_by_mgr(
            db=db, where_stmt=text_data
        )
        for i in range(0, len(res_review_by_mgr)):
            c = int(str(res_review_by_mgr[i]["date"])[8:10])
            list_review_by_mgr[c - 1] = res_review_by_mgr[i]["review_by_mgr"]

        res_review_by_gm = await self.crud.get_review_by_gm(db=db, where_stmt=text_data)
        for i in range(0, len(res_review_by_gm)):
            c = int(str(res_review_by_gm[i]["date"])[8:10])
            list_review_by_gm[c - 1] = res_review_by_gm[i]["review_by_gm"]

        try:
            ## get prod_qty shift=B from api
            if data_process == "Outline":
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/prods/prod_qty?line_id="
                    + str(select_line_id)
                    + "&shift=B&date="
                    + date_prod_qty
                )
            else:
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/prods/prod_qty?part_line_id="
                    + str(sub_line)
                    + "&shift=B&date="
                    + date_prod_qty
                )
            response_json = requests.get(endpoint, headers=headers).json()

            for i in range(0, len(response_json["prod_qty"])):
                c = int(str(response_json["prod_qty"][i]["production_date"])[8:10])
                list_prod_qty_b[c - 1] = response_json["prod_qty"][i]["actual_val"]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        if now_month != current_month:

            datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            month_number = int(str(datetime_object)[5:7])
            year = int(str(datetime_object)[:4])

            if year == int(current_year):

                if month_number < int(current_month_no):

                    if month_number != 12:
                        day_in_month = (
                            date(year, month_number + 1, 1)
                            - date(year, month_number, 1)
                        ).days
                    else:
                        day_in_month = (
                            date(year + 1, 1, 1) - date(year, month_number, 1)
                        ).days

                elif month_number > int(current_month_no):
                    day_in_month = 0

            elif year < int(current_year):

                if month_number != 12:
                    day_in_month = (
                        date(year, month_number + 1, 1) - date(year, month_number, 1)
                    ).days
                else:
                    day_in_month = (
                        date(year + 1, 1, 1) - date(year, month_number, 1)
                    ).days

            elif year > int(current_year):
                day_in_month = 0

        else:
            datetime_object = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            month_number = int(str(datetime_object)[5:7])
            year = int(str(datetime_object)[:4])

            if year == int(current_year):
                # day_in_month = int(current_day)
                day_in_month = (
                    date(year, month_number + 1, 1) - date(year, month_number, 1)
                ).days
            else:
                day_in_month = 0

        ### day_in_month graph
        if month_number != 12:
            day_in_month_graph = (
                date(year, month_number + 1, 1) - date(year, month_number, 1)
            ).days
        else:
            day_in_month_graph = (
                date(year + 1, 1, 1) - date(year, month_number, 1)
            ).days

        list_defect_type = []
        list_defective_items = []
        list_defect_category = []

        for r in res:
            key_index = r._key_to_index

            list_defect_type.append(r[key_index["defect_type"]]),
            list_defective_items.append(r[key_index["defect_mode"]]),
            list_defect_category.append(r[key_index["category"]]),

            if r[key_index["defect_type"]] == "Repeat":
                list_defect_type.append("Repeat NG"),
                list_defective_items.append(r[key_index["defect_mode"]]),
                list_defect_category.append(r[key_index["category"]]),

        defect_table_b = []
        defect_table_graph_b = []
        list_value_b = []
        list_value_graph_b = []
        defect_qty_b = [0] * day_in_month
        defect_ratio_b = [0] * day_in_month

        c = 0
        c_id = 0
        c_repeat = list_defect_type.count("Repeat")

        # TODO New
        s_date = datetime.strptime(now_month + "-" + "01", "%B-%Y-%d")
        s_date = str(s_date)[:10]
        e_date = datetime.strptime(now_month + "-" + str(day_in_month), "%B-%Y-%d")
        e_date = str(e_date)[:10]

        df_qty = await self.p_chart_record_table_qty_all_defective_items(
            db=db,
            where_stmt=text_data,
            data_search={"start_date": s_date, "end_date": e_date},
        )
        # TODO New

        for defect in list_defect_type:

            del list_value_b[:]
            del list_value_graph_b[:]
            list_value_b = [0] * (day_in_month + 1)
            list_value_graph_b = [0] * day_in_month_graph

            s_date = datetime.strptime(now_month + "-01", "%B-%Y-%d")
            s_date = str(s_date)[:10]

            e_date = datetime.strptime(now_month + "-" + str(day_in_month), "%B-%Y-%d")
            e_date = str(e_date)[:10]

            temp_qty = pd.DataFrame()
            if not (df_qty.empty):
                temp_qty = df_qty[
                    (df_qty["defect_type"] == defect)
                    & (df_qty["defective_items"] == list_defective_items[c])
                ]

            # res_qty = await self.crud.p_chart_record_table_qty_defective_items(
            #     db=db,
            #     where_stmt=text_data,
            #     data_search={
            #         "date_start": s_date,
            #         "date_end": e_date,
            #         "defect_type": defect,
            #         "defective_items": list_defective_items[c],
            #     },
            # )

            for idx, r in temp_qty.iterrows():
                # Extract day as integer from date string ('YYYY-MM-DD')
                d = int(str(r["date"])[8:10])  # Get day as int
                list_value_b[d - 1] = r["qty_shift_b"]
                list_value_graph_b[d - 1] = r["qty_shift_b"]

                if defect != "Repeat":
                    defect_qty_b[d - 1] += r["qty_shift_b"]

            # for r in res_qty:
            #     key_index = r._key_to_index

            #     d = int(str(r[key_index["date"]])[8:10])
            #     list_value_b[d - 1] = r[key_index["qty_shift_b"]]
            #     list_value_graph_b[d - 1] = r[key_index["qty_shift_b"]]

            #     if defect != "Repeat":
            #         defect_qty_b[d - 1] = (
            #             defect_qty_b[d - 1] + r[key_index["qty_shift_b"]]
            #         )

            list_value_b[-1] = sum(list_value_b)

            if defect == "Repeat":

                c_id += 1
                defect_table_b.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_b,
                    )
                )

            elif defect == "Repeat NG":

                defect_table_b.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id + c_repeat,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_b,
                    )
                )
                defect_table_graph_b.append(
                    Defect_Graph(
                        id=c_id,
                        defect_name=list_defective_items[c],
                        value=list_value_graph_b,
                    )
                )

            else:
                c_id += 1
                defect_table_b.append(
                    Defect_table(
                        defect_type=defect,
                        id=c_id + c_repeat,
                        defect_item=list_defective_items[c],
                        category=list_defect_category[c],
                        value=list_value_b,
                    )
                )

                if (defect == "Quality Test") | (defect == "M/C Set up"):
                    defect_table_graph_b.append(
                        Defect_Graph(
                            id=c_id, defect_name=defect, value=list_value_graph_b
                        )
                    )
                else:
                    defect_table_graph_b.append(
                        Defect_Graph(
                            id=c_id,
                            defect_name=list_defective_items[c],
                            value=list_value_graph_b,
                        )
                    )

            c += 1

        else:
            if c == 0:
                list_value_b = [0] * (day_in_month + 1)
                list_value_graph_b = [0] * day_in_month_graph
                list_value_b[-1] = sum(list_value_b)
                defect_table_b.append(
                    Defect_table(
                        defect_type="",
                        id=0,
                        defect_item="",
                        category=[],
                        value=list_value_b,
                    )
                )
                defect_table_graph_b.append(
                    Defect_Graph(id=0, defect_name="", value=list_value_graph_b)
                )

        list_index = []
        list_day = []

        for i in range(0, day_in_month):
            list_index.append(str(i + 1))
            list_day.append(
                datetime.strptime(now_month + "-" + str(i + 1), "%B-%Y-%d").strftime(
                    "%a"
                )
            )

            try:
                if list_prod_qty_b[i] != 0:
                    defect_ratio_b[i] = round(
                        ((defect_qty_b[i] / list_prod_qty_b[i]) * 100), 2
                    )
            except:
                list_prod_qty_b.append(0)

        ## graph
        list_x_axis_label = []
        list_x_axis_value = []

        ucl_target_b = [0] * day_in_month_graph
        ucl_target_graph_b = [0] * day_in_month_graph

        ###
        list_p_bar_b = None

        res_p_bar_last_month = (
            await self.crud.p_chart_record_table_p_bar_last_month_All(
                db=db, where_stmt=text_data
            )
        )
        for r in res_p_bar_last_month:
            key_index = r._key_to_index

            list_p_bar_b = [r[key_index["p_bar"]]] * day_in_month_graph

        n_amount = 0
        for i in range(0, day_in_month_graph):
            list_x_axis_label.append(str(i + 1))
            list_x_axis_value.append(i + 1)
            if list_prod_qty_b[i] != 0:
                n_amount = n_amount + 1
            ############################################## shift B
            # n_bar_b = round((sum(list_prod_qty_b[: i + 1]) / (i + 1)), 2)
            n_bar_b = round(
                (sum(list_prod_qty_b[: i + 1]) / (n_amount if n_amount != 0 else 1)), 2
            )

            if sum(list_prod_qty_b[: i + 1]) != 0:
                p_bar_b = round(
                    (
                        (sum(defect_qty_b[: i + 1]) / sum(list_prod_qty_b[: i + 1]))
                        * 100
                    ),
                    2,
                )
            else:
                p_bar_b = 0.0

            try:
                if list_prod_qty_b[i] != 0:
                    p_bar_graph_b = round(defect_ratio_b[i], 2)
                else:
                    p_bar_graph_b = 0.0
            except:
                p_bar_graph_b = 0.0

            try:
                if n_bar_b != 0:
                    k_b = round((math.sqrt((100 - p_bar_b) * p_bar_b / n_bar_b)) * 3, 2)
                    k_graph_b = round(
                        (
                            math.sqrt(
                                (100 - list_p_bar_b[i])
                                * list_p_bar_b[i]
                                / list_prod_qty_b[i]
                            )
                        )
                        * 3,
                        2,
                    )
                else:
                    k_b = 0.0
                    k_graph_b = 0.0
            except:
                k_b = 0.0
                k_graph_b = 0.0

            ucl_target_b[i] = round(p_bar_b + k_b, 2)
            if list_p_bar_b:
                p_bar = list_p_bar_b[0]
            else:
                p_bar = 0
            # ucl_target_graph_b[i] = round(p_bar + k_graph_b, 2)
            if list_prod_qty_b[i] != 0:
                ucl_target_graph_b[i] = round(p_bar + k_graph_b, 2)
            else:
                ucl_target_graph_b[i] = 0
            ### record n_bar, p_bar, k, uclp, lclp to db
            if i == day_in_month_graph - 1:
                await self.crud.record_data_general_information(
                    db=db,
                    where_stmt=text_data,
                    data_save={
                        "shift": "B",
                        "n_bar": n_bar_b,
                        "p_bar": p_bar_b,
                        "k": k_b,
                        "uclp": ucl_target_b[-1],
                        "lclp": 0,
                    },
                )

                await self.crud.save_pchart_report_graph(
                    db=db,
                    where_stmt=text_data,
                    graph_data={
                        "defect": defect_table_graph_b,
                        "p_bar": list_p_bar_b,
                        "percent_defect": defect_ratio_b,
                        "ucl_target": ucl_target_graph_b,
                        "x_axis_label": list_x_axis_label,
                        "x_axis_value": list_x_axis_value,
                        "x_axis_maxmin": [
                            min(list_x_axis_value),
                            max(list_x_axis_value),
                        ],
                        "y_left_axis": [0, 10, 20, 30, 40],
                        "y_right_axis": [0.00, 1.00, 2.00, 3.00, 4.00],
                    },
                )

            if sum(list_prod_qty_b) != 0:
                if i == day_in_month_graph - 1:
                    await self.crud.save_pchart_report_table(
                        db=db,
                        where_stmt=text_data,
                        graph_data={
                            "day": list_day,
                            "index": list_index + ["Total"],
                            "prod_qty": list_prod_qty_b + [sum(list_prod_qty_b)],
                            "defect_qty": defect_qty_b + [sum(defect_qty_b)],
                            "defect_ratio": defect_ratio_b
                            + [
                                round(
                                    ((sum(defect_qty_b) / sum(list_prod_qty_b)) * 100),
                                    2,
                                )
                            ],
                            "defect_table": defect_table_b,
                            "record_by": list_record_by,
                            "review_by_tl": list_review_by_tl,
                            "review_by_mgr": list_review_by_mgr,
                            "review_by_gm": list_review_by_gm,
                        },
                    )

                defect_ratio = defect_ratio_b + [
                    round(((sum(defect_qty_b) / sum(list_prod_qty_b)) * 100), 2)
                ]

            else:
                if i == day_in_month_graph - 1:
                    await self.crud.save_pchart_report_table(
                        db=db,
                        where_stmt=text_data,
                        graph_data={
                            "day": list_day,
                            "index": list_index + ["Total"],
                            "prod_qty": list_prod_qty_b + [sum(list_prod_qty_b)],
                            "defect_qty": defect_qty_b + [sum(defect_qty_b)],
                            "defect_ratio": defect_ratio_b + [0.0],
                            "defect_table": defect_table_b,
                            "record_by": list_record_by,
                            "review_by_tl": list_review_by_tl,
                            "review_by_mgr": list_review_by_mgr,
                            "review_by_gm": list_review_by_gm,
                        },
                    )

                defect_ratio = defect_ratio_b + [0.0]

        ######

        return_list = []

        try:
            return_list.append(
                P_Chart_Record_Table_Result(
                    month=data["month"],
                    line_name=data["line_name"],
                    part_no=data["part_no"],
                    shift="B",
                    process=data["process"],
                    ## table
                    index=list_index + ["Total"],
                    prod_qty=list_prod_qty_b + [sum(list_prod_qty_b)],
                    defect_qty=defect_qty_b + [sum(defect_qty_b)],
                    defect_ratio=defect_ratio,
                    defect_table=defect_table_b,
                    record_by=list_record_by,
                    review_by_tl=list_review_by_tl,
                    review_by_mgr=list_review_by_mgr,
                    review_by_gm=list_review_by_gm,
                    ## graph
                    defect=defect_table_graph_b,
                    p_bar=list_p_bar_b,
                    percent_defect=defect_ratio_b,
                    ucl_target=ucl_target_graph_b,
                    x_axis_label=list_x_axis_label,
                    x_axis_value=list_x_axis_value,
                    x_axis_maxmin=[min(list_x_axis_value), max(list_x_axis_value)],
                    y_left_axis=[0, 10, 20, 30, 40],
                    y_right_axis=[0.00, 1.00, 2.00, 3.00, 4.00],
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="P_Chart_Record_Table_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_p_chart_record_table because {e}",
            )

    async def post_p_chart_record_table(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        if text_data.dict()["shift"] == "All":
            P_Chart_Record_Table_Result = await self.post_p_chart_record_table_All(
                text_data=text_data, db=db
            )
        elif text_data.dict()["shift"] == "A":
            P_Chart_Record_Table_Result = await self.post_p_chart_record_table_A(
                text_data=text_data, db=db
            )
        elif text_data.dict()["shift"] == "B":
            P_Chart_Record_Table_Result = await self.post_p_chart_record_table_B(
                text_data=text_data, db=db
            )

        return P_Chart_Record_Table_Result

    async def post_add_new_record_view(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        list_line = []
        list_line_id = []
        data = text_data.dict()
        data_process = data["process"]
        try:
            ## get line, line_id from api
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

        defect_mode_master = []
        res_defect_mode = await self.crud.add_new_record_view_defect_mode(
            db=db, where_stmt=text_data
        )
        for r in res_defect_mode:
            key_index = r._key_to_index
            defect_mode_master.append(r[key_index["defect_mode"]])

        status_check = True

        ## get new_record_view data from db
        res, data, sum_A, sum_B = await self.crud.add_new_record_view(
            db=db, where_stmt=text_data, defect_mode=defect_mode_master[0]
        )

        for r in res:
            key_index = r._key_to_index

            status_check = False

            ## case old record
            date = str(r[key_index["date"]])
            line_name = data["line_name"]
            defect_type = r[key_index["defect_type"]]
            process = r[key_index["process"]]
            part_no = r[key_index["part_no"]]
            # defect_mode = r[key_index["defective_items"]]
            defect_mode = defect_mode_master[0]
            defect_qty_A = sum_A
            defect_qty_B = sum_B

            if r[key_index["comment_shift_a"]] == None:
                comment_shift_a = ""
            else:
                comment_shift_a = r[key_index["comment_shift_a"]]

            if r[key_index["comment_shift_b"]] == None:
                comment_shift_b = ""
            else:
                comment_shift_b = r[key_index["comment_shift_b"]]

            id = r[key_index["id"]]

        return_list = []

        try:
            if status_check == True:
                ## case new record
                index_select = list_line.index(data["line_name"])
                select_line_id = list_line_id[index_select]
                list_part_no = []
                if data_process and data_process == "Outline":
                    sub_part_result = await self.crud.get_sub_part(
                        db=db, where_stmt=text_data
                    )
                    for r in sub_part_result:
                        key_index = r._key_to_index

                        list_part_no.append(r[key_index["sub_part_no"]])
                else:
                    try:
                        ## get part_no from api
                        endpoint = (
                            self.BACKEND_URL_SERVICE
                            + "/api/settings/parts_by_line?line_id="
                            + str(select_line_id)
                        )
                        response_json = requests.get(endpoint, headers=headers).json()

                        # list_part_no = []

                        for i in range(0, len(response_json["parts"])):
                            list_part_no.append(response_json["parts"][i]["part_no"])

                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"because {e}",
                        )

                return_list.append(
                    Add_New_Record_View_Result(
                        date=str(data["date"]),
                        line_name=list(dict.fromkeys([data["line_name"]] + list_line)),
                        defect_type=data["defect_type"],
                        process=list(
                            dict.fromkeys(
                                [data["process"]] + ["Inline", "Outline", "Inspection"]
                            )
                        ),
                        part_no=list(dict.fromkeys([data["part_no"]] + list_part_no)),
                        defect_mode=defect_mode_master,
                        defect_qty_A=0,
                        defect_qty_B=0,
                        comment_shift_A="",
                        comment_shift_B="",
                    )
                )
            else:
                ## case old record
                index_select = list_line.index(data["line_name"])
                select_line_id = list_line_id[index_select]
                list_part_no = []
                if data_process and data_process == "Outline":
                    sub_part_result = await self.crud.get_sub_part(
                        db=db, where_stmt=text_data
                    )
                    for r in sub_part_result:
                        key_index = r._key_to_index

                        list_part_no.append(r[key_index["sub_part_no"]])
                else:
                    try:
                        ## get part_no from api
                        endpoint = (
                            self.BACKEND_URL_SERVICE
                            + "/api/settings/parts_by_line?line_id="
                            + str(select_line_id)
                        )
                        response_json = requests.get(endpoint, headers=headers).json()

                        for i in range(0, len(response_json["parts"])):
                            list_part_no.append(response_json["parts"][i]["part_no"])

                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"because {e}",
                        )

                return_list.append(
                    Add_New_Record_View_Result(
                        date=date,
                        line_name=list(dict.fromkeys([line_name] + list_line)),
                        defect_type=defect_type,
                        process=list(
                            dict.fromkeys(
                                [process] + ["Inline", "Outline", "Inspection"]
                            )
                        ),
                        part_no=list(dict.fromkeys([part_no] + list_part_no)),
                        defect_mode=defect_mode_master,
                        defect_qty_A=defect_qty_A,
                        defect_qty_B=defect_qty_B,
                        comment_shift_A=comment_shift_a,
                        comment_shift_B=comment_shift_b,
                        id=id,
                    )
                )
            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Add_New_Record_View_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_add_new_record_view because {e}",
            )

    async def post_add_new_record_view_defect_by_part(
        self, text_data: str, db: AsyncSession = None
    ):
        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        data = text_data.dict()
        list_line = []
        list_line_id = []
        try:
            try:
                ## get line, line_id from api
                endpoint = (
                    self.BACKEND_URL_SERVICE + "/api/settings/lines?rx_only=false"
                )
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

            defect_mode_master = []
            res_defect_mode = await self.crud.add_new_record_view_defect_mode_by_part(
                db=db, where_stmt=text_data
            )
            return_list = []
            for r in res_defect_mode:
                key_index = r._key_to_index
                return_list.append(
                    Add_New_Record_View_By_Part_Result(
                        line_name=data["line_name"],
                        part_no=r[key_index["part_no"]],
                        process=r[key_index["process"]],
                        defect_type=r[key_index["defect_type"]],
                        defect_mode=r[key_index["defect_mode"]],
                    )
                )
                if r[key_index["defect_type"]] == "Repeat":
                    return_list.append(
                        Add_New_Record_View_By_Part_Result(
                            line_name=data["line_name"],
                            part_no=r[key_index["part_no"]],
                            process=r[key_index["process"]],
                            defect_type="Repeat NG",
                            defect_mode=r[key_index["defect_mode"]],
                        )
                    )
                # defect_mode_master.append(r[key_index["defect_mode"]])

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Add_New_Record_Vie_By_Part_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_add_new_record_view_by_part because {e}",
            )

    async def post_change_new_record_view(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        list_line = []
        list_line_id = []
        data = text_data.dict()
        data_process = data["process"]
        try:
            ## get line, line_id from api
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

        status_check = True

        res, data, sum_A, sum_B = await self.crud.change_new_record_view(
            db=db, where_stmt=text_data
        )
        defect_type = data["defect_type"]
        for r in res:
            key_index = r._key_to_index

            status_check = False
            ## case old record
            date = str(r[key_index["date"]])
            line_name = data["line_name"]
            defect_type = r[key_index["defect_type"]]
            process = r[key_index["process"]]
            part_no = r[key_index["part_no"]]
            defect_mode = data["defect_mode"]
            # defect_mode = r[key_index["defective_items"]]
            defect_qty_A = sum_A
            defect_qty_B = sum_B

            if r[key_index["comment_shift_a"]] == None:
                comment_shift_a = ""
            else:
                comment_shift_a = r[key_index["comment_shift_a"]]

            if r[key_index["comment_shift_b"]] == None:
                comment_shift_b = ""
            else:
                comment_shift_b = r[key_index["comment_shift_b"]]

            id = r[key_index["id"]]

        return_list = []

        defect_mode_master = []
        res_defect_mode = await self.crud.add_new_record_view_defect_mode(
            db=db, where_stmt=text_data
        )
        for r in res_defect_mode:

            key_index = r._key_to_index

            if (defect_type == "M/C Set up") | (defect_type == "Quality Test"):
                defect_mode_master.append("-")
            else:
                defect_mode_master.append(r[key_index["defect_mode"]])

        try:
            if status_check == True:
                ## case new record
                index_select = list_line.index(data["line_name"])
                select_line_id = list_line_id[index_select]
                list_part_no = []
                if data_process and data_process == "Outline":
                    sub_part_result = await self.crud.get_sub_part(
                        db=db, where_stmt=text_data
                    )
                    for r in sub_part_result:
                        key_index = r._key_to_index

                        list_part_no.append(r[key_index["sub_part_no"]])
                else:
                    try:
                        endpoint = (
                            self.BACKEND_URL_SERVICE
                            + "/api/settings/parts_by_line?line_id="
                            + str(select_line_id)
                        )
                        response_json = requests.get(endpoint, headers=headers).json()

                        for i in range(0, len(response_json["parts"])):
                            list_part_no.append(response_json["parts"][i]["part_no"])

                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"because {e}",
                        )

                return_list.append(
                    Add_New_Record_View_Result(
                        date=str(data["date"]),
                        line_name=list(dict.fromkeys([data["line_name"]] + list_line)),
                        defect_type=data["defect_type"],
                        process=list(
                            dict.fromkeys(
                                [data["process"]] + ["Inline", "Outline", "Inspection"]
                            )
                        ),
                        part_no=list(dict.fromkeys([data["part_no"]] + list_part_no)),
                        defect_mode=defect_mode_master,
                        defect_qty_A=0,
                        defect_qty_B=0,
                        comment_shift_A="",
                        comment_shift_B="",
                    )
                )
            else:
                ## case old record
                index_select = list_line.index(data["line_name"])
                select_line_id = list_line_id[index_select]
                list_part_no = []
                if data_process and data_process == "Outline":
                    sub_part_result = await self.crud.get_sub_part(
                        db=db, where_stmt=text_data
                    )
                    for r in sub_part_result:
                        key_index = r._key_to_index

                        list_part_no.append(r[key_index["sub_part_no"]])
                else:
                    try:
                        endpoint = (
                            self.BACKEND_URL_SERVICE
                            + "/api/settings/parts_by_line?line_id="
                            + str(select_line_id)
                        )
                        response_json = requests.get(endpoint, headers=headers).json()

                        for i in range(0, len(response_json["parts"])):
                            list_part_no.append(response_json["parts"][i]["part_no"])

                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"because {e}",
                        )

                return_list.append(
                    Add_New_Record_View_Result(
                        date=date,
                        line_name=list(dict.fromkeys([data["line_name"]] + list_line)),
                        defect_type=defect_type,
                        process=list(
                            dict.fromkeys(
                                [process] + ["Inline", "Outline", "Inspection"]
                            )
                        ),
                        part_no=list(dict.fromkeys([part_no] + list_part_no)),
                        defect_mode=defect_mode_master,
                        defect_qty_A=defect_qty_A,
                        defect_qty_B=defect_qty_B,
                        comment_shift_A=comment_shift_a,
                        comment_shift_B=comment_shift_b,
                        id=id,
                    )
                )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Add_New_Record_View_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_change_new_record_view because {e}",
            )

    async def post_add_new_record_save(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        # print("text_data:", text_data)
        ## get new_record_save data from db
        res, qty_shift_a, qty_shift_b = await self.crud.add_new_record_save(
            db=db, where_stmt=text_data
        )
        return_list = []

        try:
            return_list.append(
                Add_New_Record_Result(
                    date=res["date"],
                    line_name=res["line_name"],
                    defect_type=res["defect_type"],
                    process=res["process"],
                    part_no=res["part_no"],
                    defective_items=res["defective_items"],
                    defect_qty_A=qty_shift_a,
                    defect_qty_B=qty_shift_b,
                    pic=res["pic"],
                    comment=res["comment"],
                    creator=res["creator"],
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Add_New_Record_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_add_new_record_save because {e}",
            )

    async def post_abnormal_occurrence_view(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get abnormal_occurrence data from db
        res, data = await self.crud.abnormal_occurrence_view(
            db=db, where_stmt=text_data
        )
        return_list = []

        try:
            c = 0
            for r in res:
                c += 1
                key_index = r._key_to_index

                return_list.append(
                    Abnormal_Occurrence_View_Result(
                        no=c,
                        month=str(r[key_index["date"]])[:-3],
                        line_name=data["line_name"],
                        part_no=r[key_index["part_no"]],
                        shift=r[key_index["shift"]],
                        defect_item=r[key_index["defect_item"]],
                        category=r[key_index["defect_category"]],
                        process=r[key_index["process"]],
                        date=str(r[key_index["date"]]),
                        trouble=r[key_index["trouble"]],
                        action=r[key_index["action"]],
                        in_change=r[key_index["in_change"]],
                        manager=r[key_index["manager"]],
                        detect_by=r[key_index["detect_by"]],
                        defect_detail=r[key_index["defect_detail"]],
                        rank=r[key_index["rank"]],
                        root_cause_process=r[key_index["root_cause_process"]],
                        process_name_supplier_name=r[
                            key_index["process_supplier_name"]
                        ],
                        cause=r[key_index["cause"]],
                        new_re_occur=r[key_index["new_re_occur"]],
                        id=r[key_index["id"]],
                    )
                )

            if len(return_list) == 0:
                return_list.append(
                    Abnormal_Occurrence_View_Result(
                        no=None,
                        month=None,
                        line_name=None,
                        part_no=None,
                        shift=None,
                        process=None,
                        date=None,
                        trouble=None,
                        action=None,
                        in_change=None,
                        manager=None,
                        detect_by=None,
                        defect_detail=None,
                        rank=None,
                        root_cause_process=None,
                        process_name_supplier_name=None,
                        cause=None,
                        new_re_occur=None,
                        id=None,
                    )
                )

            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_abnormal_occurrence_view because {e}",
            )

    async def post_abnormal_occurrence_edit_view(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get abnormal_occurrence_edit data from db
        res = await self.crud.abnormal_occurrence_edit_view(db=db, where_stmt=text_data)
        return_list = []

        try:
            for r in res:

                key_index = r._key_to_index

                return_list.append(
                    Abnormal_Occurrence_Edit_View_Result(
                        date=str(r[key_index["date"]]),
                        line_name=r[key_index["line_name"]],
                        part_no=r[key_index["part_no"]],
                        shift=r[key_index["shift"]],
                        process=r[key_index["process"]],
                        trouble=r[key_index["trouble"]],
                        action=r[key_index["action"]],
                        in_change=r[key_index["in_change"]],
                        manager=r[key_index["manager"]],
                        detect_by=r[key_index["detect_by"]],
                        defect_detail=r[key_index["defect_detail"]],
                        rank=[r[key_index["rank"]]] + ["A", "B", "C"],
                        root_cause_process=r[key_index["root_cause_process"]],
                        process_name_supplier_name=r[
                            key_index["process_supplier_name"]
                        ],
                        cause=r[key_index["cause"]],
                        new_re_occur=r[key_index["new_re_occur"]],
                        id=r[key_index["id"]],
                    )
                )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Abnormal_Occurrence_Edit_View_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_abnormal_occurrence_edit_view because {e}",
            )

    async def post_abnormal_occurrence_edit_save(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get abnormal_occurrence_edit data from db
        res = await self.crud.abnormal_occurrence_edit_save(db=db, where_stmt=text_data)
        return_list = []

        try:
            if True:
                return_list.append(
                    Abnormal_Occurrence_View_Result(
                        date=res["date"],
                        trouble=res["trouble"],
                        action=res["action"],
                        in_change=res["in_change"],
                        manager=res["manager"],
                        detect_by=res["detect_by"],
                        defect_detail=res["defect_detail"],
                        rank=res["rank"],
                        root_cause_process=res["root_cause_process"],
                        process_name_supplier_name=res["process_name_supplier_name"],
                        cause=res["cause"],
                        new_re_occur=res["new_re_occur"],
                        id=res["id"],
                        creator=res["creator"],
                    )
                )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Abnormal_Occurrence_View_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_abnormal_occurrence_edit_save because {e}",
            )

    async def post_abnormal_occurrence_delete(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get abnormal_occurrence_delete data from db
        res, data = await self.crud.abnormal_occurrence_delete(
            db=db, where_stmt=text_data
        )
        return_list = []

        try:
            for r in res:

                key_index = r._key_to_index

                return_list.append(
                    Abnormal_Occurrence_View_Result(
                        no=1,
                        month=str(r[key_index["date"]])[:-3],
                        line_name=data["line_name"],
                        part_no=r[key_index["part_no"]],
                        shift=r[key_index["shift"]],
                        process=r[key_index["process"]],
                        date=str(r[key_index["date"]]),
                        trouble=r[key_index["trouble"]],
                        action=r[key_index["action"]],
                        in_change=r[key_index["in_change"]],
                        manager=r[key_index["manager"]],
                        detect_by=r[key_index["detect_by"]],
                        defect_detail=r[key_index["defect_detail"]],
                        rank=r[key_index["rank"]],
                        root_cause_process=r[key_index["root_cause_process"]],
                        process_name_supplier_name=r[
                            key_index["process_supplier_name"]
                        ],
                        cause=r[key_index["cause"]],
                        new_re_occur=r[key_index["new_re_occur"]],
                        id=r[key_index["id"]],
                    )
                )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Abnormal_Occurrence_View_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_abnormal_occurrence_delete because {e}",
            )

    async def post_abnormal_occurrence_add_row_view(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get abnormal_occurrence data from db
        res = await self.crud.abnormal_occurrence_add_row_view(
            db=db, where_stmt=text_data
        )
        return_list = []

        date = datetime.today().strftime("%Y-%m-%d")

        try:
            return_list.append(
                Abnormal_Occurrence_Add_View_Result(
                    month=res["month"],
                    date=date,
                    line_name=res["line_name"],
                    part_no=res["part_no"],
                    shift=res["shift"],
                    process=res["process"],
                    rank=["B", "A", "C"],
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Abnormal_Occurrence_Add_View_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_abnormal_occurrence_add_row_view because {e}",
            )

    async def post_abnormal_occurrence_add_row_ok(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get abnormal_occurrence data from db
        res = await self.crud.abnormal_occurrence_add_row_ok(
            db=db, where_stmt=text_data
        )
        return_list = []

        try:
            return_list.append(
                Abnormal_Occurrence_View_Result(
                    month=res["month"],
                    line_name=res["line_name"],
                    part_no=res["part_no"],
                    shift=res["shift"],
                    defect_item=res["defect_item"],
                    category=res["category"],
                    process=res["process"],
                    date=res["date"],
                    trouble=res["trouble"],
                    action=res["action"],
                    in_change=res["in_change"],
                    manager=res["manager"],
                    detect_by=res["detect_by"],
                    defect_detail=res["defect_detail"],
                    rank=res["rank"],
                    root_cause_process=res["root_cause_process"],
                    process_name_supplier_name=res["process_name_supplier_name"],
                    cause=res["cause"],
                    new_re_occur=res["new_re_occur"],
                    id=res["id"],
                    creator=res["creator"],
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Abnormal_Occurrence_View_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_abnormal_occurrence_add_row_ok because {e}",
            )

    async def post_history_records_view(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get history_records data from db
        res, data = await self.crud.history_records_view(db=db, where_stmt=text_data)

        list_history_records_result = []
        c = 1
        for r in res:
            key_index = r._key_to_index

            list_history_records_result.append(
                History_Records(
                    no=c,
                    date=str(r[key_index["date"]]),
                    shift=r[key_index["shift"]],
                    line=data["line_name"],
                    part_no=r[key_index["part_no"]],
                    sub_line=data["sub_line"],
                    process=r[key_index["process"]],
                    defect_type=r[key_index["defect_type"]],
                    # defect_mode = r[key_index["defective_items"]],
                    defect_mode=r[key_index["defect_mode"]],
                    category=r[key_index["category"]],
                    qty=r[key_index["qty"]],
                    pic=r[key_index["pic"]],
                    id=r[key_index["id"]],
                    creator=r[key_index["creator"]],
                )
            )
            c += 1
        # print("list_history_records_result:", list_history_records_result)
        return_list = []

        try:
            return_list.append(
                History_Records_Result(
                    month=data["month"],
                    line_name=data["line_name"],
                    part_no=data["part_no"],
                    shift=data["shift"],
                    process=data["process"],
                    sub_line=data["sub_line"],
                    history_records_result=list_history_records_result,
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="History_Records_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_history_records_view because {e}",
            )

    async def post_history_records_edit_view(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        list_line = []
        list_line_id = []

        try:
            ## get line, line_id from db
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

        select_qty = 0
        select_id = 0

        ## get history_records data from db
        res, data = await self.crud.history_records_edit_view(
            db=db, where_stmt=text_data
        )
        for r in res:
            key_index = r._key_to_index

            select_qty = r[key_index["qty"]]
            select_id = r[key_index["id"]]

        index_select = list_line.index(data["line"])
        select_line_id = list_line_id[index_select]

        list_part_no = []

        try:
            ## get part_no from db
            endpoint = (
                self.BACKEND_URL_SERVICE
                + "/api/settings/parts_by_line?line_id="
                + str(select_line_id)
            )
            response_json = requests.get(endpoint, headers=headers).json()

            for i in range(0, len(response_json["parts"])):
                list_part_no.append(response_json["parts"][i]["part_no"])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        ## get defect_mode data from db
        list_defect_mode = await self.crud.history_records_get_defect_mode(
            db=db, where_stmt=text_data
        )

        return_list = []

        try:
            return_list.append(
                History_Records_Edit(
                    no=data["no"],
                    date=data["date"],
                    shift=list(dict.fromkeys([data["shift"]] + ["A", "B"])),
                    line=list(dict.fromkeys([data["line"]] + list_line)),
                    part_no=list(dict.fromkeys([data["part_no"]] + list_part_no)),
                    process=list(
                        dict.fromkeys(
                            [data["process"]] + ["Inline", "Outline", "Inspection"]
                        )
                    ),
                    defect_type=list(
                        dict.fromkeys(
                            [data["defect_type"]]
                            + [
                                "Repeat",
                                "Scrap",
                                "M/C Set up",
                                "Quality Test",
                                "Appearance",
                                "Dimension",
                                "Performance",
                                "Other",
                            ]
                        )
                    ),
                    defect_mode=list(
                        dict.fromkeys([data["defect_mode"]] + list_defect_mode)
                    ),
                    qty=select_qty,
                    id=select_id,
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="History_Records_Edit not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_history_records_edit_view because {e}",
            )

    async def post_history_records_edit_view_change(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        list_line = []
        list_line_id = []

        try:
            ## get line, line_id from db
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
        select_qty = 0
        select_id = 0

        ## get history_records data from db
        res, data = await self.crud.history_records_edit_view(
            db=db, where_stmt=text_data
        )
        for r in res:
            key_index = r._key_to_index

            select_qty = r[key_index["qty"]]
            select_id = r[key_index["id"]]

        index_select = list_line.index(data["line"])
        select_line_id = list_line_id[index_select]

        list_part_no = []

        try:
            ## get part_no from db
            endpoint = (
                self.BACKEND_URL_SERVICE
                + "/api/settings/parts_by_line?line_id="
                + str(select_line_id)
            )
            response_json = requests.get(endpoint, headers=headers).json()

            for i in range(0, len(response_json["parts"])):
                list_part_no.append(response_json["parts"][i]["part_no"])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        ## get defect_mode data from db
        list_defect_mode = await self.crud.history_records_get_defect_mode(
            db=db, where_stmt=text_data
        )

        return_list = []

        try:
            return_list.append(
                History_Records_Edit(
                    no=data["no"],
                    date=data["date"],
                    shift=list(dict.fromkeys([data["shift"]] + ["A", "B"])),
                    line=list(dict.fromkeys([data["line"]] + list_line)),
                    part_no=list(dict.fromkeys([data["part_no"]] + list_part_no)),
                    process=list(
                        dict.fromkeys(
                            [data["process"]] + ["Inline", "Outline", "Inspection"]
                        )
                    ),
                    defect_type=list(
                        dict.fromkeys(
                            [data["defect_type"]]
                            + [
                                "Repeat",
                                "Scrap",
                                "M/C Set up",
                                "Quality Test",
                                "Appearance",
                                "Dimension",
                                "Performance",
                                "Other",
                            ]
                        )
                    ),
                    defect_mode=list(
                        dict.fromkeys([data["defect_mode"]] + list_defect_mode)
                    ),
                    qty=select_qty,
                    id=select_id,
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="History_Records_Edit not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_history_records_edit_view_change because {e}",
            )

    async def post_history_records_edit_save(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get history_records data from db
        data = await self.crud.history_records_edit_save(db=db, where_stmt=text_data)
        return_list = []

        ## get history_records data from db
        res = await self.crud.history_records_view_edit_save(
            db=db, where_stmt=text_data
        )

        list_history_records_result = []
        c = 1
        for r in res:
            key_index = r._key_to_index

            if c == data["no"]:
                list_history_records_result.append(
                    History_Records(
                        no=c,
                        date=data["date"],
                        shift=data["shift"],
                        line=data["line"],
                        part_no=data["part_no"],
                        process=data["process"],
                        defect_type=data["defect_type"],
                        defect_mode=data["defect_mode"],
                        qty=data["qty"],
                        id=data["id"],
                        creator=data["creator"],
                    )
                )
            else:
                list_history_records_result.append(
                    History_Records(
                        no=c,
                        date=str(r[key_index["date"]]),
                        shift=r[key_index["shift"]],
                        line=data["line"],
                        part_no=r[key_index["part_no"]],
                        process=r[key_index["process"]],
                        defect_type=r[key_index["defect_type"]],
                        defect_mode=data["defect_mode"],
                        # defect_mode = r[key_index["defective_items"]],
                        qty=r[key_index["qty"]],
                        id=r[key_index["id"]],
                        creator=r[key_index["creator"]],
                    )
                )
            c += 1

        return_list = []

        datetime_object = datetime.strptime(data["date"][0:7] + "-01", "%Y-%m-%d")
        month = datetime_object.strftime("%B-%Y")
        try:
            return_list.append(
                History_Records_Result(
                    month=month,
                    line_name=data["line"],
                    part_no=data["part_no"],
                    shift=data["shift"],
                    process=data["process"],
                    history_records_result=list_history_records_result,
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="History_Records not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_history_records_edit_save because {e}",
            )

    async def post_history_records_delete(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get history_records data from db
        res = await self.crud.history_records_delete(db=db, where_stmt=text_data)
        return_list = []

        try:
            return_list.append(
                History_Records(
                    no=res["no"],
                    date=res["date"],
                    shift=res["shift"],
                    line=res["line"],
                    part_no=res["part_no"],
                    process=res["process"],
                    defect_type=res["defect_type"],
                    defect_mode=res["defect_mode"],
                    qty=res["qty"],
                    id=res["id"],
                    creator=res["creator"],
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="History_Records not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_history_records_delete because {e}",
            )

    async def check_over_ucl_target(self, text_data: str, db: AsyncSession = None):
        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        data = text_data.dict()
        sub_line = data["sub_line"]
        headers = {"X-API-Key": self.BACKEND_API_SERVICE}
        data = text_data.dict()
        date_prod_qty = data["date"]
        line = data["line_name"]
        if data["defect_type"] != "Repeat":
            defect_qty = data["defect_qty"]
        else:
            defect_qty = 0
        shift = data["shift"]
        line_id = self.crud.get_line_id(line)
        endpoint = (
            self.BACKEND_URL_SERVICE
            + "/api/prods/prod_qty?part_line_id="
            + str(sub_line)
            + f"&shift={shift}&date="
            + date_prod_qty
        )
        response_json = requests.get(endpoint, headers=headers).json()
        datas = response_json["prod_qty"]
        date_obj = datetime.strptime(date_prod_qty, "%Y-%m-%d")
        datetime_string = date_obj.strftime("%Y-%m-%d %H:%M:%S")
        prod_actual_date = [
            data for data in datas if data["production_date"] == datetime_string
        ]
        # print("prod_actual_date:", prod_actual_date)
        if len(prod_actual_date) > 0:
            prod_actual_date = prod_actual_date[0]["actual_val"]
        else:
            prod_actual_date = 0
        ## get history_records data from db
        res = await self.crud.get_defect_qty_by_date(db=db, where_stmt=text_data)
        defect_qty = defect_qty + res["defect_qty"]
        # defect_ratio = round(((defect_qty / list_prod_qty) * 100), 2)
        res_p_bar_last_month = (
            await self.crud.p_chart_record_table_p_bar_last_month_All(
                db=db, where_stmt=text_data
            )
        )
        p_bar = 0
        for r in res_p_bar_last_month:
            key_index = r._key_to_index
            p_bar = r[key_index["p_bar"]]
        # return_list = []
        if prod_actual_date == 0:
            prod_actual_date = 1
        k = round((math.sqrt((100 - p_bar) * p_bar / prod_actual_date)) * 3, 2)
        ucl_target = round(p_bar + k, 2)
        defect_ratio = defect_qty / prod_actual_date * 100
        if ucl_target < defect_ratio and ucl_target != 0:
            # if ucl_target < defect_ratio:
            is_over = True
        else:
            is_over = False
        # print("defect_qty:", defect_qty)
        # print("prod_actual_date:", prod_actual_date)
        # print("ucl_target:", ucl_target)
        # print("defect_ratio:", defect_ratio)
        try:
            return_list = Check_Over_UCL_Target(
                month=data["month"],
                line_name=data["line_name"],
                part_no=res["part_no"],
                process=res["process"],
                date=res["date"],
                shift=data["shift"],
                defect_qty=defect_qty,
                ucl_target=ucl_target,
                defect_ratio=defect_ratio,
                is_over=is_over,
            )

            # if len(return_list) == 0:
            #     raise HTTPException(
            #         status_code=status.HTTP_404_NOT_FOUND,
            #         detail="Check_Over_UCL_Target not found",
            #     )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to check_over_ucl_target because {e}",
            )

    async def get_amount_action_record(self, text_data: str, db: AsyncSession = None):
        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        res = await self.crud.get_amount_action_record(db=db, where_stmt=text_data)

        try:
            return_list = Get_Amount_Action_Record(
                month=res["month"],
                line_name=res["line_name"],
                part_no=res["part_no"],
                process=res["process"],
                date=res["date"],
                shift=res["shift"],
                amount_action_record=res["amount_action_record"],
            )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to get_amount_action_record because {e}",
            )
