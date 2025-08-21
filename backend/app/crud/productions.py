from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text


class ProductionsCRUD:
    def __init__(self):
        pass

    def get_prod_qty(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT MAX(ProductionDate) ProductionDate,
                    SUM(PlanVal) PlanVal,
                    SUM(ActualVal) ActualVal
                FROM actual_current ac
                WHERE RxNo IS NOT NULL
                {where_stmt if where_stmt is not None else ''}
                GROUP BY ProductionDate
                ORDER BY ProductionDate"""
        rs = db.execute(text(stmt))
        return rs
