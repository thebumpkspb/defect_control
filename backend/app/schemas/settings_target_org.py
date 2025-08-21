from pydantic import BaseModel
from typing import List

class Setting_Table(BaseModel):
    target_level: str
    
class Setting_Table_Result(Setting_Table):
    id: int | None = None
    target_name: str
    target_type: str | None = None
    month_year: str | None = None
    target_control: float | None = None
    
class Setting_Table_Result_Response(BaseModel):
    setting_table_result: List[Setting_Table_Result]
    
class Setting_Table_Edit(Setting_Table_Result):
    pass
    
        
class Setting_Table_Edit_Result(BaseModel):
    id: int | None = None
    target_level: List[str] | None = None
    target_name: List[str] | None = None
    target_type: str | None = None
    month_year: str | None = None
    target_control: float | None = None
    
class Setting_Table_Edit_Result_Response(BaseModel):
    setting_table_edit_result: List[Setting_Table_Edit_Result]
    
class Setting_Table_Edit_Save(Setting_Table_Edit):
    creator: str | None = None
    
class Setting_Table_Edit_Save_Response(BaseModel):
    setting_table_edit_save: List[Setting_Table_Edit_Save]

   
class Add_Row_View(Setting_Table):
    pass   
    
class Add_Row_View_Result(BaseModel):
    target_level: List[str] | None = None 
    target_name: List[str] | None = None 
    target_type: List[str] | None = None 
    month_year: str | None = None 
    target_percent: float | None = None 
    
class Add_Row_View_Result_Response(BaseModel):
    add_row_view_result: List[Add_Row_View_Result]
    
class Add_Row_Ok_Result(Add_Row_View):
    target_name: str | None = None
    target_type: str | None = None
    month_year: str | None = None
    target_percent: float | None = None
    creator: str | None = None
    
class Add_Row_Ok_Result_Response(BaseModel):
    add_row_ok_result: List[Add_Row_Ok_Result] 
    
    
    
    
    
