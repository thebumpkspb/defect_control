from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text


class SettingsCRUD:
    def __init__(self):
        pass

    async def get_calendars(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT date,
                    is_workday,
                    manufacturing_date,
                    production_date,
                    production_week,
                    manufacturing_quarter,
                    fiscal_year,
                    fiscal_month,
                    day_shift,
                    night_shift
                FROM calendar
                WHERE date IS NOT NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY date"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_group_parts(self, db: AsyncSession):
        stmt = f"""SELECT group_id,
                    group_name, 
                    group_type,
                    part_no
                FROM group_parts
                ORDER BY group_name, group_type"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_lines(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT line_id, 
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
                FROM line
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''} 
                ORDER BY section_line, line_name"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_line_sub_parts(self, app_db: AsyncSession, line_id: str):
        stmt = f"""SELECT DISTINCT ON (sub_part_no) id,
                    line_id,
                    sub_part_no,
                    sub_part_name
                FROM master_sub_part
                
                WHERE  line_id={line_id} and active='active'
                ORDER BY sub_part_no"""
        rs = await app_db.execute(text(stmt))
        return rs

    async def get_line_parts(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT DISTINCT ON (lp.pno) lp.line_id,
                    lp.pno,
                    p.part_id,
                    p.part_no_suffix,
                    p.part_name,
                    p.part_model,
                    p.part_type,
                    p.product_id
                FROM (
                    SELECT UNNEST(part_no)::TEXT AS pno, *
                    FROM line_parts
                ) AS lp
                LEFT JOIN part p ON lp.pno = p.part_no
                WHERE lp.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY lp.pno"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_line_part_process(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        stmt = f"""SELECT l.line_id,
                    l.line_name,
                    CONCAT(LEFT(l.line_fullname, 6), ' - ', l.line_name) AS line_name,
                    lpp.part_no,
                    p.process_id,
                    p.process_name
                FROM line_part_processes lpp
                LEFT JOIN line l USING (line_id)
                LEFT JOIN process p ON p.process_id = ANY(lpp.process_id)
                JOIN UNNEST (lpp.process_id) WITH ORDINALITY AS t(value, idx) ON value = p.process_id
                WHERE lpp.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY part_no, idx"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_line_part_processes(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        stmt = f"""SELECT line_id,
                    part_no,
                    process_id
                FROM line_part_processes
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY line_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def post_line_part_processes(
        self, line_id: int, part_no: str, db: AsyncSession
    ):
        stmt = f"""INSERT INTO line_part_processes (id, line_id, part_no, process_id, start_effective)
                SELECT COALESCE(MAX(id),0) + 1, {line_id}, '{part_no}', '{{}}', NOW() FROM line_part_processes
                ON CONFLICT (line_id, part_no) DO UPDATE SET end_effective = NULL"""
        await db.execute(text(stmt))
        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error when insert line part processes because {e}",
            )
        return

    async def update_line_part_processes(
        self, line_id: int, part_no: str, process: str, db: AsyncSession
    ):
        stmt = f"""UPDATE line_part_processes
                SET process_id = {process}
                WHERE line_id = {line_id} AND part_no = '{part_no}'"""
        await db.execute(text(stmt))
        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error when update line part processes because {e}",
            )
        return

    async def delete_line_part_processes_by_line_and_part(
        self, line_id: int, part_no: str, db: AsyncSession
    ):
        stmt = f"""UPDATE line_part_processes
                SET end_effective = NOW()
                WHERE line_id = {line_id} AND part_no = '{part_no}'"""
        await db.execute(text(stmt))
        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error when delete line part processes because {e}",
            )
        return

    async def get_line_sections(self, db: AsyncSession, where_stmt: str | None = None):
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
                    CONCAT(section_code, ' - ', sub_section_name) AS section_code_name,
                    department,
                    sub_department,
                    division,
                    company,
                    plant,
                    s.group_type AS section_type
                FROM line l
                -- LEFT JOIN section s USING (section_id)
                FULL JOIN section s USING (section_id)
                WHERE l.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY line_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_line_sections_2(
        self, db: AsyncSession, where_stmt: str | None = None
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
                    COALESCE(sub_section_name, section_name) AS section_name,
                    sub_section_name,
                    CONCAT(section_code, ' - ', sub_section_name) AS section_code_name,
                    COALESCE(sub_department, department) AS department,
                    sub_department,
                    division,
                    company,
                    plant,
                    s.group_type AS section_type
                FROM line l
                FULL JOIN section s USING (section_id)
                WHERE l.end_effective IS NULL 
                AND s.end_effective IS NULL
                {where_stmt if where_stmt is not None else ''}
                ORDER BY line_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_organize_level(
        self, db: AsyncSession, union_stmt: str, where_stmt: str | None = None
    ):
        stmt = f"""WITH DIVISION AS (
                    SELECT DISTINCT
                        ON (DIVISION) 'division' AS ORG_LEVEL,
                        DIVISION AS ORG_NAME,
                        NULL::INT AS LINE_ID,
                        SECTION_ID,
                        SECTION_CODE,
                        ARRAY[''] AS UPPER_LEVEL,
                        NULL AS GROUP_TYPE
                    FROM SECTION
                    WHERE
                        DIVISION IS NOT NULL
                        AND END_EFFECTIVE IS NULL
                        AND DIVISION = 'EPD'
                    ORDER BY ORG_NAME
                ),
                DEPARTMENT AS (
                    SELECT DISTINCT
                        ON (COALESCE(SUB_DEPARTMENT, DEPARTMENT)) 'department' AS ORG_LEVEL,
                        COALESCE(SUB_DEPARTMENT, DEPARTMENT) AS ORG_NAME,
                        NULL::INT AS LINE_ID,
                        SECTION_ID,
                        SECTION_CODE,
                        CASE
                        WHEN COALESCE(SUB_DEPARTMENT, DEPARTMENT) IN (
                            'Alternator Product',
                            'Manufacturing 1',
                            'Starter Product & ECC, Motor & ADAS Product'
                        ) THEN ARRAY['EPD', 'Direct', 'Assy Manu.']
                        WHEN COALESCE(SUB_DEPARTMENT, DEPARTMENT) IN (
                            'Parts Manufacturing 1 (Press, FG, DC)',
                            'Parts Manufacturing 2 (Lathing)'
                        ) THEN ARRAY['EPD', 'Direct', 'Part Manu.']
                        WHEN GROUP_TYPE = 'DIR' THEN ARRAY['EPD', 'Direct']
                        WHEN GROUP_TYPE = 'IND' THEN ARRAY['EPD', 'Indirect']
                        ELSE ARRAY['EPD']
                        END AS UPPER_LEVEL,
                        GROUP_TYPE
                    FROM SECTION
                    WHERE
                        DEPARTMENT IS NOT NULL
                        AND END_EFFECTIVE IS NULL
                        AND DIVISION = 'EPD'
                    ORDER BY ORG_NAME
                ),
                LINE AS (
                    SELECT DISTINCT 
                        ON (LINE_NAME) 'line' AS ORG_LEVEL,
                        LINE_NAME AS ORG_NAME,
                        LINE_ID,
                        SECTION_ID,
                        SECTION_CODE,
                        ARRAY[COALESCE(S.SUB_SECTION_NAME, S.SECTION_NAME)] AS UPPER_LEVEL,
                        S.GROUP_TYPE
                    FROM LINE L
                        LEFT JOIN SECTION S USING (SECTION_ID)
                    WHERE
                        L.END_EFFECTIVE IS NULL
                        AND S.END_EFFECTIVE IS NULL
                        AND DIVISION = 'EPD'
                    ORDER BY ORG_NAME
                ),
                SECTION AS (
                    SELECT DISTINCT
                        ON (
                            CONCAT(
                                SECTION_CODE,
                                ' - ',
                                COALESCE(SUB_SECTION_NAME, SECTION_NAME)
                            )
                        ) 'section' AS ORG_LEVEL,
                        CONCAT(
                            SECTION_CODE,
                            ' - ',
                            COALESCE(SUB_SECTION_NAME, SECTION_NAME)
                        ) AS ORG_NAME,
                        NULL::INT AS LINE_ID,
                        SECTION_ID,
                        SECTION_CODE,
                        ARRAY[COALESCE(SUB_DEPARTMENT, DEPARTMENT)] AS UPPER_LEVEL,
                        GROUP_TYPE
                    FROM SECTION
                    WHERE
                        COALESCE(SUB_SECTION_NAME, SECTION_NAME) IS NOT NULL
                        AND END_EFFECTIVE IS NULL
                        AND DIVISION = 'EPD'
                        AND GROUP_TYPE IN ('DIR', 'IND')
                    ORDER BY ORG_NAME
                )
            SELECT * FROM DIVISION
            {where_stmt if where_stmt is not None else ''}
            {union_stmt}
            UNION ALL
            SELECT * FROM DEPARTMENT
            {where_stmt if where_stmt is not None else ''}
            UNION ALL
            SELECT * FROM SECTION
            {where_stmt if where_stmt is not None else ''}
            UNION ALL
            SELECT * FROM LINE
            {where_stmt if where_stmt is not None else ''}"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_parts(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT part_id,
                    part_no,
                    part_no_suffix,
                    part_name,
                    part_model,
                    part_type,
                    product_id
                FROM part
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY part_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_parts_by_org(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT line_id,
                    part_no
                FROM line_parts lp
                LEFT JOIN line USING (line_id)
                LEFT JOIN section USING (section_id)
                WHERE lp.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY line_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_parts_distinct(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT DISTINCT ON (part_no) part_id,
                    part_no,
                    part_no_suffix,
                    part_name,
                    part_model,
                    part_type,
                    product_id
                FROM part
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY part_no"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_parts_substring_by_part_no(
        self, db: AsyncSession, where_stmt: str | None = None
    ):
        stmt = f"""WITH part_no_substring AS (
                    SELECT DISTINCT ON (part_no) CONCAT(SUBSTRING(part_no, 1, LENGTH(part_no) - 1)) || '*' AS part_no_substring, 
                        part_id
                    FROM part)
                SELECT part_id,
                    part_no_substring,
                    part_no,
                    part_no_suffix,
                    part_name,
                    part_model,
                    part_type,
                    product_id
                FROM part_no_substring
                LEFT JOIN part USING (part_id)
                WHERE part.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY part_no DESC"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_positions(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT position_id,
                    position_name,
                    position_shortname,
                    position_level,
                    position_group
                FROM position
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''} 
                ORDER BY position_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_processes(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT process_id,
                    process_name,
                    process_type,
                    line_id
                FROM process
                WHERE end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY process_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def post_processes(self, value: str, db: AsyncSession):
        stmt = f"""INSERT INTO process (id, process_id, process_name, line_id, start_effective)
                {value}
                ON CONFLICT (process_name, line_id) DO UPDATE SET end_effective = NULL"""
        await db.execute(text(stmt))
        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=500, detail=f"Error when insert process because {e}"
            )
        return

    async def delete_process_by_id(self, process_id: int, db: AsyncSession):
        stmt = f"""UPDATE process
                SET end_effective = NOW()
                WHERE process_id = {process_id}"""
        await db.execute(text(stmt))
        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error when delete process by id because of {e}",
            )
        return

    async def get_process_line(self, db: AsyncSession, where_stmt: str | None = None):
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
                    l.group_type,
                    section_id,
                    CONCAT(section_code, ' - ', line_name) AS section_line,
                    line_code_rx
                FROM process p
                LEFT JOIN line l USING (line_id)
                LEFT JOIN section USING (section_id)
                WHERE p.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY process_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_process_line_section(
        self, db: AsyncSession, where_stmt: str | None = None
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
                    l.group_type,
                    section_id,
                    CONCAT(section_code, ' - ', line_name) AS section_line,
                    line_code_rx,
                    section_code,
                    section_name,
                    sub_section_name,
                    CONCAT(section_code, ' - ', sub_section_name) AS section_code_name,
                    department,
                    sub_department,
                    division,
                    company,
                    plant
                FROM process p
                LEFT JOIN line l USING (line_id)
                LEFT JOIN section USING (section_id)
                WHERE p.end_effective IS NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY process_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_product_line(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT COALESCE(sub_department, department) AS product_name,
                    ARRAY_AGG(line_id) AS line_id
                FROM line l
                JOIN section s USING (section_id)
                WHERE l.end_effective IS NULL
                AND s.end_effective IS NULL
                {where_stmt if where_stmt is not None else ''}
                GROUP BY COALESCE(sub_department, department)"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_sections(self, db: AsyncSession, where_stmt: str | None = None):
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
                ORDER BY section_id"""
        rs = await db.execute(text(stmt))
        return rs

    async def get_sub_lines(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f""" SELECT  t1.RxNo AS rxno_part, t2.Code AS line_code_rx, t3.PartNo AS part_no, t1.process
                FROM tbPartLine t1 
                LEFT JOIN tbLine t2 ON t2.RxNo=t1.RxNo_Line
                LEFT JOIN tbPart t3 ON t3.RxNo=t1.RxNo_Part
                WHERE t1.ExpireDate  IS NULL {where_stmt if where_stmt is not None else ''} 
                """
        rs = db.execute(text(stmt))
        return rs

    async def get_symbols(self, db: AsyncSession, where_stmt: str | None = None):
        stmt = f"""SELECT sc_symbol_id,
                    character,
                    shape,
                    remark
                FROM sc_symbol
                WHERE sc_symbol_id IS NOT NULL {where_stmt if where_stmt is not None else ''}
                ORDER BY sc_symbol_id"""
        rs = await db.execute(text(stmt))
        return rs
