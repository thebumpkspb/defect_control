from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from app.functions import api_key_auth
from app.manager import Settings_Target_Org_Manager
from app.schemas.settings_target_org import (
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
)


def settings_target_org_routers(
    db: AsyncGenerator,
    db_common_pg_async: AsyncGenerator,
    db_prod_ms: AsyncGenerator,
    db_prod_my: AsyncGenerator,
) -> APIRouter:
    router = APIRouter()
    settings_target_org_manager = Settings_Target_Org_Manager()

    @router.post(
        "/table_view",
        response_model=Setting_Table_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table(text_data: Setting_Table, db: AsyncSession = Depends(db)):
        """
        Example
        \nexp1: { "target_level": "" }
        \nexp2: { "target_level": "Division" }
        """
        return Setting_Table_Result_Response(
            setting_table_result=await settings_target_org_manager.post_table_view(
                text_data=text_data, db=db
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
        { "id": 1, "target_level": "Division", "target_name": "EPD", "target_type": "Monthly","month_year": "November-2024","target_control": 9.50 }
        """
        return Setting_Table_Edit_Result_Response(
            setting_table_edit_result=await settings_target_org_manager.post_table_edit_view(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/table_edit_view_target_level_change",
        response_model=Setting_Table_Edit_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_table_edit_view_target_level_change(
        text_data: Setting_Table,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example \n
        { "target_level": "Division" }
        """
        return Setting_Table_Edit_Result_Response(
            setting_table_edit_result=await settings_target_org_manager.post_table_edit_view_target_level_change(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
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
        { "id": 1, "target_level": "Division", "target_name": "EPD", "target_type": "Monthly","month_year": "November-2024","target_control": 9.50, "creator": "ANN" }
        """
        return Setting_Table_Edit_Save_Response(
            setting_table_edit_save=await settings_target_org_manager.post_table_edit_save(
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
        { "id": 1, "target_level": "Division", "target_name": "EPD", "target_type": "Monthly","month_year": "November-2024","target_control": 9.50 }
        """
        return Setting_Table_Result_Response(
            setting_table_result=await settings_target_org_manager.post_table_delete(
                text_data=text_data, db=db
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
        { "target_level": "Division" }
        """
        return Add_Row_View_Result_Response(
            add_row_view_result=await settings_target_org_manager.post_add_row_view(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
            )
        )

    @router.post(
        "/add_row_view_target_level_change",
        response_model=Add_Row_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def setting_add_row_view_target_level_change(
        text_data: Add_Row_View,
        db: AsyncSession = Depends(db),
        db_common_pg_async: AsyncSession = Depends(db_common_pg_async),
    ):
        """
        Example \n
        { "target_level": "Division" }
        """
        return Add_Row_View_Result_Response(
            add_row_view_result=await settings_target_org_manager.post_add_row_view_target_level_change(
                text_data=text_data, db=db, db_common_pg_async=db_common_pg_async
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
        { "target_level": "Division", "target_name": "EPD", "target_type": "Monthly","month_year": "November-2024","target_percent": 9.50, "creator": "ANN" }
        """
        return Add_Row_Ok_Result_Response(
            add_row_ok_result=await settings_target_org_manager.post_add_row_ok(
                text_data=text_data, db=db
            )
        )

    return router
