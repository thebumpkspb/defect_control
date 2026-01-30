from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, List

from app.functions import api_key_auth
from app.manager import Settings_Defect_Mode_Manager
from app.schemas.settings_defect_mode import (
    Setting_Table,
    Setting_Table_Result,
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
    Setting_Table_Re_Index_Response,
    Setting_Table_Re_Index,
)


def settings_defect_mode_routers(
    db: AsyncGenerator,
    db_common_pg_async: AsyncGenerator,
    db_prod_ms: AsyncGenerator,
    db_prod_my: AsyncGenerator,
) -> APIRouter:
    router = APIRouter()
    settings_defect_mode_manager = Settings_Defect_Mode_Manager()

    @router.post(
        "/table_view",
        response_model=Setting_Table_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_view(
        text_data: Setting_Table,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example
        \nexp1: { "line_name": "", "part_no": "", "part_name": "" }
        \nexp2: { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY" }
        """
        return Setting_Table_Result_Response(
            setting_table_result=await settings_defect_mode_manager.post_table_view(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/table_view_action_record",
        response_model=Setting_Table_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_view(
        text_data: Setting_Table,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example
        \nexp1: { "line_name": "", "part_no": "", "part_name": "" }
        \nexp2: { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY" }
        """
        return Setting_Table_Result_Response(
            setting_table_result=await settings_defect_mode_manager.post_table_view_action_record(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/table_edit_view",
        response_model=Setting_Table_Edit_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_edit_view(
        text_data: Setting_Table_Edit,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example \n
        { "id_table": 15, "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline","defect_type": "Repeat", "defect_mode": "ขัน Screw Housing ไม่ลง" }
        """
        return Setting_Table_Edit_Result_Response(
            setting_table_edit_result=await settings_defect_mode_manager.post_table_edit_view(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/table_edit_view_line_name_change",
        response_model=Setting_Table_Edit_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_edit_view_line_name_change(
        text_data: Setting_Table,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example \n
        { "line_name": "414454 - Starter Assy PA70", "part_no": "", "part_name": "" }
        """
        return Setting_Table_Edit_Result_Response(
            setting_table_edit_result=await settings_defect_mode_manager.post_table_edit_view_line_name_change(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/table_edit_save",
        response_model=Setting_Table_Edit_Save_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_edit_save(
        text_data: Setting_Table_Edit_Save,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example \n
        { "id": 16, "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline","defect_type": "Repeat", "defect_mode": "ขัน Screw Housing ไม่ลง", "creator": "ANN" }
        """
        return Setting_Table_Edit_Save_Response(
            setting_table_edit_save=await settings_defect_mode_manager.post_table_edit_save(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/table_re_index",
        response_model=Setting_Table_Re_Index_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_re_index(
        text_data: List[Setting_Table_Re_Index], db: AsyncSession = Depends(db)
    ):
        """
        Example \n
        { "id": 16, "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline","defect_type": "Repeat", "defect_mode": "ขัน Screw Housing ไม่ลง", "creator": "ANN" }
        """
        return Setting_Table_Re_Index_Response(
            setting_table_re_index=await settings_defect_mode_manager.post_table_re_index(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/table_delete",
        response_model=Setting_Table_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_delete(
        text_data: Setting_Table_Result,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example \n
        { "id": 1, "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline","defect_type": "Repeat", "defect_mode": "ขัน Screw Housing ไม่ลง" }
        """
        return Setting_Table_Result_Response(
            setting_table_result=await settings_defect_mode_manager.post_table_delete(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/add_row_view",
        response_model=Add_Row_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_add_row_view(
        text_data: Add_Row_View,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example \n
        { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY" }
        """
        return Add_Row_View_Result_Response(
            add_row_view_result=await settings_defect_mode_manager.post_add_row_view(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/add_row_view_line_name_change",
        response_model=Add_Row_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_add_row_view_line_name_change(
        text_data: Add_Row_View,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example \n
        { "line_name": "414454 - Starter Assy PA70", "part_no": "", "part_name": "" }
        """
        return Add_Row_View_Result_Response(
            add_row_view_result=await settings_defect_mode_manager.post_add_row_view_line_name_change(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/add_row_ok",
        response_model=Add_Row_Ok_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_add_row_ok(
        text_data: Add_Row_Ok_Result,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example
        \nexp1: { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline","defect_type": "Repeat", "defect_mode": "ขัน Screw Housing ไม่ลง", "creator": "ANN" }
        \nexp2: { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline","defect_type": "M/C Set up", "defect_mode": "", "creator": "ANN" }
        \nexp3: { "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "part_name": "STARTER ASSY", "process": "Inline","defect_type": "Quality Test", "defect_mode": "", "creator": "ANN" }
        """
        return Add_Row_Ok_Result_Response(
            add_row_ok_result=await settings_defect_mode_manager.post_add_row_ok(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    return router
