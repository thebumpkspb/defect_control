from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from dotenv import load_dotenv
import requests
import json
import os

load_dotenv()

from app.schemas.settings_defect_mode import (
    Setting_Table_Result,
    Setting_Table_Edit_Result,
    Setting_Table_Edit_Save,
    Add_Row_View_Result,
    Add_Row_Ok_Result,
    Setting_Table_Re_Index,
)

from app.crud.settings_defect_mode import Settings_Defect_Mode_CRUD
from app.utils.logger import get_logger

logger = get_logger(__name__)


class Settings_Defect_Mode_Manager:
    def __init__(self):
        self.crud = Settings_Defect_Mode_CRUD()
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")

    async def post_table_view(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res, data = await self.crud.table_view(db=db, where_stmt=text_data)
        return_list = []

        try:
            c = 0
            for r in res:
                c += 1
                key_index = r._key_to_index

                return_list.append(
                    Setting_Table_Result(
                        id=r[key_index["id"]],
                        # id = c,
                        line_name=data["line_name"],
                        process=r[key_index["process"]],
                        part_no=r[key_index["part_no"]],
                        part_name=r[key_index["part_name"]],
                        defect_type=r[key_index["defect_type"]],
                        defect_mode=r[key_index["defect_mode"]],
                        category=r[key_index["category"]],
                        target_by_piece=r[key_index["target_by_piece"]],
                        master_defect_index=r[key_index["master_defect_index"]],
                    )
                )
            if len(return_list) == 0:
                return_list.append(
                    Setting_Table_Result(
                        id=0,
                        line_name="",
                        process="",
                        part_no="",
                        part_name="",
                        defect_type="",
                        category=[],
                        target_by_piece=None,
                        master_defect_index=0,
                    )
                )
            return return_list

        except:
            return_list.append(
                Setting_Table_Result(
                    id=0,
                    line_name="",
                    process="",
                    part_no="",
                    part_name="",
                    defect_type="",
                    category=[],
                    target_by_piece=None,
                    master_defect_index=0,
                )
            )
            return return_list

    async def post_table_view_action_record(
        self, text_data: str, db: AsyncSession = None
    ):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res, data = await self.crud.table_view_action_record(
            db=db, where_stmt=text_data
        )
        return_list = []

        try:
            c = 0
            for r in res:
                c += 1
                key_index = r._key_to_index

                return_list.append(
                    Setting_Table_Result(
                        id=r[key_index["id"]],
                        # id = c,
                        line_name=data["line_name"],
                        process=r[key_index["process"]],
                        part_no=r[key_index["part_no"]],
                        part_name=r[key_index["part_name"]],
                        defect_type=r[key_index["defect_type"]],
                        defect_mode=r[key_index["defect_mode"]],
                        category=r[key_index["category"]],
                        target_by_piece=r[key_index["target_by_piece"]],
                        master_defect_index=r[key_index["master_defect_index"]],
                    )
                )
            if len(return_list) == 0:
                return_list.append(
                    Setting_Table_Result(
                        id=0,
                        line_name="",
                        process="",
                        part_no="",
                        part_name="",
                        defect_type="",
                        category=[],
                        target_by_piece=None,
                        master_defect_index=0,
                    )
                )
            return return_list

        except:
            return_list.append(
                Setting_Table_Result(
                    id=0,
                    line_name="",
                    process="",
                    part_no="",
                    part_name="",
                    defect_type="",
                    category=[],
                    target_by_piece=None,
                    master_defect_index=0,
                )
            )
            return return_list

    async def post_table_edit_view(self, text_data: str, db: AsyncSession = None):

        list_line = []
        list_line_id = []
        data = text_data.dict()
        part_no = data["part_no"]
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

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res, data = await self.crud.table_edit_view(db=db, where_stmt=text_data)
        return_list = []

        try:
            for r in res:
                key_index = r._key_to_index

                index_select = list_line.index(data["line_name"])
                select_line_id = list_line_id[index_select]

                try:
                    ## get part_no, part_name from api
                    endpoint = (
                        self.BACKEND_URL_SERVICE
                        + "/api/settings/parts_by_line?line_id="
                        + str(select_line_id)
                    )
                    response_json = requests.get(endpoint, headers=headers).json()

                    list_part_no = []
                    list_part_name = []
                    list_parts = []

                    for i in range(0, len(response_json["parts"])):
                        list_part_no.append(response_json["parts"][i]["part_no"])
                        list_part_name.append(response_json["parts"][i]["part_name"])

                        list_parts.append(
                            {"part_no": list_part_no[i], "part_name": list_part_name[i]}
                        )
                    if part_no:
                        index_select = list_part_no.index(r[key_index["part_no"]])
                        select_part_name = list_part_name[index_select]
                    else:
                        select_part_name = ""

                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"because {e}",
                    )

                return_list.append(
                    Setting_Table_Edit_Result(
                        id=r[key_index["id"]],
                        line_name=list(dict.fromkeys([data["line_name"]] + list_line)),
                        process=list(
                            dict.fromkeys(
                                [
                                    r[key_index["process"]],
                                    "Inline",
                                    "Outline",
                                    "Inspection",
                                ]
                            )
                        ),
                        parts=list(
                            {
                                i["part_no"]: i
                                for i in [
                                    {
                                        "part_no": r[key_index["part_no"]],
                                        "part_name": select_part_name,
                                    }
                                ]
                                + list_parts
                            }.values()
                        ),
                        defect_type=list(
                            dict.fromkeys(
                                [
                                    r[key_index["defect_type"]],
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
                        defect_mode=r[key_index["defect_mode"]],
                        id_table=data["id_table"],
                    )
                )
            if len(return_list) == 0:
                return_list.append(
                    Setting_Table_Edit_Result(
                        id=0,
                        line_name=[],
                        process=[],
                        parts=[],
                        defect_type=[],
                        defect_mode="",
                        id_table=0,
                    )
                )

            return return_list

        except:
            return_list.append(
                Setting_Table_Edit_Result(
                    id=0,
                    line_name=[],
                    process=[],
                    parts=[],
                    defect_type=[],
                    defect_mode="",
                    id_table=0,
                )
            )

            return return_list

    async def post_table_edit_view_line_name_change(
        self, text_data: str, db: AsyncSession = None
    ):

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

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.table_edit_view_line_name_change(
            db=db, where_stmt=text_data
        )
        return_list = []

        try:
            index_select = list_line.index(res["line_name"])
            select_line_id = list_line_id[index_select]

            list_part_no = []
            list_part_name = []
            list_parts = []

            try:
                ## get part_no, part_name from api
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + "/api/settings/parts_by_line?line_id="
                    + str(select_line_id)
                )
                response_json = requests.get(endpoint, headers=headers).json()

                for i in range(0, len(response_json["parts"])):
                    list_part_no.append(response_json["parts"][i]["part_no"])
                    list_part_name.append(response_json["parts"][i]["part_name"])

                    list_parts.append(
                        {"part_no": list_part_no[i], "part_name": list_part_name[i]}
                    )

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )
            return_list.append(
                Setting_Table_Edit_Result(
                    line_name=[res["line_name"]],
                    parts=list_parts,
                )
            )
            if len(return_list) == 0:
                return_list.append(
                    Setting_Table_Edit_Result(
                        line_name=[],
                        parts=[{"part_no": "", "part_name": ""}],
                    )
                )
            return return_list

        except:
            return_list.append(
                Setting_Table_Edit_Result(
                    line_name=[],
                    parts=[{"part_no": "", "part_name": ""}],
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
                    line_name=res["line_name"],
                    process=res["process"],
                    part_no=res["part_no"],
                    part_name=res["part_name"],
                    defect_type=res["defect_type"],
                    defect_mode=res["defect_mode"],
                    target_by_piece=res["target_by_piece"],
                    category=res["category"],
                    creator=res["creator"],
                    id=res["id"],
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

    async def post_table_re_index(self, text_data: str, db: AsyncSession = None):
        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.table_re_index(db=db, where_stmt=text_data)
        return_list = []
        # data=text_data.dict()
        try:
            # for item in data:
            for r in res:
                # print("r:", r.id)
                return_list.append(
                    Setting_Table_Re_Index(
                        id=r.id, master_defect_index=r.master_defect_index
                    )
                )
            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Setting_Table_Re_Index not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_table_re_index because {e}",
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
                    line_name=res["line_name"],
                    process=res["process"],
                    part_no=res["part_no"],
                    part_name=res["part_name"],
                    defect_type=res["defect_type"],
                    defect_mode=res["defect_mode"],
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

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.add_row_view(db=db, where_stmt=text_data)
        return_list = []

        index_select = list_line.index(res["line_name"])
        select_line_id = list_line_id[index_select]

        try:
            ## get part_no, part_name from api
            endpoint = (
                self.BACKEND_URL_SERVICE
                + "/api/settings/parts_by_line?line_id="
                + str(select_line_id)
            )
            response_json = requests.get(endpoint, headers=headers).json()

            list_part_no = []
            list_part_name = []
            list_parts = []

            for i in range(0, len(response_json["parts"])):
                list_part_no.append(response_json["parts"][i]["part_no"])
                list_part_name.append(response_json["parts"][i]["part_name"])

                list_parts.append(
                    {"part_no": list_part_no[i], "part_name": list_part_name[i]}
                )

            index_select = list_part_no.index(res["part_no"])
            select_part_name = list_part_name[index_select]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"because {e}",
            )

        try:
            return_list.append(
                Add_Row_View_Result(
                    line_name=list(dict.fromkeys([res["line_name"]] + list_line)),
                    parts=list(
                        {
                            i["part_no"]: i
                            for i in [
                                {
                                    "part_no": res["part_no"],
                                    "part_name": select_part_name,
                                }
                            ]
                            + list_parts
                        }.values()
                    ),
                    # TODO: Add sub_parts to set defect mode for outline
                    process=["Inline", "Outline", "Inspection"],
                    defect_type=[
                        "Repeat",
                        "Scrap",
                        "M/C Set up",
                        "Quality Test",
                        "Appearance",
                        "Dimension",
                        "Performance",
                        "Other",
                    ],
                    defect_mode="",
                )
            )

            if len(return_list) == 0:
                return_list.append(
                    Add_Row_View_Result(
                        line_name=[],
                        parts=[{"part_no": "", "part_name": ""}],
                        process=[],
                        defect_type=[],
                        defect_mode="",
                    )
                )
            return return_list

        except:
            return_list.append(
                Add_Row_View_Result(
                    line_name=[],
                    parts=[{"part_no": "", "part_name": ""}],
                    process=[],
                    defect_type=[],
                    defect_mode="",
                )
            )
            return return_list

    async def post_add_row_view_line_name_change(
        self, text_data: str, db: AsyncSession = None
    ):

        list_line = []
        list_line_id = []
        data = text_data.dict()
        process = data["process"]
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

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )

        ## get data from db
        res = await self.crud.add_row_view_line_name_change(db=db, where_stmt=text_data)
        return_list = []

        try:
            index_select = list_line.index(res["line_name"])
            select_line_id = list_line_id[index_select]

            list_part_no = []
            list_part_name = []
            list_parts = []
            if process and process == "Outline":
                result = await self.crud.get_sub_part(db=db, where_stmt=text_data)
                for r in result:
                    key_index = r._key_to_index

                    list_parts.append(
                        {
                            "part_no": r[key_index["sub_part_no"]],
                            "part_name": r[key_index["sub_part_name"]],
                        }
                    )
            else:
                try:
                    ## get part_no, part_name from api

                    endpoint = (
                        self.BACKEND_URL_SERVICE
                        + "/api/settings/parts_by_line?line_id="
                        + str(select_line_id)
                    )
                    response_json = requests.get(endpoint, headers=headers).json()

                    for i in range(0, len(response_json["parts"])):
                        list_part_no.append(response_json["parts"][i]["part_no"])
                        list_part_name.append(response_json["parts"][i]["part_name"])

                        list_parts.append(
                            {"part_no": list_part_no[i], "part_name": list_part_name[i]}
                        )

                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"because {e}",
                    )

            return_list.append(
                Add_Row_View_Result(
                    line_name=[res["line_name"]],
                    parts=list_parts,
                )
            )
            print("return_list:", return_list)
            if len(return_list) == 0:
                return_list.append(
                    Add_Row_View_Result(
                        line_name=[],
                        parts=[{"part_no": "", "part_name": ""}],
                    )
                )
            return return_list

        except:
            return_list.append(
                Add_Row_View_Result(
                    line_name=[],
                    parts=[{"part_no": "", "part_name": ""}],
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
                    line_name=res["line_name"],
                    part_name=res["part_name"],
                    part_no=res["part_no"],
                    process=res["process"],
                    defect_type=res["defect_type"],
                    defect_mode=res["defect_mode"],
                    category=res["category"],
                    creator=res["creator"],
                )
            )

            if len(return_list) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Add_Row_Ok_Result not found",
                )
            return return_list

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to post_add_row_ok because {e}",
            )
