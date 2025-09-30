from pydantic import BaseModel
from typing import List


class Setting_Table(BaseModel):
    line_name: str
    process: str | None = None
    part_name: str | None = None
    part_no: str | None = None


class Setting_Table_Result(Setting_Table):
    id: int | None = None
    process: str | None = None
    defect_type: str | None = None
    defect_mode: str | None = None
    category: List[str] | None = None
    target_by_piece: int | None = None
    master_defect_index: int | None = None


class Setting_Table_Result_Response(BaseModel):
    setting_table_result: List[Setting_Table_Result]


class Setting_Table_Edit(Setting_Table):
    process: str | None = None
    defect_type: str | None = None
    defect_mode: str | None = None
    id_table: int | None = None


class Parts(BaseModel):
    part_no: str | None = None
    part_name: str | None = None


class Setting_Table_Edit_Result(BaseModel):
    id: int | None = None
    line_name: List[str] | None = None
    process: List[str] | None = None
    parts: List[Parts] | None = None
    defect_type: List[str] | None = None
    defect_mode: str | None = None
    id_table: int | None = None


class Setting_Table_Edit_Result_Response(BaseModel):
    setting_table_edit_result: List[Setting_Table_Edit_Result]


class Setting_Table_Edit_Save(Setting_Table):
    id: int | None = None
    process: str | None = None
    defect_type: str | None = None
    defect_mode: str | None = None
    target_by_piece: int | None = None
    category: List[str] | None = None
    creator: str | None = None


class Setting_Table_Edit_Save_Response(BaseModel):
    setting_table_edit_save: List[Setting_Table_Edit_Save]


class Setting_Table_Re_Index(BaseModel):
    id: int
    master_defect_index: int


class Setting_Table_Re_Index_Response(BaseModel):
    setting_table_re_index: List[Setting_Table_Re_Index]


class Add_Row_View(Setting_Table):
    process: str | None = None


class Add_Row_View_Result(BaseModel):
    line_name: List[str] | None = None
    parts: List[Parts] | None = None
    process: List[str] | None = None
    defect_type: List[str] | None = None
    defect_mode: str | None = None


class Add_Row_View_Result_Response(BaseModel):
    add_row_view_result: List[Add_Row_View_Result]


class Add_Row_Ok_Result(Setting_Table):
    process: str | None = None
    defect_type: str | None = None
    defect_mode: str | None = None
    target_by_piece: int | None = None
    category: List[str] | None = None
    creator: str | None = None


class Add_Row_Ok_Result_Response(BaseModel):
    add_row_ok_result: List[Add_Row_Ok_Result]
