import datetime
from pydantic import BaseModel
from typing import List


class Calendar(BaseModel):
    date: str | None = None
    is_workday: bool = True
    manufacturing_date: str | None = None
    production_date: str | None = None
    production_week: str | None = None
    manufacturing_quarter: str | None = None
    fiscal_year: str | None = None
    fiscal_month: str | None = None
    day_shift: str | None = None
    night_shift: str | None = None


class CalendarResponse(BaseModel):
    calendars: List[Calendar]


class Equipment(BaseModel):
    equipment_id: int | None = None
    equipment_name: str | None = None
    equipment_no: str | None = None
    equipment_type: str | None = None
    equipment_maker: str | None = None
    equipment_model: str | None = None
    maint_interval: str | None = None
    last_maint: datetime.datetime | None = None
    line_id: int | None = None
    section_id: int | None = None
    registered_date: datetime.datetime | None = None


class EquipmentResponse(BaseModel):
    equipments: List[Equipment]


class GroupParts(BaseModel):
    group_id: int | None = None
    group_name: str | None = None
    group_type: str | None = None
    part_no: List[str] = []


class GroupPartsResponse(BaseModel):
    groups: List[GroupParts]


class Line(BaseModel):
    line_id: int | None = None
    line_name: str | None = None
    line_fullname: str | None = None
    line_code: str | None = None
    work_center_code: str | None = None
    process_code: str | None = None
    line_group: str | None = None
    group_type: str | None = None
    section_id: int | None = None
    section_line: str | None = None
    line_code_rx: str | None = None


class LineResponse(BaseModel):
    lines: List[Line]


class LinePartProcess(BaseModel):
    line_id: int | None = None
    line_name: str | None = None
    part_no: str | None = None
    process_id: int | None = None
    process_name: str | None = None


class LinePartProcessResponse(BaseModel):
    data: List[LinePartProcess]


class LinePartProcesses(BaseModel):
    line_id: int | None = None
    part_no: str | None = None
    process_id: List[int | None] = []


class LinePartProcessesResponse(BaseModel):
    data: List[LinePartProcesses]


class LinePartProcessesReceive(BaseModel):
    line_id: int | None = None
    part_no: str | None = None
    process_id: List[int] | None = None


class OrganizeLevel(BaseModel):
    org_level: str | None = None
    org_name: str | None = None
    line_id: int | None = None
    section_id: int | None = None
    section_code: str | None = None
    upper_level: List[str] | None = None
    group_type: str | None = None


class OrganizeLevelResponse(BaseModel):
    data: List[OrganizeLevel]


class Part(BaseModel):
    part_id: int | None = None
    part_no: str | None = None
    part_no_suffix: str | None = None
    part_name: str | None = None
    part_model: str | None = None
    part_type: str | None = None
    product_id: int | None = None


class PartResponse(BaseModel):
    parts: List[Part]


class PartLine(Part):
    line_id: int | None = None


class PartLineResponse(BaseModel):
    parts: List[PartLine]


class SubLines(BaseModel):
    line_code_rx: str | None = None
    part_no: str | None = None
    process: str | None = None
    rxno_part: str | None = None


class SubLinesResponse(BaseModel):
    sub_lines: List[SubLines]


class LinePart(BaseModel):
    line_id: int | None = []
    part_no: List[str] = []


class LinePartResponse(BaseModel):
    data: List[LinePart]


class PartSub(Part):
    part_no_substring: str | None = None


class PartSubResponse(BaseModel):
    data: List[PartSub]


class PartSubReceive(BaseModel):
    part_no: List[str]


class Position(BaseModel):
    position_id: int | None = None
    position_name: str | None = None
    position_shortname: str | None = None
    position_level: str | None = None
    position_group: str | None = None


class PositionResponse(BaseModel):
    positions: List[Position]


class Process(BaseModel):
    process_id: int | None = None
    process_name: str | None = None
    process_type: int | None = None
    line_id: int | None = None


class ProcessResponse(BaseModel):
    processes: List[Process]


class ProcessRecieve(BaseModel):
    process_name: str | None = None
    process_type: int | None = None
    line_id: int | None = None


class ProcessLine(Process, Line):
    pass


class ProcessLineResponse(BaseModel):
    data: List[ProcessLine]


class ProductLine(BaseModel):
    product_name: str | None = None
    line_id: List[int] | None = None


class ProductLineResponse(BaseModel):
    data: List[ProductLine]


class Section(BaseModel):
    section_id: int | None = None
    section_code: str | None = None
    section_name: str | None = None
    sub_section_name: str | None = None
    section_code_name: str | None = None
    department: str | None = None
    sub_department: str | None = None
    division: str | None = None
    company: str | None = None
    plant: str | None = None
    group_type: str | None = None


class SectionResponse(BaseModel):
    sections: List[Section]


class SubLine(BaseModel):
    line_code_rx: str | None = None
    part_no: str | None = None
    process: str | None = None
    rxno_part: str | None = None


class SubLineResponse(BaseModel):
    sub_lines: List[SubLine]


class Symbol(BaseModel):
    sc_symbol_id: int | None = None
    character: str | None = None
    shape: str | None = None
    remark: str | None = None


class SymbolResponse(BaseModel):
    symbols: List[Symbol]


class LineSection(Line, Section):
    section_type: str | None = None


class LineSectionResponse(BaseModel):
    data: List[LineSection]


class ProcessLineSection(Process, Line, Section):
    pass


class ProcessLineSectionResponse(BaseModel):
    data: List[ProcessLineSection]
