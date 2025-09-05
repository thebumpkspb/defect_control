from pydantic import BaseModel
from typing import List


class Setting_Table(BaseModel):
    group_name: str | None = None
    line_name: str
    part_name: str | None = None
    part_no: str | None = None
    sub_line: str | None = None
    sub_line_label: str | None = None


class Setting_SubPart_Table(BaseModel):
    line_name: str
    line_code_rx: str | None = None


class Setting_Table_Result(Setting_Table):
    id: int | None = None
    process: str | None = None
    sub_part_no: str | None = None
    sub_part_name: str | None = None
    supplier: str | None = None
    unit_consumption: int | None = None


class Setting_SubPart_Table_Result(Setting_Table):
    id: int | None = None
    group_name: str | None = None
    process: str | None = None
    sub_part_no: str
    sub_part_name: str | None = None
    supplier: str | None = None
    unit_consumption: int


class Setting_Table_Result_Response(BaseModel):
    setting_table_result: List[Setting_Table_Result]


class Setting_SubPart_Table_Result_Response(BaseModel):
    setting_subpart_table_result: List[Setting_SubPart_Table_Result]


class Setting_Table_Edit(Setting_Table_Result):
    pass


class Parts(BaseModel):
    part_no: str | None = None
    part_name: str | None = None


class Setting_Table_Edit_Result(BaseModel):
    id: int | None = None
    line_name: List[str] | None = None
    process: List[str] | None = None
    parts: List[Parts] | None = None
    target_type: str | None = None
    month_year: str | None = None
    target_control: float | None = None


class Setting_Table_Edit_Result_Response(BaseModel):
    sub_part_table_edit_result: List[Setting_Table_Edit_Result]


class Setting_Table_Edit_Save(Setting_Table_Edit):
    creator: str | None = None


class Setting_Table_Edit_Save_Response(BaseModel):
    setting_table_edit_save: List[Setting_Table_Edit_Save]


class Add_Row_View(Setting_Table):
    pass


class Add_Row_View_Result(BaseModel):
    line_name: List[str] | None = None
    parts: List[Parts] | None = None
    process: List[str] | None = None
    target_type: List[str] | None = None
    month_year: str | None = None
    target_percent: float | None = None


class Add_Row_View_Result_Response(BaseModel):
    add_row_view_result: List[Add_Row_View_Result]


class Add_Row_Ok_Result(Add_Row_View):
    process: str | None = None
    sub_part_no: str | None = None
    sub_part_name: str | None = None
    supplier: str | None = None
    unit_consumption: int | None = None
    creator: str | None = None


class Add_Row_Ok_Result_Response(BaseModel):
    add_row_ok_result: List[Add_Row_Ok_Result]
