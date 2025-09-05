from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from app.functions import api_key_auth
from app.manager import Settings_SubPart_Manager
from app.schemas.settings_sub_part import (
    Setting_SubPart_Table,
    Setting_Table_Result,
    Setting_SubPart_Table_Result_Response,
    Setting_Table_Result_Response,
    Setting_Table_Edit,
    Setting_Table_Edit_Result,
    Setting_Table_Edit_Result_Response,
    Setting_Table_Edit_Save,
    Setting_Table_Edit_Save_Response,
    Add_Row_View,
    Add_Row_View_Result,
    Add_Row_View_Result_Response,
    Add_Row_Ok_Result,
    Add_Row_Ok_Result_Response,
)


def settings_subpart_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    settings_sub_part_manager = Settings_SubPart_Manager()

    @router.post(
        "/table_view",
        response_model=Setting_SubPart_Table_Result_Response,
        # response_model=Setting_Table_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table(
        text_data: Setting_SubPart_Table, db: AsyncSession = Depends(db)
    ):
        """
        Example
        \nexp1: { "line_name": "", "part_no": "", "part_name": "" }
        \nexp2: { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY" }
        """
        return Setting_SubPart_Table_Result_Response(
            setting_subpart_table_result=await settings_sub_part_manager.post_table_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/table_edit_view",
        response_model=Setting_Table_Edit_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_edit_view(
        text_data: Setting_Table_Edit, db: AsyncSession = Depends(db)
    ):
        """
        Example \n
        { "id": 1, "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline", "target_type": "Monthly","month_year": "September-2024","target_control": 7.10 }
        """
        return Setting_Table_Edit_Result_Response(
            sub_part_table_edit_result=await settings_sub_part_manager.post_table_edit_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/table_edit_view_line_name_change",
        response_model=Setting_Table_Edit_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_edit_view_line_name_change(
        text_data: Setting_SubPart_Table, db: AsyncSession = Depends(db)
    ):
        """
        Example \n
        { "line_name": "414454 - Starter Assy PA70", "part_no": "", "part_name": "" }
        """
        return Setting_Table_Edit_Result_Response(
            sub_part_table_edit_result=await settings_sub_part_manager.post_table_edit_view_line_name_change(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/table_edit_save",
        response_model=Setting_Table_Edit_Save_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_edit_save(
        text_data: Setting_Table_Edit_Save, db: AsyncSession = Depends(db)
    ):
        """
        Example \n
        { "id": 13, "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline", "target_type": "Monthly","month_year": "September-2024","target_control": 7.10, "creator": "ANN" }
        """
        return Setting_Table_Edit_Save_Response(
            setting_table_edit_save=await settings_sub_part_manager.post_table_edit_save(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/table_delete",
        response_model=Setting_Table_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_delete(
        text_data: Setting_Table_Result, db: AsyncSession = Depends(db)
    ):
        """
        Example \n
        { "id": 1, "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline", "target_type": "Monthly","month_year": "September-2024","target_control": 7.10 }
        """
        return Setting_Table_Result_Response(
            setting_table_result=await settings_sub_part_manager.post_table_delete(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/add_row_view",
        response_model=Add_Row_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_add_row_view(
        text_data: Add_Row_View, db: AsyncSession = Depends(db)
    ):
        """
        Example \n
        { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY" }
        """
        return Add_Row_View_Result_Response(
            add_row_view_result=await settings_sub_part_manager.post_add_row_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/add_row_view_line_name_change",
        response_model=Add_Row_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_add_row_view_line_name_change(
        text_data: Add_Row_View, db: AsyncSession = Depends(db)
    ):
        """
        Example \n
        { "line_name": "414454 - Starter Assy PA70", "part_no": "", "part_name": "" }
        """
        return Add_Row_View_Result_Response(
            add_row_view_result=await settings_sub_part_manager.post_add_row_view_line_name_change(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/add_row_ok",
        response_model=Add_Row_Ok_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_add_row_ok(
        text_data: Add_Row_Ok_Result, db: AsyncSession = Depends(db)
    ):
        """
        Example \n
        { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline", "target_type": "Monthly","month_year": "September-2024","target_percent": 7.10, "creator": "ANN" }
        """
        return Add_Row_Ok_Result_Response(
            add_row_ok_result=await settings_sub_part_manager.post_add_row_ok(
                text_data=text_data, db=db
            )
        )

    return router
