from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text


class SearchCRUD:
    def __init__(self):
        pass

    async def get_search_equipments(
        self,
        db: AsyncSession,
        order: str,
        limit: int,
        offset: int,
        where_stmt: str | None = None,
    ):
        stmt = f"""SELECT equipment_id,
                    equipment_name,
                    equipment_no,
                    equipment_type,
                    equipment_maker,
                    equipment_model,
                    maint_interval,
                    last_maint,
                    line_id,
                    section_id,
                    registered_date
                FROM equipment
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                {order}
                LIMIT {limit} OFFSET {offset}"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_search_line_sections(
        self,
        db: AsyncSession,
        order: str,
        limit: int,
        offset: int,
        where_stmt: str | None = None,
    ):
        stmt = f"""SELECT line_id,
                    line_name,
                    line_fullname,
                    line_code,
                    work_center_code,
                    process_code,
                    line_group,
                    l.group_type,
                    CONCAT(section_code, ' - ', line_name) AS section_line,
                    line_code_rx,
                    section_id,
                    section_code,
                    section_name,
                    sub_section_name,
                    department,
                    sub_department,
                    division,
                    company,
                    plant
                FROM line l
                LEFT JOIN section USING (section_id)
                WHERE l.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                {order}
                LIMIT {limit} OFFSET {offset}"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_search_parts(
        self,
        db: AsyncSession,
        order: str,
        limit: int,
        offset: int,
        where_stmt: str | None = None,
    ):
        stmt = f"""SELECT part_id,
                    part_no,
                    part_no_suffix,
                    part_name,
                    part_model,
                    part_type,
                    product_id
                FROM part
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                {order}
                LIMIT {limit} OFFSET {offset}"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_search_processes(
        self,
        db: AsyncSession,
        order: str,
        limit: int,
        offset: int,
        where_stmt: str | None = None,
    ):
        stmt = f"""SELECT process_id,
                    process_name,
                    process_type,
                    line_id,
                    line_name,
                    line_fullname,
                    line_code,
                    work_center_code,
                    process_code,
                    line_group,
                    group_type,
                    section_id,
                    CONCAT(LEFT(line_fullname, 6), ' - ', line_name) AS section_line,
                    line_code_rx
                FROM process p
                LEFT JOIN line USING (line_id)
                WHERE p.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                {order}
                LIMIT {limit} OFFSET {offset}"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_search_sections(
        self,
        db: AsyncSession,
        order: str,
        limit: int,
        offset: int,
        where_stmt: str | None = None,
    ):
        stmt = f"""SELECT section_id,
                    section_code,
                    section_name,
                    sub_section_name,
                    CONCAT(section_code, ' - ', sub_section_name) AS section_code_name,
                    department,
                    sub_department,
                    division,
                    company,
                    plant,
                    group_type
                FROM section
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                {order}
                LIMIT {limit} OFFSET {offset}"""
        rs = await db.execute(text(stmt))
        return rs
