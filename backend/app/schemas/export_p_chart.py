from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Defect_Graph:
    def __init__(self, id, defect_name, value):
        self.id = id
        self.defect_name = defect_name
        self.value = value

    def to_dict(self):
        return {
            "id": self.id,
            "defect_name": self.defect_name,
            "value": self.value
        }


class Defect_Graph ( BaseModel ) :
    id: int | None = None
    defect_name: str | None = None
    value: List [ float ] | None = None


