from pydantic import BaseModel
from typing import List


class ProductionQty(BaseModel):
    production_date: str | None = None
    plan_val: int | None = None
    actual_val: int | None = None


class ProductionQtyResponse(BaseModel):
    prod_qty: List[ProductionQty]


class ProductionQtyAcc(BaseModel):
    start_date: str | None = None
    end_date: str | None = None
    plan_val: int | None = None
    actual_val: int | None = None


class ProductionQtyAccResponse(BaseModel):
    prod_qty_acc: ProductionQtyAcc
