from app.routers.productions import productions_routers
from app.routers.search import search_routers
from app.routers.approval import approval_routers
from app.routers.settings import settings_routers
from app.routers.schemas import schemas_routers
from app.routers.users import users_routers

from app.routers.settings_target import settings_target_routers
from app.routers.settings_target_org import settings_target_org_routers
from app.routers.settings_defect_mode import settings_defect_mode_routers
from app.routers.p_chart_record import p_chart_record_routers
from app.routers.inline_outline import inline_outline_routers
from app.routers.export_p_chart import export_p_chart_routers

__all__ = [
    "productions_routers",
    "search_routers",
    "approval_routers",
    "schemas_routers",
    "settings_routers",
    "users_routers",
    "settings_target_routers",
    "settings_target_org_routers",
    "settings_defect_mode_routers",
    "p_chart_record_routers",
    "inline_outline_routers",
    "export_p_chart_routers",
]
