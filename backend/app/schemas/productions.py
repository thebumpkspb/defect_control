from pydantic import BaseModel
from typing import List


class ProductionQty(BaseModel):
    production_date: str | None = None
    plan_val: int | None = None
    actual_val: int | None = None


class ProductionQtyResponse(BaseModel):
    prod_qty: List[ProductionQty]
