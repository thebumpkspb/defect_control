import asyncpg.pgproto.pgproto as pgproto
import calendar
import inspect
import os
import pytz
import requests
from dataclasses import is_dataclass, asdict
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from starlette import status
from typing import Any, List, Dict, get_origin, get_args, Union
from dotenv import load_dotenv
import re

load_dotenv()
X_API_KEY = APIKeyHeader(name="X-API-Key")
API_KEY = os.environ.get("API_KEY")


def toArray(input: Any) -> List:
    # input : result from AsyncSession.execute(stmt)
    rs = input.scalars().all()
    return rs


def toArrayWithKey(input: Any, except_column: List[str] = []) -> list:
    tz = pytz.timezone("Asia/Bangkok")
    # query with raw statement
    rs = [
        {
            c: (
                str(getattr(r, c))
                if isinstance(getattr(r, c), pgproto.UUID)
                else (
                    getattr(r, c)
                    .replace(tzinfo=pytz.utc)
                    .astimezone(tz)
                    .strftime("%Y-%m-%d %H:%M:%S.%f")
                    if isinstance(getattr(r, c), datetime)
                    else getattr(r, c)
                )
            )
            for c in r.keys()
            if c not in except_column
        }
        for r in input
    ]
    return rs


def toDictByColumnId(input: list, id_column: str) -> dict:
    output = {}
    for e in input:  # each element in input list
        if id_column not in e:
            return
        e_output = {}
        for k, v in e.items():  # each key, value in element.items()
            if k != id_column:
                e_output = {**e_output, k: v}
        output = {**output, e[id_column]: e_output}
    return output


def toDictArrayByColumnId(
    input: list, id_column: str, except_array_columns: List[str] = []
) -> dict:
    output = {}
    for e in input:
        if id_column not in e:
            return
        except_output = {}
        e_output = {}
        for k, v in e.items():
            if k != id_column and k not in except_array_columns:
                e_output = {**e_output, k: v}
            elif k != id_column and k in except_array_columns:
                except_output = {**except_output, k: v}
        if e[id_column] in output:
            output = {
                **output,
                e[id_column]: {
                    **except_output,
                    "data": [*output[e[id_column]]["data"], e_output],
                },
            }
        else:
            output = {**output, e[id_column]: {**except_output, "data": [e_output]}}
    return output


def api_key_auth(x_api_key: str = Depends(X_API_KEY)):
    # this function is used to validate X-API-KEY in request header
    # if the sent X-API-KEY in header is not existed in the config file
    #   reject access
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Forbidden"
        )


def get_month_start_end(date: datetime):
    start_date = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    _, last_day = calendar.monthrange(date.year, date.month)
    end_date = date.replace(
        day=last_day, hour=23, minute=59, second=59, microsecond=999999
    )

    return start_date, end_date


def validate_date(date_text):
    try:
        if date_text != datetime.strptime(date_text, "%Y-%m-%d").strftime("%Y-%m-%d"):
            raise ValueError
        return True
    except ValueError:
        return False


def validate_org(org_level: str, exception: str | None = None):
    org = ["division", "department", "section", "line"]
    if exception:
        org.remove(exception)
    try:
        if org_level not in org:
            raise ValueError
        return True
    except ValueError:
        return False


def is_empty_or_none(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and len(value.strip()) == 0:
        return True
    if isinstance(value, (int, float)):
        return True
    if isinstance(value, (list, tuple)) and len(value) == 0:
        return True
    return False


def simplify_type(annotation):
    if get_origin(annotation) is Union:
        args = get_args(annotation)
        if type(None) in args:
            other_type = next(arg for arg in args if arg is not type(None))
            return f"{simplify_type(other_type)} | None"
        return " | ".join(simplify_type(arg) for arg in args)
    elif get_origin(annotation) is list:
        return f"List[{simplify_type(get_args(annotation)[0])}]"
    elif inspect.isclass(annotation):
        return annotation.__name__
    return str(annotation).replace("typing.", "")


def get_schema_dict(schema: BaseModel) -> Dict[str, Any]:
    return {
        "name": schema.__name__,
        "fields": {
            name: simplify_type(field.annotation)
            for name, field in schema.model_fields.items()
        },
    }


def obj_dict(obj):
    return obj.__dict__


def get_first_and_last_date_of_month(date):
    # Ensure the input date is a datetime object
    if isinstance(date, str):
        date = datetime.strptime(date, "%Y-%m-%d")

    # Get the year and month from the date
    year = date.year
    month = date.month

    # Get the first date of the month
    first_date = datetime(year, month, 1)

    # Get the last date of the month using calendar module
    last_day = calendar.monthrange(year, month)[
        1
    ]  # monthrange returns a tuple (weekday of first day, number of days in month)
    last_date = datetime(year, month, last_day)

    return first_date.strftime("%Y-%m-%d"), last_date.strftime("%Y-%m-%d")


def convert_month_year_to_date(month_year_str):
    # Parse the input string to extract month and year
    date_obj = datetime.strptime(month_year_str, "%B-%Y")

    # Format the date to "YYYY-MM-DD" with the first day of the month
    formatted_date = date_obj.strftime("%Y-%m-01")

    return formatted_date


def get_initials(input_string):
    # Split the input string by spaces
    words = input_string.split(" ")

    # Extract the first character from each word
    initials = [word[0] for word in words if word]

    # Join the initials with ". "
    result = ". ".join(initials) + "."

    return result


def get_week_in_month_and_year_month(date_str):
    date_obj = datetime.strptime(date_str, "%d-%B-%Y")
    first_day_of_month = date_obj.replace(day=1)
    # Week starts on Monday (weekday() Monday=0), adjust as needed
    adjusted_dom = date_obj.day + first_day_of_month.weekday()
    week_in_month = (adjusted_dom - 1) // 7  # + 1
    year_month = date_obj.strftime("%Y-%m-01")
    return week_in_month, year_month


def get_dates_from_week_in_month(week_in_month, year_month_str):
    # year_month_str in format "YYYY-MM-01"
    first_day_of_month = datetime.strptime(year_month_str, "%Y-%m-%d")
    year = first_day_of_month.year
    month = first_day_of_month.month

    # Calculate last day of month
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    last_day_of_month = (next_month - timedelta(days=1)).day

    result = []
    # Iterate over all days in month
    for day in range(1, last_day_of_month + 1):
        date_obj = datetime(year, month, day)
        # Calculate week_in_month as per your original function
        fd_of_month = date_obj.replace(day=1)
        adjusted_dom = date_obj.day + fd_of_month.weekday()
        curr_week_in_month = (adjusted_dom - 1) // 7
        if curr_week_in_month == week_in_month:
            result.append(date_obj.strftime("%Y-%m-%d"))
    return result


def get_dates_from_half_month(half, year_month_str):
    """
    half: 1 for first half (1-15), 2 for second half (16-end of month)
    year_month_str: "YYYY-MM-01" or "YYYY-MM"
    Returns: list of date strings "%d-%B-%Y"
    """
    if len(year_month_str) == 7:
        year_month_str += "-01"
    first_day_of_month = datetime.strptime(year_month_str, "%Y-%m-%d")
    year = first_day_of_month.year
    month = first_day_of_month.month

    # Get the last day of the month using calendar
    last_day = calendar.monthrange(year, month)[1]

    if half == 1:
        start_day, end_day = 1, 15
    elif half == 2:
        start_day, end_day = 16, last_day
    else:
        raise ValueError("half must be 1 or 2")

    dates = [
        datetime(year, month, day).strftime("%Y-%m-%d")
        for day in range(start_day, end_day + 1)
    ]
    return dates


def transform_approval_data(approval_type: str, data: any):
    expanded_rows = []
    if approval_type == "weekly":
        for row in data:
            # print("row:", row)
            dates = get_dates_from_week_in_month(
                int(row["week_number"]), row["year_month"]
            )
            # print("dates:", dates)
            for d in dates:
                expanded_rows.append({"date": d, "review_by_mgr": row["review_by_mgr"]})
    elif approval_type == "biweekly":
        for row in data:
            dates = get_dates_from_half_month(int(row["half_month"]), row["year_month"])
            for d in dates:
                expanded_rows.append({"date": d, "review_by_gm": row["review_by_gm"]})
    return expanded_rows


# def get_week_in_month_and_year_month(date_str):
#     date_obj = datetime.strptime(date_str, "%d-%B-%Y")
#     year, month = date_obj.year, date_obj.month

#     # Find the first day of the month
#     first_of_month = datetime(year, month, 1)
#     # Find the first Monday
#     first_monday_offset = (7 - first_of_month.weekday()) % 7
#     first_monday = first_of_month + timedelta(days=first_monday_offset)

#     if date_obj < first_monday:
#         week_in_month = 0
#     else:
#         days_diff = (date_obj - first_monday).days
#         week_in_month = 1 + days_diff // 7
#     if week_in_month > 4:
#         week_in_month = 4
#     elif week_in_month < 1:
#         week_in_month = 1
#     year_month = date_obj.strftime("%Y-%m-01")
#     return week_in_month, year_month


def get_half_month_and_year_month(date_str):
    dt = datetime.strptime(date_str, "%d-%B-%Y")
    half_month = 1 if dt.day <= 15 else 2
    year_month = dt.strftime("%Y-%m-01")
    return half_month, year_month


def chunker(seq, size):
    for i in range(0, len(seq), size):
        yield seq[i : i + size]


def get_last_day_from_month_year(month_year_str):
    dt = datetime.strptime(month_year_str, "%B-%Y")
    last_day = calendar.monthrange(dt.year, dt.month)[1]
    return last_day


def call_request(
    method: str,
    url: str,
    api_key: str,
    data: dict = None,
    accept: str = "application/json",
    headers: dict = None,
):
    if data is not None:
        if isinstance(data, BaseModel):
            data = data.model_dump()
        elif is_dataclass(data):
            data = asdict(data)
        elif isinstance(data, list):
            # Handle list of objects
            processed_items = []
            for item in data:
                if isinstance(item, BaseModel):
                    processed_items.append(item.model_dump())
                elif is_dataclass(item):
                    processed_items.append(asdict(item))
                elif hasattr(item, "__dict__"):
                    processed_items.append(item.__dict__)
                else:
                    processed_items.append(item)
            data = processed_items

    headers = {"X-API-KEY": api_key, "Accept": accept} if headers is None else headers
    if method == "GET":
        response = requests.get(url=url, headers=headers)
    elif method == "POST":
        response = requests.post(url=url, headers=headers, json=data)
    elif method == "PUT":
        response = requests.put(url=url, headers=headers, json=data)
    elif method == "DELETE":
        response = requests.delete(url=url, headers=headers)
    return response


def parse_defect_string(s):
    # Remove surrounding parentheses
    s = s.strip()
    if s.startswith("(") and s.endswith(")"):
        s = s[1:-1]
    # Regex to split at commas only at the top level (not inside brackets)
    parts = re.split(r", (?=\w+=)", s)
    d = {}
    for part in parts:
        key, value = part.split("=", 1)
        key = key.strip()
        value = value.strip()
        # Handle strings with single or double quotes
        if (value.startswith("'") and value.endswith("'")) or (
            value.startswith('"') and value.endswith('"')
        ):
            value = value[1:-1]
        # Handle lists
        elif value.startswith("[") and value.endswith("]"):
            value = eval(value)  # Only safe if you trust your input!
        # Try to convert to int or float
        else:
            try:
                value = int(value)
            except ValueError:
                try:
                    value = float(value)
                except ValueError:
                    pass
        d[key] = value
    return d
