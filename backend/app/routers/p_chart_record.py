from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from app.functions import api_key_auth
from app.manager import P_Chart_Record_Manager
from app.schemas.p_chart_record import (
    Check_Over_UCL_Target,
    Check_Over_UCL_Target_Response,
    General_Information,
    General_Information_Result,
    General_Information_Result_Response,
    Get_Amount_Action_Record,
    Get_Amount_Action_Record_Response,
    P_Chart_Graph_Result,
    P_Chart_Graph_Result_Response,
    P_Chart_Record_Table_Result,
    P_Chart_Record_Table_Result_Response,
    Add_New_Record,
    Change_Add_New_Record,
    Add_New_Record_Result,
    Add_New_Record_Result_Response,
    Add_New_Record_View_Result,
    Add_New_Record_View_Result_Response,
    Abnormal_Occurrence_View_Result,
    Abnormal_Occurrence_View_Result_Response,
    Abnormal_Occurrence_Edit_View_Result,
    Abnormal_Occurrence_Edit_View_Result_Response,
    Abnormal_Occurrence_Add_View_Result,
    Abnormal_Occurrence_Add_View_Result_Response,
    History_Records_Result,
    History_Records_Result_Response,
    History_Records,
    History_Records_Response,
    History_Records_Edit_Result_Response,
    Add_New_Record_View_By_Part_Result_Response,
    Add_New_Record_View_By_Part,
)


def p_chart_record_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    p_chart_record_manager = P_Chart_Record_Manager()

    @router.post(
        "/general_information",
        response_model=General_Information_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def general_information(
        text_data: General_Information, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        \nexp1. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "All", "process": "Inline" }
        \nexp2. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "A", "process": "Inline" }
        \nexp3. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }
        """
        return General_Information_Result_Response(
            general_information_result=await p_chart_record_manager.post_general_information(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/p_chart_record_graph",
        response_model=P_Chart_Graph_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def p_chart_record_graph(
        text_data: General_Information, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        \nexp1. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "All", "process": "Inline" }
        \nexp2. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "A", "process": "Inline" }
        \nexp3. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }
        """
        return P_Chart_Graph_Result_Response(
            p_chart_graph_result=await p_chart_record_manager.post_p_chart_record_graph(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/p_chart_record_table",
        response_model=P_Chart_Record_Table_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def p_chart_record_table(
        text_data: General_Information, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        \nexp1. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "All", "process": "Inline" }
        \nexp2. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "A", "process": "Inline" }
        \nexp3. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }
        """
        return P_Chart_Record_Table_Result_Response(
            p_chart_record_table_result=await p_chart_record_manager.post_p_chart_record_table(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/add_new_record_view",
        response_model=Add_New_Record_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def add_new_record_view(
        text_data: Add_New_Record, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "date": "2024-11-01", "line_name": "414454 - Starter Assy PA70", "defect_type": "Scrap", "process": "Inline", "part_no": "TG428000-0630" }
        """
        return Add_New_Record_View_Result_Response(
            add_new_record_view_result=await p_chart_record_manager.post_add_new_record_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/add_new_record_view_defect_by_part",
        response_model=Add_New_Record_View_By_Part_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def add_new_record_view_defect_by_part(
        text_data: Add_New_Record_View_By_Part, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "date": "2024-11-01", "line_name": "414454 - Starter Assy PA70", "defect_type": "Scrap", "process": "Inline", "part_no": "TG428000-0630" }
        """
        return Add_New_Record_View_By_Part_Result_Response(
            add_new_record_view_defect_by_part_result=await p_chart_record_manager.post_add_new_record_view_defect_by_part(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/change_new_record_view",
        response_model=Add_New_Record_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def change_new_record_view(
        text_data: Change_Add_New_Record, db: AsyncSession = Depends(db)
    ):
        """

        Example\n
        { "date": "2024-11-01", "line_name": "414454 - Starter Assy PA70", "defect_type": "Scrap", "process": "Inline", "part_no": "TG428000-0630", "defect_mode": "ขัน Bolt, Screw, Nut หัวเยิน" }
        """
        return Add_New_Record_View_Result_Response(
            add_new_record_view_result=await p_chart_record_manager.post_change_new_record_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/add_new_record_save",
        response_model=Add_New_Record_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def add_new_record_save(
        text_data: Add_New_Record_Result, db: AsyncSession = Depends(db)
    ):
        """
        Example
        \nexp1. { "date": "2024-11-01", "line_name": "414454 - Starter Assy PA70", "defect_type": "Scrap", "defective_items": "ขัน Bolt, Screw, Nut หัวเยิน", "process": "Inline", "part_no": "TG428000-0630", "defect_qty_A": 5 , "comment": "XXXXX", "creator": "ANN"}
        \nexp2. { "date": "2024-11-01", "line_name": "414454 - Starter Assy PA70", "defect_type": "Scrap", "defective_items": "ขัน Bolt, Screw, Nut หัวเยิน", "process": "Inline", "part_no": "TG428000-0630", "defect_qty_B": 11, "comment": "XXXXX", "creator": "ANN" }
        """
        return Add_New_Record_Result_Response(
            add_new_record_result=await p_chart_record_manager.post_add_new_record_save(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/abnormal_occurrence_view",
        response_model=Abnormal_Occurrence_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def abnormal_occurrence_view(
        text_data: General_Information, db: AsyncSession = Depends(db)
    ):
        """
        Example
        \nexp1. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "All", "process": "Inline" }
        \nexp2. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "A", "process": "Inline" }
        \nexp3. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }
        """
        return Abnormal_Occurrence_View_Result_Response(
            abnormal_occurrence_view_result=await p_chart_record_manager.post_abnormal_occurrence_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/abnormal_occurrence_edit_view",
        response_model=Abnormal_Occurrence_Edit_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def abnormal_occurrence_edit_view(
        text_data: Abnormal_Occurrence_View_Result, db: AsyncSession = Depends(db)
    ):
        """
        Example
        \nexp1. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline", "id": 2 }
        """
        return Abnormal_Occurrence_Edit_View_Result_Response(
            abnormal_occurrence_edit_view_result=await p_chart_record_manager.post_abnormal_occurrence_edit_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/abnormal_occurrence_edit_save",
        response_model=Abnormal_Occurrence_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def abnormal_occurrence_edit_save(
        text_data: Abnormal_Occurrence_View_Result, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline", "date": "2024-11-01", "trouble": "xxxx", "action": "xxx", "in_change": "Mr.A", "manager": "Mr.B", "detect_by": "M/C", "defect_detail": "Spec: 50A Min, Actual 0A", "rank": "B", "root_cause_process": "In-house", "process_name_supplier_name": "STA Assy", "cause": "Starter shot circuit", "new_re_occur": "New", "id": 2 , "creator": "ANN" }
        """
        return Abnormal_Occurrence_View_Result_Response(
            abnormal_occurrence_view_result=await p_chart_record_manager.post_abnormal_occurrence_edit_save(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/abnormal_occurrence_delete",
        response_model=Abnormal_Occurrence_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def abnormal_occurrence_delete(
        text_data: Abnormal_Occurrence_View_Result, db: AsyncSession = Depends(db)
    ):
        """
        Example
        \nexp1. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline", "id": 1 , "creator": "ANN" }
        """
        return Abnormal_Occurrence_View_Result_Response(
            abnormal_occurrence_view_result=await p_chart_record_manager.post_abnormal_occurrence_delete(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/abnormal_occurrence_add_row_view",
        response_model=Abnormal_Occurrence_Add_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def abnormal_occurrence_add_row_view(
        text_data: General_Information, db: AsyncSession = Depends(db)
    ):
        """
        Example
        \nexp1. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "All", "process": "Inline" }
        \nexp2. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "A", "process": "Inline" }
        \nexp3. { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }
        """
        return Abnormal_Occurrence_Add_View_Result_Response(
            abnormal_occurrence_add_view_result=await p_chart_record_manager.post_abnormal_occurrence_add_row_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/abnormal_occurrence_add_row_ok",
        response_model=Abnormal_Occurrence_View_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def abnormal_occurrence_add_row_ok(
        text_data: Abnormal_Occurrence_View_Result, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "shift": "B", "process": "Inline", "date": "2024-11-01", "trouble": "xxxx", "action": "xxx", "in_change": "Mr.A", "manager": "Mr.B", "detect_by": "M/C", "defect_detail": "Spec: 50A Min, Actual 0A", "rank": "B", "root_cause_process": "In-house", "process_name_supplier_name": "STA Assy", "cause": "Starter shot circuit", "new_re_occur": "New" , "creator": "ANN" }
        """
        return Abnormal_Occurrence_View_Result_Response(
            abnormal_occurrence_view_result=await p_chart_record_manager.post_abnormal_occurrence_add_row_ok(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/history_records_view",
        response_model=History_Records_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def history_records_view(
        text_data: General_Information, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "month": "November-2024", "line_name": "414454 - Starter Assy PA70", "process": "Inspection", "part_no": "TG428000-0630", "shift": "B" }
        """
        return History_Records_Result_Response(
            history_records_result=await p_chart_record_manager.post_history_records_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/history_records_edit_view",
        response_model=History_Records_Edit_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def history_records_edit_view(
        text_data: History_Records, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "no": 1, "date": "2024-11-01", "shift": "A", "line": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "process": "Inspection","defect_type":"Repeat" ,"defect_mode":"Bolt Alarm องศาเกิน" ,"qty": 4, "id": 1}
        """
        return History_Records_Edit_Result_Response(
            history_records_edit_result=await p_chart_record_manager.post_history_records_edit_view(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/history_records_edit_view_change",
        response_model=History_Records_Edit_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def history_records_edit_view_change(
        text_data: History_Records, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "no": 1, "date": "2024-11-01", "shift": "A", "line": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "process": "Inspection","defect_type":"Repeat" ,"defect_mode":"Bolt Alarm องศาเกิน" ,"qty": 4, "id": 1}
        """
        return History_Records_Edit_Result_Response(
            history_records_edit_result=await p_chart_record_manager.post_history_records_edit_view_change(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/history_records_edit_save",
        response_model=History_Records_Result_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def history_records_edit_save(
        text_data: History_Records, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "no": 1, "date": "2024-11-01", "shift": "B", "line": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "process": "Inspection","defect_type":"Repeat" ,"defect_mode":"Bolt Alarm องศาเกิน" ,"qty": 4, "id": 1, "creator": "ANN"}
        """
        return History_Records_Result_Response(
            history_records_result=await p_chart_record_manager.post_history_records_edit_save(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/history_records_delete",
        response_model=History_Records_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def history_records_delete(
        text_data: History_Records, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        { "no": 1, "date": "2024-11-01", "shift": "B", "line": "414454 - Starter Assy PA70", "part_no": "TG428000-0630", "process": "Inspection","defect_type":"Repeat" ,"defect_mode":"Bolt Alarm องศาเกิน" ,"qty": 4, "id": 1, "creator": "ANN"}
        """
        return History_Records_Response(
            history_records=await p_chart_record_manager.post_history_records_delete(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/check_over_ucl_target",
        response_model=Check_Over_UCL_Target_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def check_over_ucl_target(
        text_data: Check_Over_UCL_Target, db: AsyncSession = Depends(db)
    ):
        """
        Example\n
        {
            "line_name": "414454 - Starter Assy PA70",
            "part_no": "TG428000-0630",
            "process": "Inline",
            "date": "2024-12-02",
            "month": "December-2024",
            "shift": "A",
            "defect_qty": 40
        }
        """

        return Check_Over_UCL_Target_Response(
            check_over_ucl_target=await p_chart_record_manager.check_over_ucl_target(
                text_data=text_data, db=db
            )
        )

    @router.post(
        "/get_amount_action_record",
        response_model=Get_Amount_Action_Record_Response,
        dependencies=[Depends(api_key_auth)],
    )
    async def get_amount_action_record(
        text_data: Get_Amount_Action_Record, db: AsyncSession = Depends(db)
    ):
        """
        Example\n

        {
        "line_name": "414454 - Starter Assy PA70",
        "part_no": "TG428000-0630",
        "process": "Inline",
        "date": "2024-12-02",
        "month": "December-2024",
        "shift": "A"
        }
        """

        return Get_Amount_Action_Record_Response(
            get_amount_action_record=await p_chart_record_manager.get_amount_action_record(
                text_data=text_data, db=db
            )
        )

    return router
