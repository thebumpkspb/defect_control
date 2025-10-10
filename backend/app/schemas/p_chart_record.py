from pydantic import BaseModel
from typing import List, Optional


class General_Information(BaseModel):
    month: str | None = None
    line_name: str | None = None
    part_no: str | None = None
    shift: str | None = None
    process: str | None = None
    sub_line: str | None = None


class General_Information_Result(General_Information):
    part_name: str | None = None
    target_control: float | None = None
    p_last_month: float | None = None
    n_bar: float | None = None
    p_bar: float | None = None
    k: float | None = None
    uclp: float | None = None
    lclp: float | None = None
    id: int | None = None


class General_Information_Result_Response(BaseModel):
    general_information_result: List[General_Information_Result]


class Defect_Graph(BaseModel):
    id: int | None = None
    defect_name: str | None = None
    value: List[float] | None = None


class P_Chart_Graph_Result(General_Information):
    defect: List[Defect_Graph] | None = None
    percent_defect: List[float] | None = None
    p_bar: List[float] | None = None
    ucl_target: List[float] | None = None
    x_axis_label: List[str] | None = None
    x_axis_value: List[int] | None = None
    x_axis_maxmin: List[int] | None = None
    y_left_axis: List[float] | None = None
    y_right_axis: List[float] | None = None


class P_Chart_Graph_Result_Response(BaseModel):
    p_chart_graph_result: List[P_Chart_Graph_Result]


class Defect_table(BaseModel):
    id: int | None = None
    defect_type: str | None = None
    defect_item: str | None = None
    category: List[str] | None = None
    target_by_piece: int | None = None
    value: List[int] | None = None


class ReviewByTL(BaseModel):
    shift_a: Optional[str] = None
    shift_b: Optional[str] = None


class ReviewByMGR(BaseModel):
    shift_a: Optional[str] = None
    shift_b: Optional[str] = None


class ReviewByGM(BaseModel):
    shift_a: Optional[str] = None
    shift_b: Optional[str] = None


class P_Chart_Record_Table_Result(General_Information):
    index: List[str] | None = None
    prod_qty: List[int] | None = None
    defect_qty: List[int] | None = None
    defect_ratio: List[float] | None = None
    defect_table: List[Defect_table] | None = None
    record_by: List[str] | None = None
    review_by_tl: List[ReviewByTL | str] | None = None
    review_by_mgr: List[ReviewByMGR | str] | None = None
    review_by_gm: List[ReviewByGM | str] | None = None

    ## Graph
    defect: List[Defect_Graph] | None = None
    percent_defect: List[float] | None = None
    p_bar: List[float] | None = None
    ucl_target: List[float] | None = None
    over_target_by_piece: List[bool] | None = None
    x_axis_label: List[str] | None = None
    x_axis_value: List[int] | None = None
    x_axis_maxmin: List[int] | None = None
    y_left_axis: List[float] | None = None
    y_right_axis: List[float] | None = None


class P_Chart_Record_Table_Result_Response(BaseModel):
    p_chart_record_table_result: List[P_Chart_Record_Table_Result]


class Add_New_Record(BaseModel):
    date: str | None = None
    line_name: str | None = None
    defect_type: str | None = None
    process: str | None = None
    sub_line: str | None = None
    part_no: str | None = None


class Add_New_Record_View_By_Part(BaseModel):
    date: str | None = None
    line_name: str | None = None
    defect_type: str | None = None
    process: str | None = None
    sub_line: str | None = None
    part_no: str | None = None


class Change_Add_New_Record(BaseModel):
    date: str | None = None
    line_name: str | None = None
    defect_type: str | None = None
    process: str | None = None
    part_no: str | None = None
    defect_mode: str | None = None


class Add_New_Record_Result(Add_New_Record):
    defective_items: str | None = None
    defect_qty_A: int | None = None
    defect_qty_B: int | None = None
    pic: str | None = None
    comment: str | None = None
    id: int | None = None
    creator: str | None = None


class Add_New_Record_Result_Response(BaseModel):
    add_new_record_result: List[Add_New_Record_Result]


class Add_New_Record_View_Result(BaseModel):
    date: str | None = None
    line_name: List[str] | None = None
    process: List[str] | None = None
    part_no: List[str] | None = None
    defect_type: str | None = None
    defect_mode: List[str] | None = None
    defect_qty_A: int | None = None
    defect_qty_B: int | None = None
    id: int | None = None
    creator: str | None = None
    comment_shift_A: str | None = None
    comment_shift_B: str | None = None


class Add_New_Record_View_Result_Response(BaseModel):
    add_new_record_view_result: List[Add_New_Record_View_Result]


class Add_New_Record_View_By_Part_Result(BaseModel):
    line_name: str | None = None
    process: str | None = None
    part_no: str | None = None
    defect_type: str | None = None
    defect_mode: str | None = None


class Add_New_Record_View_By_Part_Result_Response(BaseModel):
    add_new_record_view_defect_by_part_result: List[Add_New_Record_View_By_Part_Result]


class Add_New_View_Record_Result(Add_New_Record):
    defective_items: str | None = None
    defect_qty_A: int | None = None
    defect_qty_B: int | None = None
    id: int | None = None
    creator: str | None = None


class Add_New_View_Record_Result_Response(BaseModel):
    add_new_view_record_result: List[Add_New_View_Record_Result]


class Abnormal_Occurrence_View_Result(General_Information):
    no: int | None = None
    date: str | None = None
    part_no: str | None = None
    defect_item: List[int] | None = None
    category: List[str] | None = None
    trouble: str | None = None
    action: str | None = None
    in_change: str | None = None
    manager: str | None = None
    detect_by: str | None = None
    defect_detail: str | None = None
    rank: str | None = None
    root_cause_process: str | None = None
    process_name_supplier_name: str | None = None
    cause: str | None = None
    new_re_occur: str | None = None
    id: int | None = None
    creator: str | None = None


class Abnormal_Occurrence_View_Result_Response(BaseModel):
    abnormal_occurrence_view_result: List[Abnormal_Occurrence_View_Result]


class Abnormal_Occurrence_Edit_View_Result(General_Information):
    no: int | None = None
    date: str | None = None
    part_no: str | None = None
    trouble: str | None = None
    action: str | None = None
    in_change: str | None = None
    manager: str | None = None
    detect_by: str | None = None
    defect_detail: str | None = None
    rank: List[str] | None = None
    root_cause_process: str | None = None
    process_name_supplier_name: str | None = None
    cause: str | None = None
    new_re_occur: str | None = None
    id: int | None = None


class Abnormal_Occurrence_Edit_View_Result_Response(BaseModel):
    abnormal_occurrence_edit_view_result: List[Abnormal_Occurrence_Edit_View_Result]


class Abnormal_Occurrence_Add_View_Result(Abnormal_Occurrence_Edit_View_Result):
    pass


class Abnormal_Occurrence_Add_View_Result_Response(BaseModel):
    abnormal_occurrence_add_view_result: List[Abnormal_Occurrence_Add_View_Result]


class History_Records(BaseModel):
    no: int | None = None
    date: str | None = None
    shift: str | None = None
    line: str | None = None
    part_no: str | None = None
    sub_line: str | None = None
    process: str | None = None
    defect_type: str | None = None
    defect_mode: str | None = None
    category: List[str] | None = None
    qty: int | None = None
    pic: str | None = None
    id: int | None = None
    creator: str | None = None


class History_Records_Result(General_Information):
    history_records_result: List[History_Records]


class History_Records_Result_Response(BaseModel):
    history_records_result: List[History_Records_Result]


class History_Records_Response(BaseModel):
    history_records: List[History_Records]


class History_Records_Edit(BaseModel):
    no: int | None = None
    date: str | None = None
    shift: List[str] | None = None
    line: List[str] | None = None
    part_no: List[str] | None = None
    process: List[str] | None = None
    defect_type: List[str] | None = None
    defect_mode: List[str] | None = None
    qty: int | None = None
    id: int | None = None


class History_Records_Edit_Result_Response(BaseModel):
    history_records_edit_result: List[History_Records_Edit]


class Check_Over_UCL_Target(General_Information):
    # line: str | None = None
    # part_no: str | None = None
    # process: str | None = None
    date: str | None = None
    # shift: str | None = None
    defect_qty: int | None = None
    defect_type: str | None = None
    ucl_target: float | None = None
    defect_ratio: float | None = None
    is_over: bool | None = None


class Check_Over_UCL_Target_Response(BaseModel):
    check_over_ucl_target: Check_Over_UCL_Target


class Get_Amount_Action_Record(General_Information):
    # line: str | None = None
    # part_no: str | None = None
    # process: str | None = None
    date: str | None = None
    # shift: str | None = None
    amount_action_record: int | None = None


class Get_Amount_Action_Record_Response(BaseModel):
    get_amount_action_record: Get_Amount_Action_Record
