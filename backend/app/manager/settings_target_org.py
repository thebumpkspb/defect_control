from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from dotenv import load_dotenv
import requests
import json
import os

load_dotenv()

from app.schemas.settings_target_org import (
    Setting_Table_Result,
    Setting_Table_Edit_Result,
    Setting_Table_Edit_Save,
    Add_Row_View_Result,
    Add_Row_Ok_Result,
)

from app.crud.settings_target_org import Settings_Target_Org_CRUD
from app.utils.logger import get_logger

logger = get_logger(__name__)


class Settings_Target_Org_Manager:
    def __init__(self):
        self.crud = Settings_Target_Org_CRUD()
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")

    async def post_table_view(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        ## get data from db
        res = await self.crud.table_view(db=db, where_stmt=text_data)
        return_list = []

        try:
            c = 0
            for r in res:
                c += 1
                key_index = r._key_to_index

                return_list.append(
                    Setting_Table_Result(
                        id=c,
                        target_level=r[key_index["target_level"]],
                        target_name=r[key_index["target_name"]],
                        target_type=r[key_index["target_type"]],
                        month_year=r[key_index["month_year"]],
                        target_control=r[key_index["target_control"]],
                    )
                )
            if len(return_list) == 0:
                return_list.append(
                    Setting_Table_Result(
                        id=0,
                        target_level="",
                        target_name="",
                        target_type="",
                        month_year="",
                        target_control=0.0,
                    )
                )
            return return_list

        except:
            return_list.append(
                Setting_Table_Result(
                    id=0,
                    target_level="",
                    target_name="",
                    target_type="",
                    month_year="",
                    target_control=0.0,
                )
            )
            return return_list

    async def post_table_edit_view(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        select_id = None
        list_target_level = []
        list_target_name = []
        target_type = None
        month_year = None
        target_control = None

        ## get data from db
        res = await self.crud.table_edit_view(db=db, where_stmt=text_data)
        for r in res:
            key_index = r._key_to_index

            ## get data from db
            select_id = r[key_index["id"]]
            list_target_level.append(r[key_index["target_level"]])
            list_target_name.append(r[key_index["target_name"]])
            target_type = r[key_index["target_type"]]
            month_year = r[key_index["month_year"]]
            target_control = float(r[key_index["target_control"]])

        if list_target_level[0] == "Division":
            level = "division"
        elif list_target_level[0] == "Department":
            level = "department"
        elif list_target_level[0] == "Section":
            level = "section"
        elif list_target_level[0] == "Line":
            level = "line"

        try:
            ## get org_name from api
            endpoint = (
                self.BACKEND_URL_SERVICE
                + "/api/settings/organize_level?org_level="
                + level
            )
            headers = {"X-API-Key": self.BACKEND_API_SERVICE}
            response_json = requests.get(endpoint, headers=headers).json()

            for i in range(0, len(response_json["data"])):
                if (
                    response_json["data"][i]["group_type"] == "DIR"
                    or response_json["data"][i]["group_type"] == None
                ):
                    list_target_name.append(response_json["data"][i]["org_name"])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        return_list = []

        try:
            return_list.append(
                Setting_Table_Edit_Result(
                    id=select_id,
                    target_level=list_target_level,
                    target_name=list_target_name,
                    target_type=target_type,
                    month_year=month_year,
                    target_control=target_control,
                )
            )
            if len(return_list) == 0:
                return_list.append(
                    Setting_Table_Edit_Result(
                        id=0,
                        target_level=[],
                        target_name=[],
                        target_type="",
                        month_year="",
                        target_control=0.0,
                    )
                )
            return return_list

        except:
            return_list.append(
                Setting_Table_Edit_Result(
                    id=0,
                    target_level=[],
                    target_name=[],
                    target_type="",
                    month_year="",
                    target_control=0.0,
                )
            )
            return return_list

    async def post_table_edit_view_target_level_change(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        ## get data from db
        res = await self.crud.table_edit_view_target_level_change(
            db=db, where_stmt=text_data
        )
        return_list = []

        try:
            list_target_name = []

            if res["target_level"] == "Division":
                level = "division"
            elif res["target_level"] == "Department":
                level = "department"
            elif res["target_level"] == "Section":
                level = "section"
            elif res["target_level"] == "Line":
                level = "line"

            try:
                ## get org_name from api
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/settings/organize_level?org_level="
                    + level
                )
                headers = {"X-API-Key": self.BACKEND_API_SERVICE}
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["data"])):
                    if (
                        response_json["data"][i]["group_type"] == "DIR"
                        or response_json["data"][i]["group_type"] == None
                    ):
                        list_target_name.append(response_json["data"][i]["org_name"])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )

            return_list.append(
                Setting_Table_Edit_Result(
                    target_level=[res["target_level"]]
                    + ["Division", "Department", "Section", "Line"],
                    target_name=list_target_name,
                )
            )

            if len(return_list) == 0:
                return_list.append(
                    Setting_Table_Edit_Result(
                        target_level=[
                            "Division",
                            "Department",
                            "Section",
                            "Line",
                        ],
                        target_name=[],
                    )
                )
            return return_list

        except:
            return_list.append(
                Setting_Table_Edit_Result(
                    target_level=[
                        "Division",
                        "Department",
                        "Section",
                        "Line",
                    ],
                    target_name=[],
                )
            )
            return return_list

    async def post_table_edit_save(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.table_edit_save(db=db, where_stmt=text_data)
        return_list = []

        try:
            return_list.append(
                Setting_Table_Edit_Save(
                    id=res["id"],
                    target_level=res["target_level"],
                    target_name=res["target_name"],
                    target_type=res["target_type"],
                    month_year=res["month_year"],
                    target_control=res["target_control"],
                    creator=res["creator"],
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Setting_Table_Edit_Save not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_table_edit_save because {e}",
            )

    async def post_table_delete(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.table_delete(db=db, where_stmt=text_data)
        return_list = []

        try:
            return_list.append(
                Setting_Table_Result(
                    id=res["id"],
                    target_level=res["target_level"],
                    target_name=res["target_name"],
                    target_type=res["target_type"],
                    month_year=res["month_year"],
                    target_control=res["target_control"],
                )
            )
            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Setting_Table_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_table_delete because {e}",
            )

    async def post_add_row_view(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.add_row_view(db=db, where_stmt=text_data)
        return_list = []

        try:
            list_target_name = []

            if res["target_level"] == "Division":
                level = "division"
            elif res["target_level"] == "Department":
                level = "department"
            elif res["target_level"] == "Section":
                level = "section"
            elif res["target_level"] == "Line":
                level = "line"

            try:
                ## get org_name from api
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/settings/organize_level?org_level="
                    + level
                )
                headers = {"X-API-Key": self.BACKEND_API_SERVICE}
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["data"])):
                    if (
                        response_json["data"][i]["group_type"] == "DIR"
                        or response_json["data"][i]["group_type"] == None
                    ):
                        list_target_name.append(response_json["data"][i]["org_name"])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )

            return_list.append(
                Add_Row_View_Result(
                    target_level=[res["target_level"]]
                    + ["Division", "Department", "Section", "Line"],
                    target_name=list_target_name,
                    target_type=["Monthly", "Fiscal Year"],
                    month_year="",
                    target_percent=9.50,
                )
            )

            if len(return_list) == 0:
                return_list.append(
                    Add_Row_View_Result(
                        target_level=[],
                        target_name=[],
                        target_type=[],
                        month_year="",
                        target_percent="",
                    )
                )
            return return_list

        except:
            return_list.append(
                Add_Row_View_Result(
                    target_level=[],
                    target_name=[],
                    target_type=[],
                    month_year="",
                    target_percent="",
                )
            )
            return return_list

    async def post_add_row_view_target_level_change(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.add_row_view_target_level_change(
            db=db, where_stmt=text_data
        )
        return_list = []

        try:
            list_target_name = []

            if res["target_level"] == "Division":
                level = "division"
            elif res["target_level"] == "Department":
                level = "department"
            elif res["target_level"] == "Section":
                level = "section"
            elif res["target_level"] == "Line":
                level = "line"

            try:
                ## get org_name from api
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/settings/organize_level?org_level="
                    + level
                )
                headers = {"X-API-Key": self.BACKEND_API_SERVICE}
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["data"])):
                    if (
                        response_json["data"][i]["group_type"] == "DIR"
                        or response_json["data"][i]["group_type"] == None
                    ):
                        list_target_name.append(response_json["data"][i]["org_name"])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )

            return_list.append(
                Add_Row_View_Result(
                    target_level=[res["target_level"]]
                    + ["Division", "Department", "Section", "Line"],
                    target_name=list_target_name,
                )
            )
            if len(return_list) == 0:
                return_list.append(
                    Add_Row_View_Result(
                        target_level=[
                            "Division",
                            "Department",
                            "Section",
                            "Line",
                        ],
                        target_name=[],
                    )
                )
            return return_list

        except:
            return_list.append(
                Add_Row_View_Result(
                    target_level=[
                        "Division",
                        "Department",
                        "Section",
                        "Line",
                    ],
                    target_name=[],
                )
            )
            return return_list

    async def post_add_row_ok(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.add_row_ok(db=db, where_stmt=text_data)
        return_list = []

        try:
            return_list.append(
                Add_Row_Ok_Result(
                    target_level=res["target_level"],
                    target_name=res["target_name"],
                    target_type=res["target_type"],
                    month_year=res["month_year"],
                    target_percent=res["target_percent"],
                    creator=res["creator"],
                )
            )
            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="target_setting_table_add_row_ok not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_target_setting_add_row_ok because {e}",
            )
