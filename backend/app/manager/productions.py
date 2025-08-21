from datetime import datetime
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import ProductionsCRUD
from app.functions import get_month_start_end
from app.manager import SettingsManager
from app.schemas.productions import ProductionQty
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ProductionsManager:
    def __init__(self):
        self.crud = ProductionsCRUD()
        self.setting_manager = SettingsManager()

    async def get_prod_qty(
        self,
        line_id: List[int],
        shift: str,
        date: str = None,
        db: AsyncSession = None,
        db_common: AsyncSession = None,
    ):
        line = await self.setting_manager.get_lines(line_id=line_id, db=db_common)
        line_code = (
            [f"'{str(l.line_code_rx)}'" for l in line] if len(line) > 0 else ["''"]
        )
        if date is None:
            date_time = datetime.now()
        else:
            date_time = datetime.strptime(date, "%Y-%m-%d")
        start_date, end_date = get_month_start_end(date_time)
        calendar = await self.setting_manager.get_calendars(
            date=start_date, db=db_common
        )
        day_shift = calendar[0].day_shift
        if shift.lower() == "all":
            shift = "(1,2)"
        elif day_shift.lower() == shift.lower():
            shift = "(1)"
        else:
            shift = "(2)"

        where_stmt = f"""AND ac.LineCode IN ({",".join(line_code)})
                        AND ShiftNo IN {shift}
                        AND ProductionDate BETWEEN '{start_date}' AND '{end_date}'"""
        res = self.crud.get_prod_qty(where_stmt=where_stmt, db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                ProductionQty(
                    production_date=f'{r[key_index["ProductionDate"]]}',
                    plan_val=r[key_index["PlanVal"]],
                    actual_val=r[key_index["ActualVal"]],
                )
            )
        return return_list
