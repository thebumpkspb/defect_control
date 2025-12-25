from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text


class ProductionsCRUD:
    def __init__(self):
        pass

    def get_prod_qty_auto(self, db: AsyncSession, where_stmt: str | None = None):
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

    def get_prod_qty_manual(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT MAX(tpa.ProductionDate) ProductionDate, 
                    SUM(tpa.Value) ActualVal
                FROM dbo.tbPartLine tpl 
                LEFT JOIN dbo.tbLine tl on tpl.RxNo_Line = tl.RxNo
                LEFT JOIN dbo.tbPart tp on tpl.RxNo_Part = tp.RxNo
                LEFT JOIN dbo.tbProductionActual tpa on tpl.RxNo_Line = tpa.RxNo_Line and tpl.RxNo_Part = tpa.RxNo_Part and tpl.Process = tpa.Process
                WHERE ValueType = 'OK' and tpl.ExpireDate is null
                {where_stmt if where_stmt is not None else ''}
                GROUP BY ProductionDate
                ORDER BY ProductionDate
                """
        rs = db.execute(text(stmt))
        return rs

    def get_prod_qty_acc(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT -- MAX(ProductionDate) ProductionDate,
                    SUM(PlanVal) PlanVal,
                    SUM(ActualVal) ActualVal
                FROM actual_current ac
                WHERE RxNo IS NOT NULL
                {where_stmt if where_stmt is not None else ''}
                """
        rs = db.execute(text(stmt))
        return rs
