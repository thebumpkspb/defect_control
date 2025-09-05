from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from dotenv import load_dotenv
import requests
import json
import os

load_dotenv()

from app.schemas.settings_sub_part import (
    Setting_Table_Result,
    Setting_Table_Edit_Result,
    Setting_Table_Edit_Save,
    Add_Row_View_Result,
    Add_Row_Ok_Result,
    Setting_SubPart_Table_Result,
)

from app.crud.settings_sub_part import Settings_SubPart_CRUD
from app.utils.logger import get_logger

logger = get_logger(__name__)


class Settings_SubPart_Manager:
    def __init__(self):
        self.crud = Settings_SubPart_CRUD()
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")

    async def post_table_view(self, text_data: str, db: AsyncSession = None):

        if not text_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        data = text_data.dict()

        line_name = data["line_name"]
        line_code_rx = data["line_code_rx"]
        if line_code_rx:
            try:
                ## get line, line_id from api
                endpoint = (
                    self.BACKEND_URL_SERVICE
                    + f"/api/settings/sub_lines?line_code_rx={line_code_rx}"
                )
                headers = {"X-API-Key": self.BACKEND_API_SERVICE}
                response_json = requests.get(endpoint, headers=headers).json()
                print("response_json:", response_json)
                process_dict = {
                    item["rxno_part"]: item["process"]
                    for item in response_json["sub_lines"]
                }
                print("process_dict:", process_dict)
                # for i in range(0, len(response_json["sub_lines"])):
                #     list_line.append(response_json["sub_lines"][i]["section_line"])
                #     list_line_id.append(response_json["sub_lines"][i]["line_id"])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"because {e}",
                )
        ## get data from db
        res, data = await self.crud.table_view(db=db, where_stmt=text_data)
        return_list = []

        # try:
        c = 0
        for r in res:
            c += 1
            key_index = r._key_to_index
            # print('r[key_index["part_no"]]:', r[key_index["part_no"]])
            return_list.append(
                Setting_SubPart_Table_Result(
                    id=c,
                    line_name=data["line_name"],
                    part_name=r[key_index["part_name"]],
                    # part_name="d",
                    part_no=r[key_index["part_no"]],
                    sub_line=r[key_index["sub_line"]],
                    sub_line_label=process_dict[r[key_index["sub_line"]]],
                    process=r[key_index["process"]],
                    sub_part_no=r[key_index["sub_part_no"]],
                    sub_part_name=r[key_index["sub_part_name"]],
                    supplier=r[key_index["supplier"]],
                    unit_consumption=r[key_index["unit_consumption"]],
                )
            )
        if len(return_list) == 0:
            return_list.append(
                Setting_SubPart_Table_Result(
                    id=0,
                    line_name="",
                    part_name="",
                    part_no="",
                    sub_line="",
                    process="",
                    sub_part_no="",
                    sub_part_name="",
                    unit_consumption=0,
                )
            )
        return return_list

        # except:
        #     return_list.append(
        #         Setting_Table_Result(
        #             id=0,
        #             line_name="",
        #             part_name="",
        #             part_no="",
        #             sub_line="",
        #             process="",
        #             sub_part_no="",
        #             unit_consumption=0,
        #         )
        #     )
        #     return return_list

    async def post_table_edit_view(self, text_data: str, db: AsyncSession = None):

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
        res, data = await self.crud.table_edit_view(db=db, where_stmt=text_data)
        return_list = []

        try:
            for r in res:
                key_index = r._key_to_index

                list_part_no = []
                list_part_name = []
                list_parts = []

                if data["line_name"] != "-":
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

                        for i in range(0, len(response_json["parts"])):
                            list_part_no.append(response_json["parts"][i]["part_no"])
                            list_part_name.append(
                                response_json["parts"][i]["part_name"]
                            )

                            list_parts.append(
                                {
                                    "part_no": list_part_no[i],
                                    "part_name": list_part_name[i],
                                }
                            )

                        index_select = list_part_no.index(r[key_index["part_no"]])
                        select_part_name = list_part_name[index_select]

                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"because {e}",
                        )

                else:
                    select_part_name = r[key_index["part_no"]]
                    list_line = []

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
                        sub_part_no=r[key_index["sub_part_no"]],
                        sub_part_name=r[key_index["sub_part_name"]],
                        unit_consumption=r[key_index["unit_consumption"]],
                    )
                )
            if len(return_list) == 0:
                return_list.append(
                    Setting_Table_Edit_Result(
                        id=0,
                        line_name=[],
                        process=[],
                        parts=[{"part_no": "", "part_name": ""}],
                        sub_part_no="",
                        sub_part_name="",
                        unit_consumption="",
                    )
                )
            return return_list

        except:
            return_list.append(
                Setting_Table_Edit_Result(
                    id=0,
                    line_name=[],
                    process=[],
                    parts=[{"part_no": "", "part_name": ""}],
                    sub_part_no="",
                    sub_part_name="",
                    unit_consumption="",
                )
            )
            return return_list

    async def post_table_edit_view_line_name_change(
        self, text_data: str, db: AsyncSession = None
    ):

        list_line = []
        list_line_id = []

        try:
            # get line, line_id from api
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
            list_part_no = []
            list_part_name = []
            list_parts = []

            if res["line_name"] != "-":
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

                    for i in range(0, len(response_json["parts"])):
                        list_part_no.append(response_json["parts"][i]["part_no"])
                        list_part_name.append(response_json["parts"][i]["part_name"])

                        list_parts.append(
                            {"part_no": list_part_no[i], "part_name": list_part_name[i]}
                        )

                    select_part_name = list_part_name[0]

                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"because {e}",
                    )

            else:
                select_part_name = "-"
                list_line = []

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
                    id=res["id"],
                    line_name=res["line_name"],
                    process=res["process"],
                    part_no=res["part_no"],
                    part_name=res["part_name"],
                    sub_line=res["sub_line"],
                    sub_part_no=res["sub_part_no"],
                    sub_part_name=res["sub_part_name"],
                    supplier=res["supplier"],
                    unit_consumption=res["unit_consumption"],
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
                    line_name=res["line_name"],
                    part_no=res["part_no"],
                    part_name=res["part_name"],
                    sub_line=res["sub_line"],
                    process=res["process"],
                    sub_part_no=res["sub_part_no"],
                    sub_part_name=res["sub_part_name"],
                    unit_consumption=res["unit_consumption"],
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

        list_part_no = []
        list_part_name = []
        list_parts = []

        if res["line_name"] != "-":
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

        else:
            select_part_name = res["part_no"]
            list_line = []

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
                    process=["Inline", "Outline", "Inspection"],
                    target_type=["Monthly", "Fiscal Year"],
                    month_year="",
                    target_percent=7.00,
                )
            )
            if len(return_list) == 0:
                return_list.append(
                    Add_Row_View_Result(
                        line_name=[],
                        parts=[],
                        process=[],
                        target_type=[],
                        month_year="",
                        target_percent="",
                    )
                )
            return return_list

        except:
            return_list.append(
                Add_Row_View_Result(
                    line_name=[],
                    parts=[],
                    process=[],
                    target_type=[],
                    month_year="",
                    target_percent="",
                )
            )
            return return_list

    async def post_add_row_view_line_name_change(
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
        res = await self.crud.add_row_view_line_name_change(db=db, where_stmt=text_data)
        return_list = []

        try:
            list_part_no = []
            list_part_name = []
            list_parts = []

            if res["line_name"] != "-":
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

                    for i in range(0, len(response_json["parts"])):
                        list_part_no.append(response_json["parts"][i]["part_no"])
                        list_part_name.append(response_json["parts"][i]["part_name"])

                        list_parts.append(
                            {"part_no": list_part_no[i], "part_name": list_part_name[i]}
                        )

                    select_part_name = list_part_name[0]

                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"because {e}",
                    )

            else:
                select_part_name = "-"
                list_line = []

            return_list.append(
                Add_Row_View_Result(
                    line_name=[res["line_name"]],
                    parts=[{"part_no": "-", "part_name": "-"}] + list_parts,
                )
            )

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
                    sub_line=res["sub_line"],
                    process=res["process"],
                    sub_part_no=res["sub_part_no"],
                    sub_part_name=res["sub_part_name"],
                    supplier=res["supplier"],
                    unit_consumption=res["unit_consumption"],
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
