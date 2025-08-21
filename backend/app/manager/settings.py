from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from typing import List
from dotenv import load_dotenv
import requests
import json
import os
from app.schemas.settings import (
    Calendar,
    GroupParts,
    Line,
    LinePartProcess,
    LinePartProcesses,
    OrganizeLevel,
    Part,
    PartLine,
    LinePart,
    PartSub,
    Position,
    Process,
    ProcessLine,
    ProcessLineSection,
    ProcessRecieve,
    Section,
    Symbol,
    LineSection,
    SubLines,
)
from app.crud import SettingsCRUD
from app.functions import is_empty_or_none
from app.utils.logger import get_logger

logger = get_logger(__name__)


class SettingsManager:
    def __init__(self):
        self.crud = SettingsCRUD()
        self.API_KEY = os.environ.get("API_KEY")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")

    async def get_calendars(
        self,
        date: str | None = None,
        date_range: List[str] | None = None,
        db: AsyncSession = None,
    ):
        where_stmt = ""
        if date:
            where_stmt += f" AND date = '{date}'"
        if date_range and len(date_range) > 0:
            where_stmt += f" AND date BETWEEN '{date_range[0]}' AND '{date_range[1]}'"

        res = await self.crud.get_calendars(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Calendar(
                    date=f'{r[key_index["date"]]}',
                    is_workday=r[key_index["is_workday"]],
                    manufacturing_date=r[key_index["manufacturing_date"]],
                    production_date=r[key_index["production_date"]],
                    production_week=r[key_index["production_week"]],
                    manufacturing_quarter=r[key_index["manufacturing_quarter"]],
                    fiscal_year=r[key_index["fiscal_year"]],
                    fiscal_month=r[key_index["fiscal_month"]],
                    day_shift=r[key_index["day_shift"]],
                    night_shift=r[key_index["night_shift"]],
                )
            )
        return return_list

    async def get_group_parts(self, db: AsyncSession = None):
        res = await self.crud.get_group_parts(db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                GroupParts(
                    group_id=r[key_index["group_id"]],
                    group_name=r[key_index["group_name"]],
                    group_type=r[key_index["group_type"]],
                    part_no=r[key_index["part_no"]],
                )
            )
        return return_list

    async def get_lines(
        self,
        line_id: List[int] | None = None,
        rx_only: bool = False,
        db: AsyncSession = None,
    ):
        where_stmt = ""
        if not is_empty_or_none(line_id):
            if len(line_id) == 1:
                where_stmt += f" AND line_id = {line_id[0]}"
            else:
                where_stmt += f" AND line_id IN {tuple(line_id)}"
        if rx_only:
            where_stmt += f" AND line_code_rx IS NOT NULL"
        res = await self.crud.get_lines(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Line(
                    line_id=r[key_index["line_id"]],
                    line_name=r[key_index["line_name"]],
                    line_fullname=r[key_index["line_fullname"]],
                    line_code=r[key_index["line_code"]],
                    work_center_code=r[key_index["work_center_code"]],
                    process_code=r[key_index["process_code"]],
                    line_group=r[key_index["line_group"]],
                    group_type=r[key_index["group_type"]],
                    section_id=r[key_index["section_id"]],
                    section_line=r[key_index["section_line"]],
                    line_code_rx=r[key_index["line_code_rx"]],
                )
            )
        return return_list

    async def get_lines_by_org(
        self, org_name: str, org_level: str | None, db: AsyncSession = None
    ):
        if org_level:
            if org_level == "section":
                where_stmt = (
                    f" AND CONCAT(section_code, ' - ', sub_section_name) = '{org_name}'"
                )
            elif org_level == "department":
                # ? department contains department & section data
                where_stmt = f""" AND (department = '{org_name}'
                                OR section_name = '{org_name}')"""
            else:
                where_stmt = f" AND {org_level} = '{org_name}'"
        else:
            where_stmt = f""" AND (division = '{org_name}'
                            OR department = '{org_name}'
                            OR sub_department = '{org_name}'
                            OR section_name = '{org_name}'
                            OR CONCAT(section_code, ' - ', sub_section_name) = '{org_name}')"""
        res = await self.crud.get_line_sections(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                LineSection(
                    line_id=r[key_index["line_id"]],
                    line_name=r[key_index["line_name"]],
                    line_fullname=r[key_index["line_fullname"]],
                    line_code=r[key_index["line_code"]],
                    work_center_code=r[key_index["work_center_code"]],
                    process_code=r[key_index["process_code"]],
                    line_group=r[key_index["line_group"]],
                    group_type=r[key_index["group_type"]],
                    section_id=r[key_index["section_id"]],
                    section_line=r[key_index["section_line"]],
                    line_code_rx=r[key_index["line_code_rx"]],
                    section_code=r[key_index["section_code"]],
                    section_name=r[key_index["section_name"]],
                    sub_section_name=r[key_index["sub_section_name"]],
                    department=r[key_index["department"]],
                    sub_department=r[key_index["sub_department"]],
                    division=r[key_index["division"]],
                    company=r[key_index["company"]],
                    plant=r[key_index["plant"]],
                )
            )
        return return_list

    async def get_line_part_process(self, db: AsyncSession = None):
        res = await self.crud.get_line_part_process(db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                LinePartProcess(
                    line_id=r[key_index["line_id"]],
                    line_name=f"{r[key_index['section_code']]} - {r[key_index['line_name']]}",
                    part_no=r[key_index["part_no"]],
                    process_id=r[key_index["process_id"]],
                    process_name=r[key_index["process_name"]],
                )
            )
        return return_list

    async def get_line_part_processes(
        self,
        line_id: List[int] | None = None,
        part_no: List[str] | None = None,
        process_id: List[int] | None = None,
        db: AsyncSession = None,
    ):
        where_stmt = ""
        cond = []
        if not is_empty_or_none(line_id):
            if len(line_id) == 1:
                lid = f"line_id = {line_id[0]}"
            else:
                lid = f"line_id IN {tuple(line_id)}"
            cond.append(lid)
        if not is_empty_or_none(part_no):
            part = f"['%{part_no[0].lower()}%'"
            for p in part_no:
                part = part + f",'%{p.lower()}%'"
            part += "]"
            pno = f"LOWER(part_no) LIKE ANY(ARRAY{part})"
            cond.append(pno)
        if not is_empty_or_none(process_id):
            if len(process_id) == 1:
                pid = f"process_id && '{{{process_id[0]}}}'".replace("[", "").replace(
                    "]", ""
                )
            else:
                pid = f"process_id && '{{{process_id}}}'".replace("[", "").replace(
                    "]", ""
                )
            cond.append(pid)
        if len(cond) > 0:
            where_stmt = "AND " + " AND ".join(cond)

        res = await self.crud.get_line_part_processes(where_stmt=where_stmt, db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                LinePartProcesses(
                    line_id=r[key_index["line_id"]],
                    part_no=r[key_index["part_no"]],
                    process_id=r[key_index["process_id"]],
                )
            )
        return return_list

    async def post_line_part_processes(
        self,
        line_id: int | None,
        part_no: str | None,
        db: AsyncSession = None,
    ):
        if not line_id or not part_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        await self.crud.post_line_part_processes(
            line_id=line_id, part_no=part_no, db=db
        )
        return

    async def update_line_part_processes(
        self,
        line_id: int | None,
        part_no: str | None,
        process_id: List[int] | None,
        db: AsyncSession = None,
    ):
        if not line_id or not part_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        if is_empty_or_none(process_id):
            process = f"'{{}}'"
        else:
            process = f"ARRAY{process_id}"

        await self.crud.update_line_part_processes(
            line_id=line_id, part_no=part_no, process=process, db=db
        )
        return

    async def delete_line_part_processes_by_line_and_part(
        self, line_id: int, part_no: str, db: AsyncSession = None
    ):
        if not line_id or not part_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        await self.crud.delete_line_part_processes_by_line_and_part(
            line_id=line_id, part_no=part_no, db=db
        )
        return

    async def get_line_sections(self, db: AsyncSession = None):
        res = await self.crud.get_line_sections(db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                LineSection(
                    line_id=r[key_index["line_id"]],
                    line_name=r[key_index["line_name"]],
                    line_fullname=r[key_index["line_fullname"]],
                    line_code=r[key_index["line_code"]],
                    work_center_code=r[key_index["work_center_code"]],
                    process_code=r[key_index["process_code"]],
                    line_group=r[key_index["line_group"]],
                    group_type=r[key_index["group_type"]],
                    section_id=r[key_index["section_id"]],
                    section_line=r[key_index["section_line"]],
                    line_code_rx=r[key_index["line_code_rx"]],
                    section_code=r[key_index["section_code"]],
                    section_name=r[key_index["section_name"]],
                    sub_section_name=r[key_index["sub_section_name"]],
                    department=r[key_index["department"]],
                    sub_department=r[key_index["sub_department"]],
                    division=r[key_index["division"]],
                    company=r[key_index["company"]],
                    plant=r[key_index["plant"]],
                )
            )
        return return_list

    async def get_organize_level(
        self, org_level: str | None = None, db: AsyncSession = None
    ):
        where_stmt = ""
        if org_level:
            where_stmt = f"WHERE org_level = '{org_level}'"
        res = await self.crud.get_organize_level(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                OrganizeLevel(
                    org_level=r[key_index["org_level"]],
                    org_name=r[key_index["org_name"]],
                )
            )
        return return_list

    async def get_parts(self, part_no: str | None, db: AsyncSession = None):
        where_stmt = ""
        if part_no:
            where_stmt = f" AND part_no = '{part_no}'"
        res = await self.crud.get_parts(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Part(
                    part_id=r[key_index["part_id"]],
                    part_no=r[key_index["part_no"]],
                    part_no_suffix=r[key_index["part_no_suffix"]],
                    part_name=r[key_index["part_name"]],
                    part_model=r[key_index["part_model"]],
                    part_type=r[key_index["part_type"]],
                    product_id=r[key_index["product_id"]],
                )
            )
        return return_list

    async def get_parts_distinct_part_no(
        self, part_no: str | None, db: AsyncSession = None
    ):
        where_stmt = ""
        if part_no:
            where_stmt = f" AND part_no = '{part_no}'"
        res = await self.crud.get_parts_distinct(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Part(
                    part_id=r[key_index["part_id"]],
                    part_no=r[key_index["part_no"]],
                    part_no_suffix=r[key_index["part_no_suffix"]],
                    part_name=r[key_index["part_name"]],
                    part_model=r[key_index["part_model"]],
                    part_type=r[key_index["part_type"]],
                    product_id=r[key_index["product_id"]],
                )
            )
        return return_list

    async def get_parts_by_line(self, line_id: int, db: AsyncSession = None):
        where_stmt = f" AND line_id = {line_id}"
        res = await self.crud.get_line_parts(where_stmt=where_stmt, db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                PartLine(
                    part_id=r[key_index["part_id"]],
                    part_no=r[key_index["pno"]],
                    part_no_suffix=r[key_index["part_no_suffix"]],
                    part_name=r[key_index["part_name"]],
                    part_model=r[key_index["part_model"]],
                    part_type=r[key_index["part_type"]],
                    product_id=r[key_index["product_id"]],
                    line_id=r[key_index["line_id"]],
                )
            )
        return return_list

    async def get_sub_lines_by_partline(
        self, line_code_rx: str, part_no: str, db: AsyncSession = None
    ):
        # where_stmt = f" AND line_id = {line_id}"
        # res = await self.crud.get_line_parts(where_stmt=where_stmt, db=db)
        # return_list = []
        # try:
        ## get list_line_id, list_line_name from api
        endpoint = (
            self.BACKEND_URL_SERVICE
            + f"/api/settings/sub_lines?line_code_rx={line_code_rx}&part_no={part_no}"
        )
        headers = {"X-API-Key": self.API_KEY}
        sub_lines = requests.get(endpoint, headers=headers).json()["sub_lines"]

        # except Exception as e:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail=f"because {e}",
        #     )
        # for r in res:
        # key_index = r._key_to_index
        # return_list.append(SubLines(part_no="aa", process="ss", rxno_part="123"))
        return sub_lines

    async def get_parts_by_org(
        self, org_name: str, org_level: str | None, db: AsyncSession = None
    ):
        if org_level:
            if org_level == "section":
                where_stmt = (
                    f" AND CONCAT(section_code, ' - ', sub_section_name) = '{org_name}'"
                )
            elif org_level == "department":
                # ? department contains department & section data
                where_stmt = f""" AND (department = '{org_name}'
                                OR section_name = '{org_name}')"""
            else:
                where_stmt = f" AND {org_level} = '{org_name}'"
        else:
            where_stmt = f""" AND (division = '{org_name}'
                            OR department = '{org_name}'
                            OR sub_department = '{org_name}'
                            OR section_name = '{org_name}'
                            OR CONCAT(section_code, ' - ', sub_section_name) = '{org_name}')"""
        res = await self.crud.get_parts_by_org(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                LinePart(
                    line_id=r[key_index["line_id"]],
                    part_no=r[key_index["part_no"]],
                )
            )
        return return_list

    async def get_parts_substring_by_part_no(
        self, part_no: List[str], db: AsyncSession = None
    ):
        where_stmt = f" AND part_no_substring LIKE ANY(ARRAY { part_no })"
        res = await self.crud.get_parts_substring_by_part_no(
            where_stmt=where_stmt, db=db
        )
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                PartSub(
                    part_id=r[key_index["part_id"]],
                    part_no=r[key_index["part_no"]],
                    part_no_suffix=r[key_index["part_no_suffix"]],
                    part_name=r[key_index["part_name"]],
                    part_model=r[key_index["part_model"]],
                    part_type=r[key_index["part_type"]],
                    product_id=r[key_index["product_id"]],
                    part_no_substring=r[key_index["part_no_substring"]],
                )
            )
        return return_list

    async def get_positions(self, db: AsyncSession = None):
        res = await self.crud.get_positions(db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Position(
                    position_id=r[key_index["position_id"]],
                    position_name=r[key_index["position_name"]],
                    position_shortname=r[key_index["position_shortname"]],
                    position_level=r[key_index["position_level"]],
                    position_group=r[key_index["position_group"]],
                )
            )
        return return_list

    async def get_processes(self, process_id: int | None, db: AsyncSession = None):
        where_stmt = ""
        if process_id:
            where_stmt = f" AND process_id = {process_id}"
        res = await self.crud.get_processes(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Process(
                    process_id=r[key_index["process_id"]],
                    process_name=r[key_index["process_name"]],
                    process_type=r[key_index["process_type"]],
                    line_id=r[key_index["line_id"]],
                )
            )
        return return_list

    async def post_processes(self, data: List[ProcessRecieve], db: AsyncSession = None):
        if is_empty_or_none(data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
            )
        pre_value = []
        for idx, p in enumerate(data):
            pre_value.append(
                f"""SELECT COALESCE(MAX(id),0) + {idx+1}, COALESCE(MAX(process_id),0) + {idx+1},'{p.process_name}',{p.line_id}, NOW() FROM process"""
            )
        value = ",".join(tuple(pre_value))
        await self.crud.post_processes(value=value, db=db)
        return

    async def delete_process_by_id(self, process_id: int, db: AsyncSession = None):
        await self.crud.delete_process_by_id(process_id=process_id, db=db)
        return

    async def get_process_line(
        self,
        section_code: List[str] | None,
        line_id: List[int] | None,
        process_id: List[int] | None,
        process_name: List[str] | None,
        db: AsyncSession = None,
    ):
        where_stmt = ""
        cond = []
        if not is_empty_or_none(section_code):
            sect = [f"'{str(section)}'" for section in section_code]
            sc = f"""section_code IN ({",".join(sect)})"""
            cond.append(sc)
        if not is_empty_or_none(line_id):
            if len(line_id) == 1:
                lid = f"line_id = {line_id[0]}"
            else:
                lid = f"line_id IN {tuple(line_id)}"
            cond.append(lid)
        if not is_empty_or_none(process_id):
            if len(process_id) == 1:
                pid = f"process_id = {process_id[0]}"
            else:
                pid = f"process_id IN {tuple(process_id)}"
            cond.append(pid)
        if not is_empty_or_none(process_name):
            proc = [f"'{str(process)}'" for process in process_name]
            pro = f"""process_name IN ({",".join(proc)})"""
            cond.append(pro)
        if len(cond) > 0:
            where_stmt = f""" AND ({" OR ".join(cond)})"""
        res = await self.crud.get_process_line(where_stmt=where_stmt, db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                ProcessLine(
                    process_id=r[key_index["process_id"]],
                    process_name=r[key_index["process_name"]],
                    process_type=r[key_index["process_type"]],
                    line_id=r[key_index["line_id"]],
                    line_name=r[key_index["line_name"]],
                    line_fullname=r[key_index["line_fullname"]],
                    line_code=r[key_index["line_code"]],
                    work_center_code=r[key_index["work_center_code"]],
                    process_code=r[key_index["process_code"]],
                    line_group=r[key_index["line_group"]],
                    group_type=r[key_index["group_type"]],
                    section_id=r[key_index["section_id"]],
                    section_line=r[key_index["section_line"]],
                    line_code_rx=r[key_index["line_code_rx"]],
                )
            )
        return return_list

    async def get_process_line_section(
        self,
        section_code: List[str] | None,
        line_id: List[int] | None,
        process_id: List[int] | None,
        process_name: List[str] | None,
        db: AsyncSession = None,
    ):
        where_stmt = ""
        cond = []
        if not is_empty_or_none(section_code):
            sect = [f"'{str(section)}'" for section in section_code]
            sc = f"""section_code IN ({",".join(sect)})"""
            cond.append(sc)
        if not is_empty_or_none(line_id):
            if len(line_id) == 1:
                lid = f"line_id = {line_id[0]}"
            else:
                lid = f"line_id IN {tuple(line_id)}"
            cond.append(lid)
        if not is_empty_or_none(process_id):
            if len(process_id) == 1:
                pid = f"process_id = {process_id[0]}"
            else:
                pid = f"process_id IN {tuple(process_id)}"
            cond.append(pid)
        if not is_empty_or_none(process_name):
            proc = [f"'{str(process)}'" for process in process_name]
            pro = f"""process_name IN ({",".join(proc)})"""
            cond.append(pro)
        if len(cond) > 0:
            where_stmt = f""" AND ({" OR ".join(cond)})"""
        res = await self.crud.get_process_line_section(where_stmt=where_stmt, db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                ProcessLineSection(
                    process_id=r[key_index["process_id"]],
                    process_name=r[key_index["process_name"]],
                    process_type=r[key_index["process_type"]],
                    line_id=r[key_index["line_id"]],
                    line_name=r[key_index["line_name"]],
                    line_fullname=r[key_index["line_fullname"]],
                    line_code=r[key_index["line_code"]],
                    work_center_code=r[key_index["work_center_code"]],
                    process_code=r[key_index["process_code"]],
                    line_group=r[key_index["line_group"]],
                    group_type=r[key_index["group_type"]],
                    section_id=r[key_index["section_id"]],
                    section_line=r[key_index["section_line"]],
                    line_code_rx=r[key_index["line_code_rx"]],
                    section_code=r[key_index["section_code"]],
                    section_name=r[key_index["section_name"]],
                    sub_section_name=r[key_index["sub_section_name"]],
                    department=r[key_index["department"]],
                    sub_department=r[key_index["sub_department"]],
                    division=r[key_index["division"]],
                    company=r[key_index["company"]],
                    plant=r[key_index["plant"]],
                )
            )
        return return_list

    async def get_sections(self, indirect_only: bool = False, db: AsyncSession = None):
        where_stmt = ""
        if indirect_only:
            where_stmt = "AND group_type = 'IND'"
        res = await self.crud.get_sections(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Section(
                    section_id=r[key_index["section_id"]],
                    section_code=str(r[key_index["section_code"]]),
                    section_name=r[key_index["section_name"]],
                    sub_section_name=r[key_index["sub_section_name"]],
                    section_code_name=r[key_index["section_code_name"]],
                    department=r[key_index["department"]],
                    sub_department=r[key_index["sub_department"]],
                    division=r[key_index["division"]],
                    company=r[key_index["company"]],
                    plant=r[key_index["plant"]],
                    group_type=r[key_index["group_type"]],
                )
            )
        return return_list

    async def get_sections_by_org(
        self, org_name: str, org_level: str | None, db: AsyncSession = None
    ):
        if org_level:
            if org_level == "department":
                # ? department contains department & section data
                where_stmt = f""" AND (department = '{org_name}'
                                OR section_name = '{org_name}')"""
            else:
                where_stmt = f" AND {org_level} = '{org_name}'"
        else:
            where_stmt = f""" AND (division = '{org_name}'
                            OR department = '{org_name}'
                            OR sub_department = '{org_name}'
                            OR section_name = '{org_name}')"""
        res = await self.crud.get_sections(db=db, where_stmt=where_stmt)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Section(
                    section_id=r[key_index["section_id"]],
                    section_code=str(r[key_index["section_code"]]),
                    section_name=r[key_index["section_name"]],
                    sub_section_name=r[key_index["sub_section_name"]],
                    section_code_name=r[key_index["section_code_name"]],
                    department=r[key_index["department"]],
                    sub_department=r[key_index["sub_department"]],
                    division=r[key_index["division"]],
                    company=r[key_index["company"]],
                    plant=r[key_index["plant"]],
                    group_type=r[key_index["group_type"]],
                )
            )
        return return_list

    async def get_symbols(self, db: AsyncSession = None):
        res = await self.crud.get_symbols(db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                Symbol(
                    sc_symbol_id=r[key_index["sc_symbol_id"]],
                    character=r[key_index["character"]],
                    shape=r[key_index["shape"]],
                    remark=r[key_index["remark"]],
                )
            )
        return return_list
