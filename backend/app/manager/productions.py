from datetime import datetime
from typing import List, Literal
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import ProductionsCRUD
from app.functions import get_month_start_end
from app.manager import SettingsManager
from app.schemas.productions import ProductionQty, ProductionQtyAcc
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ProductionsManager:
    def __init__(self):
        self.crud = ProductionsCRUD()
        self.setting_manager = SettingsManager()

    async def get_prod_qty(
        self,
        line_id: List[int] | None,
        part_no: str | None,
        process_name: str | None,
        shift: str,
        part_line_id: str | None,
        date: str = None,
        type_: Literal["Daily", "Monthly", "Yearly"] = "Daily",
        db_my: AsyncSession = None,
        db_ms: AsyncSession = None,
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
        start_date, end_date = get_month_start_end(date_obj=date_time, type_=type_)
        calendar = await self.setting_manager.get_calendars(
            date=start_date, db=db_common
        )
        day_shift = calendar[0].day_shift
        if shift.lower() == "all":
            shift_manual = "('A','B')"
            shift_auto = "(1,2)"
        elif day_shift.lower() == shift.lower():
            shift_manual = f"('{shift.upper()}')"
            shift_auto = "(1)"
        else:
            shift_manual = f"('{shift.upper()}')"
            shift_auto = "(2)"
        start_date_d, end_date_d = get_month_start_end(
            date_obj=date_time, type_=type_, date_only=True
        )
        where_stmt_manual = f"""AND ShiftNo IN {shift_manual} AND ProductionDate BETWEEN '{start_date_d}' AND '{end_date_d}'"""
        if part_line_id:
            where_stmt_manual += f" AND tpl.RxNo = '{part_line_id}'"
        else:
            if len(line) > 0:
                where_stmt_manual += f""" AND Code IN ({",".join(line_code)})"""
            if part_no:
                where_stmt_manual += f" AND PartNo = '{part_no}'"
            if process_name:
                where_stmt_manual += f" AND Process = '{process_name}'"
        res_manual = self.crud.get_prod_qty_manual(
            where_stmt=where_stmt_manual, db=db_ms, type_=type_
        )

        where_stmt_auto = f"""AND ac.LineCode IN ({",".join(line_code)})
                        AND ShiftNo IN {shift_auto}
                        AND ProductionDate BETWEEN '{start_date}' AND '{end_date}'"""
        res_auto = self.crud.get_prod_qty_auto(
            where_stmt=where_stmt_auto, db=db_my, type_=type_
        )
        return_list = []
        for rm in res_manual:
            key_index = rm._key_to_index
            return_list.append(
                ProductionQty(
                    production_date=f'{rm[key_index["ProductionDate"]]}',
                    plan_val=0,
                    actual_val=rm[key_index["ActualVal"]],
                )
            )
        for idx, rl in enumerate(return_list):
            date = rl.production_date
            act_val = rl.actual_val
            if act_val == 0:
                for ra in res_auto:
                    key_index = ra._key_to_index
                    d = ra[key_index["ProductionDate"]]
                    if date == d:
                        return_list[idx].plan_val = ra[key_index["PlanVal"]]
                        return_list[idx].actual_val = ra[key_index["ActualVal"]] or 0

        return return_list

    async def get_prod_qty_acc(
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
        start_date, end_date = get_month_start_end(date_obj=date_time, type=type)
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
                        AND ProductionDate BETWEEN '{start_date}' AND '{date_time}'"""
        res = self.crud.get_prod_qty_acc(where_stmt=where_stmt, db=db)
        # return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list = ProductionQtyAcc(
                # production_date=f'{r[key_index["ProductionDate"]]}',
                start_date=start_date.strftime("%Y-%m-%d"),
                end_date=date_time.strftime("%Y-%m-%d"),
                plan_val=r[key_index["PlanVal"]],
                actual_val=r[key_index["ActualVal"]],
            )
            print("return_list:", return_list)
        return return_list
