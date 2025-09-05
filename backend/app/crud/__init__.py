from app.crud.users import UsersCRUD
from app.crud.settings import SettingsCRUD
from app.crud.productions import ProductionsCRUD
from app.crud.search import SearchCRUD
from app.crud.approval import ApprovalCRUD

from app.crud.settings_target import Settings_Target_CRUD
from app.crud.settings_target_org import Settings_Target_Org_CRUD
from app.crud.settings_defect_mode import Settings_Defect_Mode_CRUD
from app.crud.settings_sub_part import Settings_SubPart_CRUD
from app.crud.p_chart_record import P_Chart_Record_CRUD
from app.crud.inline_outline import Inline_Outline_CRUD

__all__ = [
    "UsersCRUD",
    "SettingsCRUD",
    "ProductionsCRUD",
    "Settings_Target_CRUD",
    "Settings_Target_Org_CRUD",
    "Settings_Defect_Mode_CRUD",
    "SearchCRUD",
    "ApprovalCRUD",
    "P_Chart_Record_CRUD",
    "Inline_Outline_CRUD",
]
