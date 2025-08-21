from pydantic import BaseModel
from typing import List


class General_Information(BaseModel):
    month: str | None = None
    line_name: str | None = None
    part_no: str | None = None
    shift: str | None = None
    process: str | None = None
    sub_line: str | None = None


class General_Information_Result(General_Information):
    part_name: str | None = None
    target_control: float | None = None
    p_last_month: float | None = None
    n_bar: float | None = None
    p_bar: float | None = None
    k: float | None = None
    uclp: float | None = None
    lclp: float | None = None
    id: int | None = None


class Daily_Approval(General_Information):
    date: str | None = None
    user_uuid: str | None = None
    user_name: str | None = None


class Daily_Approval_Response(BaseModel):
    daily_approval: Daily_Approval


class Weekly_Approval(General_Information):
    date: str | None = None
    user_uuid: str | None = None
    user_name: str | None = None


class Weekly_Approval_Response(BaseModel):
    weekly_approval: Weekly_Approval


class BiWeekly_Approval(General_Information):
    date: str | None = None
    user_uuid: str | None = None
    user_name: str | None = None


class BiWeekly_Approval_Response(BaseModel):
    biweekly_approval: BiWeekly_Approval
