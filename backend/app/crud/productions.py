from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text


class ProductionsCRUD:
    def __init__(self):
        pass

    def get_prod_qty_auto(
        self, db: AsyncSession, type_: str = "Daily", where_stmt: str | None = None
    ):
        if type_ == "Daily":
            stmt = f"""SELECT MAX(ProductionDate) ProductionDate,
                        SUM(PlanVal) PlanVal,
                        SUM(ActualVal) ActualVal
                    FROM actual_current ac
                    WHERE RxNo IS NOT NULL
                    {where_stmt if where_stmt is not None else ''}
                    GROUP BY ProductionDate
                    ORDER BY ProductionDate"""
        elif type_ == "Monthly":
            stmt = f"""SELECT MONTH(ProductionDate) ProductionDate,
                        SUM(PlanVal) PlanVal,
                        SUM(ActualVal) ActualVal
                    FROM actual_current ac
                    WHERE RxNo IS NOT NULL
                    {where_stmt if where_stmt is not None else ''}
                    GROUP BY MONTH(ProductionDate)
                    ORDER BY MONTH(ProductionDate)"""

        elif type_ == "Yearly":
            stmt = f"""SELECT YEAR(ProductionDate) ProductionDate,
                        SUM(PlanVal) PlanVal,
                        SUM(ActualVal) ActualVal
                    FROM actual_current ac
                    WHERE RxNo IS NOT NULL
                    {where_stmt if where_stmt is not None else ''}
                    GROUP BY YEAR(ProductionDate)
                    ORDER BY YEAR(ProductionDate)"""
        rs = db.execute(text(stmt))
        return rs

    def get_prod_qty_manual(
        self, db: AsyncSession, type_: str = "Daily", where_stmt: str | None = None
    ):
        if type_ == "Daily":
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
        if type_ == "Monthly":
            stmt = f"""SELECT MONTH(tpa.ProductionDate) ProductionDate, 
                        SUM(tpa.Value) ActualVal
                    FROM dbo.tbPartLine tpl 
                    LEFT JOIN dbo.tbLine tl on tpl.RxNo_Line = tl.RxNo
                    LEFT JOIN dbo.tbPart tp on tpl.RxNo_Part = tp.RxNo
                    LEFT JOIN dbo.tbProductionActual tpa on tpl.RxNo_Line = tpa.RxNo_Line and tpl.RxNo_Part = tpa.RxNo_Part and tpl.Process = tpa.Process
                    WHERE ValueType = 'OK' and tpl.ExpireDate is null
                    {where_stmt if where_stmt is not None else ''}
                    GROUP BY MONTH(ProductionDate)
                    ORDER BY MONTH(ProductionDate)
                    """
        if type_ == "Yearly":
            stmt = f"""SELECT CASE   
                                    WHEN MONTH(tpa.ProductionDate) >= 4   
                                        THEN YEAR(tpa.ProductionDate)          
                                    ELSE YEAR(tpa.ProductionDate) - 1           
                                END AS ProductionDate,  
                        SUM(tpa.Value) ActualVal
                    FROM dbo.tbPartLine tpl 
                    LEFT JOIN dbo.tbLine tl on tpl.RxNo_Line = tl.RxNo
                    LEFT JOIN dbo.tbPart tp on tpl.RxNo_Part = tp.RxNo
                    LEFT JOIN dbo.tbProductionActual tpa on tpl.RxNo_Line = tpa.RxNo_Line and tpl.RxNo_Part = tpa.RxNo_Part and tpl.Process = tpa.Process
                    WHERE ValueType = 'OK' and tpl.ExpireDate is null
                    {where_stmt if where_stmt is not None else ''}
                    GROUP BY CASE   
                                WHEN MONTH(tpa.ProductionDate) >= 4   
                                    THEN YEAR(tpa.ProductionDate)  
                                ELSE YEAR(tpa.ProductionDate) - 1  
                            END
                    ORDER BY ProductionDate
                    """
        print("stmt:", stmt)
        rs = db.execute(text(stmt))
        return rs

    def get_prod_qty_yearly_manual(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
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
