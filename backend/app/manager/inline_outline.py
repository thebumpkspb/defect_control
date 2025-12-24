from fastapi import HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from fastapi.responses import StreamingResponse
from datetime import datetime
from dotenv import load_dotenv
import requests
import json
import pandas as pd
import time
import os
import calendar
import math
from typing import List

# import urllib.parse
from urllib.parse import urljoin, quote
from fastapi.responses import Response
from io import BytesIO
import codecs  # เพิ่มการนำเข้า codecs
from app.functions import (
    convert_month_year_to_date,
)
from app.functions import (
    get_last_day_from_month_year,
    parse_defect_string,
    get_first_and_last_date_of_month,
)

load_dotenv()

from app.schemas.inline_outline import (
    Department_Section_Result,
    Default_Defect_Summary_Result,
    Defect_Summary_Result,
    Cause_Of_Abnormal_Result,
    Defect_Pareto_Chart_Result,
    Export_Description_Result,
    Yearly_Defect_Summary,
    Yearly_Defect_Process_Summary,
    Defect_Qty_Detail,
    Monthly_Defect_Summary,
    Monthly_Defect_Process_Summary,
    Daily_Defect_Summary,
    Daily_Defect_Process_Summary,
    Defect_Summary_By_Type,
    Defect_Summary_Process_By_Type,
    Defect_By_Type,
    Abnormal_Occurrence_Table,
    Defect_Pareto_Chart,
    Defect_Pareto_Chart_Process,
    Description_Of_Defect,
    General_Information,
    General_Information_Result,
)

from app.crud.inline_outline import Inline_Outline_CRUD
from app.utils.logger import get_logger
from app.manager import P_Chart_Record_Manager

# from app.schemas.p_chart_record import General_Information, General_Information_Result

logger = get_logger(__name__)


class Inline_Outline_Manager:
    def __init__(self):
        self.crud = Inline_Outline_CRUD()
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")
        # self.p_chart_record_manager = P_Chart_Record_Manager()

    async def get_default_defect_summary(self):

        current_month = datetime.now().strftime("%B-%Y")
        current_year = int(datetime.now().strftime("%Y"))

        year = int(datetime.now().strftime("%y"))
        month = datetime.now().strftime("%b")

        ## set fiscal year
        if month in ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]:
            axis_x = [
                "Apr'" + str(year),
                "May'" + str(year),
                "Jun'" + str(year),
                "Jul'" + str(year),
                "Aug'" + str(year),
                "Sep'" + str(year),
                "Oct'" + str(year),
                "Nov'" + str(year),
                "Dec'" + str(year),
                "Jan'" + str(year + 1),
                "Feb'" + str(year + 1),
                "Mar'" + str(year + 1),
            ]
        else:
            axis_x = [
                "Apr'" + str(year - 1),
                "May'" + str(year - 1),
                "Jun'" + str(year - 1),
                "Jul'" + str(year - 1),
                "Aug'" + str(year - 1),
                "Sep'" + str(year - 1),
                "Oct'" + str(year - 1),
                "Nov'" + str(year - 1),
                "Dec'" + str(year - 1),
                "Jan'" + str(year),
                "Feb'" + str(year),
                "Mar'" + str(year),
            ]

        list_department = []

        try:
            ## get department from api
            endpoint = (
                self.BACKEND_URL_SERVICE
                + "/api/settings/organize_level?org_level=department"
            )
            headers = {"X-API-Key": self.BACKEND_API_SERVICE}
            response_json = requests.get(endpoint, headers=headers).json()

            for i in range(0, len(response_json["data"])):
                if (
                    response_json["data"][i]["group_type"] == "DIR"
                    or response_json["data"][i]["group_type"] == None
                ):
                    list_department.append(response_json["data"][i]["org_name"])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        list_section = []

        try:
            ## get section from api
            endpoint = (
                self.BACKEND_URL_SERVICE
                + "/api/settings/organize_level?org_level=section"
            )
            headers = {"X-API-Key": self.BACKEND_API_SERVICE}
            response_json = requests.get(endpoint, headers=headers).json()

            for i in range(0, len(response_json["data"])):
                if (
                    response_json["data"][i]["group_type"] == "DIR"
                    or response_json["data"][i]["group_type"] == None
                ):
                    list_section.append(response_json["data"][i]["org_name"])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        return_list = []

        try:
            return_list.append(
                Default_Defect_Summary_Result(
                    month=current_month,
                    department=list_department,
                    section=["-"],
                    line=[],
                    target_percent=0.0,
                    defect_percent=0.0,
                    defect_status=True,
                    total_defect=0,
                    scrap_qty=0,
                    scrap_percent=0.0,
                    repeat_qty=0,
                    repeat_percent=0,
                    graph_yearly_defect_summary=Yearly_Defect_Summary(
                        axis_x=[
                            "AVG\nFY" + str(current_year - 2),
                            "AVG\nFY" + str(current_year - 1),
                            "AVG\nFY" + str(current_year),
                        ],
                        target_percent=[0, 0, 0],
                        defect_percent=[0, 0, 0],
                        defect_qty=[],
                    ),
                    graph_monthly_defect_summary=Monthly_Defect_Summary(
                        axis_x=axis_x,
                        target_percent=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        defect_percent=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        defect_qty=[],
                    ),
                    graph_daily_defect_summary=Daily_Defect_Summary(
                        prod_vol=74103,
                        defect=381,
                        defect_percent=0.51,
                        axis_x=[
                            "1",
                            "2",
                            "3",
                            "4",
                            "5",
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                            "11",
                            "12",
                            "13",
                            "14",
                            "15",
                            "16",
                            "17",
                            "18",
                            "19",
                            "20",
                            "21",
                            "22",
                            "23",
                            "24",
                            "25",
                            "26",
                            "27",
                            "28",
                            "29",
                            "30",
                        ],
                        axis_y_lift=[
                            "0.00",
                            "25.00",
                            "50.00",
                            "75.00",
                            "100.00",
                            "125.00",
                        ],
                        axis_y_right=[
                            "0.00",
                            "1.00",
                            "2.00",
                            "3.00",
                            "4.00",
                            "5.00",
                        ],
                        defect_percent_actual=[
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                        ],
                        defect_qty=[],
                    ),
                    graph_defect_summary_by_type=Defect_Summary_By_Type(
                        total=0.0, defect=[]
                    ),
                    abnormal_occurrence_table=[],
                    defect_pareto_chart=Defect_Pareto_Chart(),
                    description_of_defect=[],
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Defect_Summary_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to get_default_defect_summary because {e}",
            )

    async def post_department_change(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        department = ""
        res = await self.crud.department_section_change(db=db, where_stmt=text_data)

        department = res["department"]
        section = res["section"]
        # print("department:", department)
        # print("section:", section)
        list_section = []

        # try:
        ## get section from api
        endpoint = (
            self.BACKEND_URL_SERVICE
            + f"/api/settings/sections_by_org?org_name={quote(department)}&org_level=department"
        )
        # print("endpoint:", endpoint)
        # endpoint = quote(endpoint)
        headers = {"X-API-Key": self.BACKEND_API_SERVICE}
        response_json = requests.get(endpoint, headers=headers).json()

        for i in range(0, len(response_json["sections"])):
            list_section.append(response_json["sections"][i]["section_code_name"])

        # except Exception as e:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail=f"because {e}",
        #     )

        list_line = []

        # try:
        ## get line from api
        if section == "-":
            endpoint = self.BACKEND_URL_SERVICE + (
                f"/api/settings/lines_by_org?org_name={quote(department)}&org_level=department"
            )
        else:
            endpoint = (
                self.BACKEND_URL_SERVICE
                + f"/api/settings/lines_by_org?org_name={quote(section)}&org_level=section"
            )
        # print("endpoint:", endpoint)

        headers = {"X-API-Key": self.BACKEND_API_SERVICE}
        # endpoint = quote(endpoint)
        response_json = requests.get(endpoint, headers=headers).json()

        for i in range(0, len(response_json["data"])):
            list_line.append(response_json["data"][i]["section_line"])

        # except Exception as e:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail=f"because {e}",
        #     )

        return_list = []

        try:
            return_list.append(
                Department_Section_Result(
                    department=res["department"],
                    section=["-"] + list_section,
                    line=list_line,
                )
            )
            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Department_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_department_change because {e}",
            )

    async def post_general_information(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        data = text_data.dict()
        ## get data general_information from db
        print("data:", data)
        # print("select_target_control:", select_target_control)
        # print("res:", res)
        #!
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

        # index_select = list_line.index(data["line_name"])
        # select_line_id = list_line_id[index_select]
        line_value = data["line_name"]

        if isinstance(line_value, (list, tuple)):
            # If it's an array, get all matching IDs
            select_line_id = [
                list_line_id[list_line.index(line)] for line in line_value
            ]
        else:
            # If it's a single value, get one ID
            select_line_id = list_line_id[list_line.index(line_value)]
        print("select_line_id:", select_line_id)
        res, select_target_control, data = await self.crud.general_information(
            db=db, select_line_id=select_line_id, where_stmt=text_data
        )
        #!
        #!-> get prod_actul
        #!-> get defect_qty
        #!-> calculation
        #!
        date_p_bar = convert_month_year_to_date(data["month"])
        first_date, last_date = get_first_and_last_date_of_month(
            date=date_p_bar, previous_month=True
        )
        res_p_bar_last_month = await self.get_calculation_data(
            text_data=text_data,
            select_line_id=select_line_id,
            first_date=first_date,
            last_date=last_date,
            db=db,
        )
        print("res_p_bar_last_month:", res_p_bar_last_month)
        list_p_last_month = round(res_p_bar_last_month["p_bar"], 2)
        print("list_p_last_month:", list_p_last_month)

        first_date, last_date = get_first_and_last_date_of_month(date=date_p_bar)
        res_p_bar_now_month = await self.get_calculation_data(
            text_data=text_data,
            select_line_id=select_line_id,
            first_date=first_date,
            last_date=last_date,
            db=db,
        )
        print("res_p_bar_now_month:", res_p_bar_now_month)
        p_bar_now_month = round(res_p_bar_now_month["p_bar"], 2)
        n_bar_now_month = round(res_p_bar_now_month["n_bar"], 2)
        k_now_month = round(res_p_bar_now_month["k"], 2)
        uclp_now_month = round(res_p_bar_now_month["ucl"], 2)
        lclp_now_month = round(res_p_bar_now_month["lcl"], 2)
        # print("list_p_last_month:", list_p_last_month)
        # list_p_bar_a = [res_p_bar_last_month["p_bar"]] * day_in_month_graph
        # print("list_p_bar_a:", list_p_bar_a)
        #!
        ## get data p_chart_record_table_p_bar_last_month from db

        # list_p_last_month = await self.crud.p_chart_record_table_p_bar_last_month(
        #     db=db, where_stmt=text_data
        # )

        return_list = []
        # print("res2:", res)
        # res = [{'test'}]
        try:
            return_list.append(
                General_Information_Result(
                    id=0,
                    month=data["month"],
                    line_name=data["line_name"],
                    part_no=data["part_no"],
                    part_name="",
                    process=data["process"],
                    shift=data["shift"],
                    target_control=select_target_control,
                    p_last_month=list_p_last_month,
                    n_bar=n_bar_now_month,
                    p_bar=p_bar_now_month,
                    k=k_now_month,
                    uclp=uclp_now_month,
                    lclp=lclp_now_month,
                )
            )
            for r in res:
                key_index = r._key_to_index
                print("r:", r)
                # return_list.append(
                #     General_Information_Result(
                #         id=r[key_index["id"]],
                #         month=r[key_index["month"]],
                #         line_name=data["line_name"],
                #         part_no=r[key_index["part_no"]],
                #         part_name=r[key_index["part_name"]],
                #         process=r[key_index["process"]],
                #         shift=r[key_index["shift"]],
                #         target_control=select_target_control,
                #         p_last_month=list_p_last_month,
                #         n_bar=r[key_index["n_bar"]],
                #         p_bar=r[key_index["p_bar"]],
                #         k=r[key_index["k"]],
                #         uclp=r[key_index["uclp"]],
                #         lclp=r[key_index["lclp"]],
                #     )
                # )
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
                        n_bar=n_bar_now_month,
                        p_bar=p_bar_now_month,
                        k=k_now_month,
                        uclp=uclp_now_month,
                        lclp=lclp_now_month,
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

    async def post_defect_summary(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        data = text_data.dict()
        print("1data:", data)
        #!
        # Parse month and year
        date_obj = datetime.strptime(
            data["month"], "%B-%Y"
        )  # %B = full month name, %Y = year
        year = date_obj.year
        month = date_obj.month

        # Get number of days in the month
        days_in_month = calendar.monthrange(year, month)[1]
        general_information = await self.post_general_information(
            text_data=General_Information(
                month=data["month"],
                line_name=data["line"],
                part_no=None,
                shift=data["shift"],
                process="Inline",
                sub_line=None,
            ),
            db=db,
        )
        general_information = general_information[0]
        # print("general_informationCC:", general_information)
        #!
        start_time = time.time()
        # print("Start:", start_time)
        target_control = 0.0
        ##get target_control from db
        res, data = await self.crud.get_target_control(db=db, where_stmt=text_data)
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration1: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        for r in res:
            key_index = r._key_to_index

            target_control = r[key_index["target_control"]]
            break
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration2: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        defect_percent = 0.0
        defect_status = True
        total_defect = 0
        scrap_qty = 0
        scrap_percent = 0.0
        repeat_qty = 0
        repeat_percent = 0.0

        # get defect_percent, defect_status, total_defect, scrap_qty, scrap_percent, repeat_qty, repeat_percent, list_prod_qty from db
        (
            defect_percent,
            defect_status,
            total_defect,
            scrap_qty,
            scrap_percent,
            repeat_qty,
            repeat_percent,
            list_prod_qty,
        ) = await self.crud.get_defect(
            db=db, where_stmt=text_data, target=target_control
        )
        current_year = int(datetime.now().strftime("%Y"))
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration3: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        ##set graph_yearly_defect_summary
        list_axis_x_yearly = []
        list_target_percent_yearly = []
        list_defect_percent_yearly = []
        list_defect_qty_yearly = []

        result_list_defect_qty_yearly_process = {}
        list_process = ["Inline", "Outline", "Inspection"]
        ##get graph_yearly_defect_summary from db
        (
            list_axis_x_yearly,
            list_target_percent_yearly,
            list_defect_percent_yearly,
            list_defect_qty_yearly,
        ) = await self.crud.get_graph_yearly_defect_summary(db=db, where_stmt=text_data)
        for process in list_process:
            result_list_defect_qty_yearly = []
            for defect_qty in list_defect_qty_yearly[process]:
                result_list_defect_qty_yearly.append(
                    Defect_Qty_Detail(name=defect_qty[0], qty=defect_qty[1])
                )
            result_list_defect_qty_yearly_process[process] = (
                result_list_defect_qty_yearly
            )
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration4: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        ##
        ##set graph_monthly_defect_summary
        list_axis_x_monthly = []
        list_target_percent_monthly = []
        list_defect_percent_monthly = []
        list_defect_qty_monthly = []
        result_list_defect_qty_monthly = []
        result_list_defect_qty_monthly_process = {}
        ##get graph_monthly_defect_summary from db
        (
            list_axis_x_monthly,
            list_target_percent_monthly,
            list_defect_percent_monthly,
            list_defect_qty_monthly,
        ) = await self.crud.get_graph_monthly_defect_summary(
            db=db, where_stmt=text_data
        )
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration5: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        for process in list_process:
            result_list_defect_qty_monthly = []
            for defect_qty in list_defect_qty_monthly[process]:
                result_list_defect_qty_monthly.append(
                    Defect_Qty_Detail(name=defect_qty[0], qty=defect_qty[1])
                )
            result_list_defect_qty_monthly_process[process] = (
                result_list_defect_qty_monthly
            )
            ##
        ##set graph_defect_summary_by_type
        total = 0.0
        list_defect_by_type = []
        result_list_defect_by_type = []
        result_list_defect_by_type_process = {}
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration6: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)

        ##get graph_defect_summary_by_type from db
        total, list_defect_by_type, sum_defect_qty = (
            await self.crud.get_graph_defect_summary_by_type(
                db=db, where_stmt=text_data, prod_qty=list_prod_qty
            )
        )
        # print("total:", total)
        # print("list_defect_by_type:", list_defect_by_type)
        # print("sum_defect_qty:", sum_defect_qty)
        # print("list_prod_qty:", list_prod_qty)
        ucl_list = [0] * days_in_month
        for i, idx in enumerate(list_prod_qty):
            if list_prod_qty[i] != 0:
                k = round(
                    (
                        math.sqrt(
                            (100 - general_information.p_last_month)
                            * general_information.p_last_month
                            / list_prod_qty[i]
                        )
                    )
                    * 3,
                    2,
                )
            else:
                k = 0
            ucl_list[i] = round(general_information.p_last_month + k, 2)
        # print("ucl_list:", ucl_list)
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration7: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        for process in list_process:
            result_list_defect_by_type = []
            for defect_by_type in list_defect_by_type[process]:
                result_list_defect_by_type.append(
                    Defect_By_Type(
                        name=defect_by_type[0],
                        qty=defect_by_type[1],
                        percent=defect_by_type[2],
                    )
                )
            result_list_defect_by_type_process[process] = result_list_defect_by_type

        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration8: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        ##
        ##set graph_daily_defect_summary
        prod_vol = sum(list_prod_qty)
        defect = sum_defect_qty
        defect_percent_daily = total
        list_axis_x_daily = []
        list_axis_y_lift = []
        list_axis_y_right = []
        list_defect_percent_actual = []
        list_defect_qty_daily = []
        result_list_defect_qty_daily = []  # name: str, qty: list[int]
        result_list_defect_qty_daily_process = {}
        ##get graph_daily_defect_summary from db
        (
            list_axis_x_daily,
            list_axis_y_lift,
            list_axis_y_right,
            list_defect_percent_actual,
            list_defect_qty_daily,
        ) = await self.crud.get_graph_daily_defect_summary(
            db=db, where_stmt=text_data, prod_qty=list_prod_qty
        )

        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration9: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        for process in list_process:
            if result_list_defect_qty_daily_process.get(process) is None:
                result_list_defect_qty_daily_process[process] = []
            for defect_qty in list_defect_qty_daily[process]:
                result_list_defect_qty_daily_process[process].append(
                    Defect_Qty_Detail(name=defect_qty[0], qty=defect_qty[1])
                )
        # print("list_defect_qty_daily[Inline]:", list_defect_qty_daily["Inline"])
        end_time = time.time()
        # print("End:", end_time)
        duration = end_time - start_time
        minutes = int(duration // 60)
        seconds = duration % 60

        # print(f"Duration10: {minutes} min {seconds:.2f} sec")
        start_time = time.time()
        # print("Start:", start_time)
        return_list = []
        yearly_defect_inline_summary = Yearly_Defect_Summary(
            axis_x=list_axis_x_yearly,
            target_percent=list_target_percent_yearly["Inline"],
            defect_percent=list_defect_percent_yearly["Inline"],
            defect_qty=result_list_defect_qty_yearly_process["Inline"],
        )
        yearly_defect_outline_summary = Yearly_Defect_Summary(
            axis_x=list_axis_x_yearly,
            target_percent=list_target_percent_yearly["Outline"],
            defect_percent=list_defect_percent_yearly["Outline"],
            defect_qty=result_list_defect_qty_yearly_process["Outline"],
        )
        yearly_defect_inspection_summary = Yearly_Defect_Summary(
            axis_x=list_axis_x_yearly,
            target_percent=list_target_percent_yearly["Inspection"],
            defect_percent=list_defect_percent_yearly["Inspection"],
            defect_qty=result_list_defect_qty_yearly_process["Inspection"],
        )

        monthly_defect_inline_summary = Monthly_Defect_Summary(
            axis_x=list_axis_x_monthly,
            target_percent=list_target_percent_monthly["Inline"],
            defect_percent=list_defect_percent_monthly["Inline"],
            defect_qty=result_list_defect_qty_monthly_process["Inline"],
        )
        monthly_defect_outline_summary = Monthly_Defect_Summary(
            axis_x=list_axis_x_monthly,
            target_percent=list_target_percent_monthly["Outline"],
            defect_percent=list_defect_percent_monthly["Outline"],
            defect_qty=result_list_defect_qty_monthly_process["Outline"],
        )
        monthly_defect_inspection_summary = Monthly_Defect_Summary(
            axis_x=list_axis_x_monthly,
            target_percent=list_target_percent_monthly["Inspection"],
            defect_percent=list_defect_percent_monthly["Inspection"],
            defect_qty=result_list_defect_qty_monthly_process["Inspection"],
        )

        daily_defect_inline_summary = Daily_Defect_Summary(
            prod_vol=prod_vol + defect["Inline"],
            defect=defect["Inline"],
            defect_percent=defect_percent_daily["Inline"],
            axis_x=list_axis_x_daily,
            axis_y_lift=list_axis_y_lift,
            axis_y_right=list_axis_y_right,
            defect_percent_actual=list_defect_percent_actual["Inline"],
            defect_qty=result_list_defect_qty_daily_process["Inline"],
            # ucl_target=[0.3] * days_in_month,
            ucl_target=ucl_list,
            p_bar=[general_information.p_last_month] * days_in_month,
            target_control=[target_control] * days_in_month,
            #! PBar
            #! Target
            #! UCL
        )
        daily_defect_outline_summary = Daily_Defect_Summary(
            prod_vol=prod_vol + defect["Outline"],
            defect=defect["Outline"],
            defect_percent=defect_percent_daily["Outline"],
            axis_x=list_axis_x_daily,
            axis_y_lift=list_axis_y_lift,
            axis_y_right=list_axis_y_right,
            defect_percent_actual=list_defect_percent_actual["Outline"],
            defect_qty=result_list_defect_qty_daily_process["Outline"],
        )
        daily_defect_inspection_summary = Daily_Defect_Summary(
            prod_vol=prod_vol + defect["Inspection"],
            defect=defect["Inspection"],
            defect_percent=defect_percent_daily["Inspection"],
            axis_x=list_axis_x_daily,
            axis_y_lift=list_axis_y_lift,
            axis_y_right=list_axis_y_right,
            defect_percent_actual=list_defect_percent_actual["Inspection"],
            defect_qty=result_list_defect_qty_daily_process["Inspection"],
        )

        defect_summary_inline_by_type = Defect_Summary_By_Type(
            total=total["Inline"], defect=result_list_defect_by_type_process["Inline"]
        )
        defect_summary_outline_by_type = Defect_Summary_By_Type(
            total=total["Outline"], defect=result_list_defect_by_type_process["Outline"]
        )
        defect_summary_inspection_by_type = Defect_Summary_By_Type(
            total=total["Inspection"],
            defect=result_list_defect_by_type_process["Inspection"],
        )

        try:
            return_list.append(
                Defect_Summary_Result(
                    month=data["month"],
                    department=data["department"],
                    section=data["section"],
                    line=data["line"],
                    target_percent=target_control,
                    defect_percent=defect_percent,
                    defect_status=defect_status,
                    total_defect=total_defect,
                    scrap_qty=scrap_qty,
                    scrap_percent=scrap_percent,
                    repeat_qty=repeat_qty,
                    repeat_percent=repeat_percent,
                    graph_yearly_defect_summary=Yearly_Defect_Process_Summary(
                        inline=yearly_defect_inline_summary,
                        outline=yearly_defect_outline_summary,
                        inspection=yearly_defect_inspection_summary,
                    ),
                    graph_monthly_defect_summary=Monthly_Defect_Process_Summary(
                        inline=monthly_defect_inline_summary,
                        outline=monthly_defect_outline_summary,
                        inspection=monthly_defect_inspection_summary,
                    ),
                    graph_daily_defect_summary=Daily_Defect_Process_Summary(
                        inline=daily_defect_inline_summary,
                        outline=daily_defect_outline_summary,
                        inspection=daily_defect_inspection_summary,
                    ),
                    graph_defect_summary_by_type=Defect_Summary_Process_By_Type(
                        inline=defect_summary_inline_by_type,
                        outline=defect_summary_outline_by_type,
                        inspection=defect_summary_inspection_by_type,
                    ),
                )
            )
            end_time = time.time()
            # print("End:", end_time)
            duration = end_time - start_time
            minutes = int(duration // 60)
            seconds = duration % 60

            # print(f"Duration11: {minutes} min {seconds:.2f} sec")
            start_time = time.time()
            # print("Start:", start_time)
            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Defect_Summary_Result not found",
                )
            return return_list
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_defect_summary because {e}",
            )

    async def post_cause_of_abnormal(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data cause_of_abnormal from db
        rs, data = await self.crud.cause_of_abnormal(db=db, where_stmt=text_data)

        list_abnormal = []
        c = 0
        for r in rs:
            key_index = r._key_to_index

            ## get data from db
            list_abnormal.append(
                Abnormal_Occurrence_Table(
                    date=str(r[key_index["date"]]),
                    part_no=r[key_index["part_no"]],
                    sub_line=r[key_index["sub_line"]],
                    trouble=r[key_index["trouble"]],
                    action=r[key_index["action"]],
                    in_charge=r[key_index["in_change"]],
                    manager=r[key_index["manager"]],
                    detect_by=r[key_index["detect_by"]],
                    defect_details=r[key_index["defect_detail"]],
                    rank=r[key_index["rank"]],
                    root_cause_process=r[key_index["root_cause_process"]],
                    process_name_supplier_namecause=r[
                        key_index["process_supplier_name"]
                    ],
                    cause=r[key_index["cause"]],
                    new_re_occur=r[key_index["new_re_occur"]],
                )
            )

            c += 1

        return_list = []

        try:
            return_list.append(
                Cause_Of_Abnormal_Result(
                    month=data["month"],
                    department=data["department"],
                    section=data["section"],
                    line=data["line"],
                    shift=data["shift"],
                    abnormal_occurrence_table=list_abnormal,
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Cause_Of_Abnormal_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_cause_of_abnormal because {e}",
            )

    async def post_defect_pareto_chart(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        list_defect_inline = []
        list_defect_qty_inline = []
        list_defect_outline = []
        list_defect_qty_outline = []
        list_defect_inspection = []
        list_defect_qty_inspection = []
        ## get_defect_qty_pareto_chart from db
        res_defect_pareto = await self.crud.get_defect_qty_pareto_chart(
            db=db, where_stmt=text_data
        )
        for r in res_defect_pareto:
            key_index = r._key_to_index

            ## get data
            if r[key_index["process"]] == "Inline":
                list_defect_inline.append(r[key_index["defective_items"]])
                list_defect_qty_inline.append(r[key_index["defect_qty"]])
            elif r[key_index["process"]] == "Outline":
                list_defect_outline.append(r[key_index["defective_items"]])
                list_defect_qty_outline.append(r[key_index["defect_qty"]])
            elif r[key_index["process"]] == "Inspection":
                list_defect_inspection.append(r[key_index["defective_items"]])
                list_defect_qty_inspection.append(r[key_index["defect_qty"]])

        ##! inline
        df_inline = pd.DataFrame(list_defect_qty_inline, columns=["defect_qty"])
        df_inline["defect_qty_pareto"] = (
            df_inline["defect_qty"].cumsum() / df_inline["defect_qty"].sum() * 100
        )
        df_inline = df_inline.round(2)
        list_defect_qty_pareto_inline = df_inline["defect_qty_pareto"].to_list()

        ##! outline
        df_outline = pd.DataFrame(list_defect_qty_outline, columns=["defect_qty"])
        df_outline["defect_qty_pareto"] = (
            df_outline["defect_qty"].cumsum() / df_outline["defect_qty"].sum() * 100
        )
        df_outline = df_outline.round(2)
        list_defect_qty_pareto_outline = df_outline["defect_qty_pareto"].to_list()

        ##! inspection
        df_inspection = pd.DataFrame(list_defect_qty_inspection, columns=["defect_qty"])
        df_inspection["defect_qty_pareto"] = (
            df_inspection["defect_qty"].cumsum()
            / df_inspection["defect_qty"].sum()
            * 100
        )
        df_inspection = df_inspection.round(2)
        list_defect_qty_pareto_inspection = df_inspection["defect_qty_pareto"].to_list()

        list_line = []
        list_line_id = []
        try:
            ## get line, line_id from api
            endpoint = self.BACKEND_URL_SERVICE + "/api/settings/lines?rx_only=false"
            headers = {"X-API-Key": self.BACKEND_API_SERVICE}
            response_json = requests.get(endpoint, headers=headers).json()
            for i in range(0, len(response_json["lines"])):
                list_line.append(response_json["lines"][i]["section_line"])
                #!!!!!Error
                list_line_id.append(response_json["lines"][i]["line_id"])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        ## get defect_pareto_chart from db
        rs, data = await self.crud.defect_pareto_chart(db=db, where_stmt=text_data)
        ## get select line id
        select_line_id = []
        for line_name in data["line"]:
            index_select = list_line.index(line_name)
            select_line_id.append(list_line_id[index_select])

        list_part_no = [[]] * len(select_line_id)
        list_part_name = [[]] * len(select_line_id)
        c = 0
        for c in range(0, len(list_part_no)):

            try:
                ## get part_no, part_name from api
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/settings/parts_by_line?line_id="
                    + str(select_line_id[c])
                )
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["parts"])):
                    list_part_no[c].append(response_json["parts"][i]["part_no"])
                    list_part_name[c].append(response_json["parts"][i]["part_name"])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )

            c += 1

        list_part_no_all = []
        list_part_name_all = []

        c = 0
        for c in range(0, len(list_part_no)):
            list_part_no_all = list_part_no_all + list_part_no[c]
            list_part_name_all = list_part_name_all + list_part_name[c]

        list_description = []
        ## get defect_pareto_chart from db
        for r in rs:
            key_index = r._key_to_index

            defect_qty = 0.0
            prod_qty_all = 1.0

            index_select = list_part_no_all.index(r[key_index["part_no"]])
            select_part_name = list_part_name_all[index_select]

            try:
                ## get prod_qty from api
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/prods/prod_qty?line_id="
                    + str(r[key_index["line_id"]])
                    + "&shift=All&date="
                    + str(r[key_index["date"]])
                )
                response_json = requests.get(endpoint, headers=headers).json()
                # print("response_json:", response_json)
                for i in range(0, len(response_json["prod_qty"])):
                    if str(response_json["prod_qty"][i]["production_date"])[
                        0:10
                    ] == str(r[key_index["date"]]):
                        prod_qty_all = float(response_json["prod_qty"][i]["actual_val"])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )
            ## get line name
            index_select = list_line_id.index(int(r[key_index["line_id"]]))
            line_name = list_line[index_select]

            date = str(r[key_index["date"]])
            line = line_name
            part_no = r[key_index["part_no"]]
            sub_line = r[key_index["sub_line"]]
            process = r[key_index["process"]]
            trouble = r[key_index["trouble"]]
            shift = r[key_index["shift"]]
            ## get get_defect_qty from db
            res_defect = await self.crud.get_defect_qty(
                db=db,
                date=date,
                line=line,
                part_no=part_no,
                sub_line=sub_line,
                process=process,
                shift=shift,
            )
            for r in res_defect:
                key_index = r._key_to_index

                if r[key_index["defect_qty"]] != None:
                    defect_qty = r[key_index["defect_qty"]]

                if (defect_qty == 0.0) | (prod_qty_all == 0.0):
                    percent_defect = 0.0
                else:
                    percent_defect = round(((defect_qty / prod_qty_all) * 100), 2)

                list_description.append(
                    Description_Of_Defect(
                        date=date,
                        line_name=line_name,
                        part_no=part_no,
                        sub_line=sub_line,
                        part_name=select_part_name,
                        process=process,
                        trouble=trouble,
                        prod_vol=prod_qty_all,
                        defect_qty=defect_qty,
                        percent_defect=percent_defect,
                    )
                )
        defect_pareto_chart_inline = Defect_Pareto_Chart(
            axis_x=list_defect_inline,
            axis_y_lift=["0", "25", "50", "75", "100", "125"],
            axis_y_right=["0", "100", "150", "200", "250", "300"],
            pareto=list_defect_qty_pareto_inline,
            defect_qty=list_defect_qty_inline,
        )
        defect_pareto_chart_outline = Defect_Pareto_Chart(
            axis_x=list_defect_outline,
            axis_y_lift=["0", "25", "50", "75", "100", "125"],
            axis_y_right=["0", "100", "150", "200", "250", "300"],
            pareto=list_defect_qty_pareto_outline,
            defect_qty=list_defect_qty_outline,
        )
        defect_pareto_chart_inspection = Defect_Pareto_Chart(
            axis_x=list_defect_inspection,
            axis_y_lift=["0", "25", "50", "75", "100", "125"],
            axis_y_right=["0", "100", "150", "200", "250", "300"],
            pareto=list_defect_qty_pareto_inspection,
            defect_qty=list_defect_qty_inspection,
        )
        return_list = []
        try:
            return_list.append(
                Defect_Pareto_Chart_Result(
                    month=data["month"],
                    department=data["department"],
                    section=data["section"],
                    line=data["line"],
                    defect_pareto_chart=Defect_Pareto_Chart_Process(
                        inline=defect_pareto_chart_inline,
                        outline=defect_pareto_chart_outline,
                        inspection=defect_pareto_chart_inspection,
                    ),
                    description_of_defect=list_description,
                )
            )
            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Defect_Pareto_Chart_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_defect_pareto_chart because {e}",
            )

    async def post_export_abnormal_occurrence(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get cause_of_abnormal from db
        rs, data = await self.crud.cause_of_abnormal(db=db, where_stmt=text_data)

        list_abnormal = []
        list_df = []
        c = 0

        for r in rs:
            key_index = r._key_to_index

            ## get data
            list_abnormal.append(
                Abnormal_Occurrence_Table(
                    date=str(r[key_index["date"]]),
                    part_no=r[key_index["part_no"]],
                    sub_line=r[key_index["sub_line"]],
                    trouble=r[key_index["trouble"]],
                    action=r[key_index["action"]],
                    in_charge=r[key_index["in_change"]],
                    manager=r[key_index["manager"]],
                    detect_by=r[key_index["detect_by"]],
                    defect_details=r[key_index["defect_detail"]],
                    rank=r[key_index["rank"]],
                    root_cause_process=r[key_index["root_cause_process"]],
                    process_name_supplier_namecause=r[
                        key_index["process_supplier_name"]
                    ],
                    cause=r[key_index["cause"]],
                    new_re_occur=r[key_index["new_re_occur"]],
                )
            )

            list_df.append(
                [
                    str(r[key_index["date"]]),
                    r[key_index["part_no"]],
                    r[key_index["sub_line"]],
                    r[key_index["trouble"]],
                    r[key_index["action"]],
                    r[key_index["in_change"]],
                    r[key_index["manager"]],
                    r[key_index["detect_by"]],
                    r[key_index["defect_detail"]],
                    r[key_index["rank"]],
                    r[key_index["root_cause_process"]],
                    r[key_index["process_supplier_name"]],
                    r[key_index["cause"]],
                    r[key_index["new_re_occur"]],
                ]
            )

            c += 1

        ## transfrom list to dataframe
        df = pd.DataFrame(
            list_df,
            columns=[
                "date",
                "part_no",
                "sub_line",
                "trouble",
                "action",
                "in_charge",
                "manager",
                "detect_by",
                "defect_detail",
                "rank",
                "root_cause_process",
                "process_name_supplier_namecause",
                "cause",
                "new_re_occur",
            ],
        )

        try:
            unix_time = int(time.time())
            month_year = data["month"]

            # Save the CSV content to a BytesIO object
            output = BytesIO()
            df.to_csv(output, index=False, encoding="utf-8-sig")
            csv_bytes = output.getvalue()

            # Add BOM explicitly
            csv_bytes_with_bom = codecs.BOM_UTF8 + csv_bytes

            return Response(
                content=csv_bytes_with_bom,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=data-defect-detail-{month_year}-{unix_time}.csv"
                },
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_export_abnormal_occurrence because {e}",
            )

    async def post_export_description(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

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

        ## get defect_pareto_chart from db
        rs, data = await self.crud.defect_pareto_chart(db=db, where_stmt=text_data)

        select_line_id = []
        for line_name in data["line"]:
            index_select = list_line.index(line_name)
            select_line_id.append(list_line_id[index_select])

        list_part_no = [[]] * len(select_line_id)
        list_part_name = [[]] * len(select_line_id)

        c = 0
        for c in range(0, len(list_part_no)):

            try:
                ## get part_no, part_name from api
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/settings/parts_by_line?line_id="
                    + str(select_line_id[c])
                )
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["parts"])):
                    list_part_no[c].append(response_json["parts"][i]["part_no"])
                    list_part_name[c].append(response_json["parts"][i]["part_name"])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )

            c += 1

        list_part_no_all = []
        list_part_name_all = []

        c = 0
        for c in range(0, len(list_part_no)):
            list_part_no_all = list_part_no_all + list_part_no[c]
            list_part_name_all = list_part_name_all + list_part_name[c]

        list_description = []

        defect_qty = 0.0
        prod_qty_all = 1.0

        list_df = []
        # # print("test1")
        ## get defect_pareto_chart from db
        for r in rs:
            key_index = r._key_to_index

            index_select = list_part_no_all.index(r[key_index["part_no"]])
            select_part_name = list_part_name_all[index_select]

            try:
                ## get prod_qty from api
                endpoint = (
                    str(self.BACKEND_URL_SERVICE)
                    + "/api/prods/prod_qty?line_id="
                    + str(r[key_index["line_id"]])
                    + "&shift=All&date="
                    + str(r[key_index["date"]])
                )
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["prod_qty"])):
                    if str(response_json["prod_qty"][i]["production_date"])[
                        0:10
                    ] == str(r[key_index["date"]]):
                        prod_qty_all = float(response_json["prod_qty"][i]["actual_val"])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )
            # # print("test1-1")
            index_select = list_line_id.index(int(r[key_index["line_id"]]))
            line_name = list_line[index_select]

            date = str(r[key_index["date"]])
            line = line_name
            part_no = r[key_index["part_no"]]
            sub_line = r[key_index["sub_line"]]
            process = r[key_index["process"]]
            trouble = r[key_index["trouble"]]

            ## get defect_qty from db
            res_defect = await self.crud.get_defect_qty(
                db=db,
                date=date,
                line=line,
                part_no=part_no,
                sub_line=sub_line,
                process=process,
            )
            # # print("test1-2")
            for r in res_defect:
                key_index = r._key_to_index
                if r[key_index["defect_qty"]] != None:
                    defect_qty = r[key_index["defect_qty"]]

            if (defect_qty == 0.0) | (prod_qty_all == 0.0):
                percent_defect = 0.0
            else:
                percent_defect = round(((defect_qty / prod_qty_all) * 100), 2)

            list_description.append(
                Description_Of_Defect(
                    date=date,
                    line_name=line,
                    part_no=part_no,
                    part_name=select_part_name,
                    sub_line=sub_line,
                    process=process,
                    trouble=trouble,
                    prod_vol=prod_qty_all,
                    defect_qty=defect_qty,
                    percent_defect=percent_defect,
                )
            )

            list_df.append(
                [
                    date,
                    line,
                    part_no,
                    select_part_name,
                    sub_line,
                    process,
                    trouble,
                    prod_qty_all,
                    defect_qty,
                    percent_defect,
                ]
            )
        # # print("test2")
        ## transform list to datafrmae
        df = pd.DataFrame(
            list_df,
            columns=[
                "date",
                "line",
                "part_no",
                "part_name",
                "sub_line",
                "process",
                "trouble",
                "prod_vol",
                "defect_qty",
                "percent_defect",
            ],
        )
        try:
            unix_time = int(time.time())
            month_year = data["month"]

            # Save the CSV content to a BytesIO object
            output = BytesIO()
            df.to_csv(output, index=False, encoding="utf-8-sig")
            csv_bytes = output.getvalue()

            # Add BOM explicitly
            csv_bytes_with_bom = codecs.BOM_UTF8 + csv_bytes

            return Response(
                content=csv_bytes_with_bom,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=data-defect-detail-{month_year}-{unix_time}.csv"
                },
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_export_description because {e}",
            )

    async def get_calculation_data(
        self,
        text_data: str,
        select_line_id: List[int],
        first_date: str,
        last_date: str,
        db: AsyncSession = None,
    ):
        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        # res = await self.crud.get_amount_action_record(db=db, where_stmt=text_data)
        # try:
        data = text_data.dict()
        # print("data:", data)
        headers = {"X-API-Key": self.BACKEND_API_SERVICE}
        # date_prod_qty = convert_month_year_to_date(data["month"])
        # first_date, last_date = get_first_and_last_date_of_month(date)
        count_data = await self.crud.count_data_record(
            db=db, select_line_id=select_line_id, where_stmt=text_data
        )
        defect_qty = await self.crud.get_defect_qty_by_date(
            db=db,
            first_date=first_date,
            last_date=last_date,
            select_line_id=select_line_id,
            where_stmt=text_data,
        )
        line_id_api_str = "&".join(f"line_id={line_id}" for line_id in select_line_id)
        if not defect_qty:
            defect_qty = 0
        if not data["part_no"] or data["part_no"] == "null":
            endpoint = (
                self.BACKEND_URL_SERVICE
                # + "/api/prods/prod_qty?line_id="
                + "/api/prods/prod_qty?"
                # + str(select_line_id)
                + line_id_api_str
                + f"&shift={data['shift']}&date="
                + first_date
            )
        else:
            endpoint = (
                self.BACKEND_URL_SERVICE
                + "/api/prods/prod_qty?part_line_id="
                + str(data["sub_line"])
                + f"&shift={data['shift']}&date="
                + first_date
            )
        print("endpoint:", endpoint)
        response_json = requests.get(endpoint, headers=headers).json()
        #!response_json["prod_qty"]

        prod_actual = 0
        amount_prod_date = 0
        for entry in response_json["prod_qty"]:
            # Parse the date
            # prod_date = datetime.strptime(
            #     entry["production_date"], "%Y-%m-%d %H:%M:%S"
            # )
            # # Check if it matches the target month
            # if prod_date.year == target_year and prod_date.month == target_month:
            prod_actual += entry["actual_val"]
            if entry["actual_val"] != 0:
                amount_prod_date += 1
        if count_data == 0:
            p_bar = float(
                await self.crud.get_initial_pbar(
                    db=db, select_line_id=select_line_id, where_stmt=text_data
                )
            )
        elif prod_actual == 0:
            p_bar = 0
        else:
            p_bar = round((defect_qty / prod_actual * 100), 2)
        #!
        if p_bar == None:
            p_bar = 0

        if amount_prod_date == 0:
            n_bar = 0
        else:
            n_bar = round(prod_actual / amount_prod_date, 2)

        if n_bar == 0:
            k = 0
        else:
            k = round(3 * math.sqrt((p_bar * (100 - p_bar)) / n_bar), 2)
        ucl = round(p_bar + k, 2)
        lcl = round(p_bar - k, 2) if (p_bar - k) > 0 else 0
        # print("defect_qty:", defect_qty)
        # print("prod_actual:", prod_actual)
        # print("amount_prod_date:", amount_prod_date)
        # print("p_bar:", p_bar)
        # print("n_bar:", n_bar)
        # print("k:", k)
        # print("ucl:", ucl)
        # print("lcl:", lcl)
        return_data = {
            "p_bar": p_bar,
            "n_bar": n_bar,
            "k": k,
            "ucl": ucl,
            "lcl": lcl,
        }
        # return_list = Get_Calculation_Data(
        #     month=res["month"],
        #     line_name=res["line_name"],
        #     part_no=res["part_no"],
        #     process=res["process"],
        #     date=res["date"],
        #     shift=res["shift"],
        #     amount_action_record=res["amount_action_record"],
        # )
        # return return_list
        return return_data
        # except Exception as e:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail=f"Unable to get_calculation_data because {e}",
        #     )
