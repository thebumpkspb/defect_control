from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from typing import List, Any, Callable
from app.schemas.settings import Equipment, Part, ProcessLine, Section, LineSection
from app.crud import SearchCRUD
from app.functions import is_empty_or_none
from app.utils.logger import get_logger

logger = get_logger(__name__)


class SearchManager:
    def __init__(self):
        self.crud = SearchCRUD()

    async def _generic_search(
        self,
        search_term: str | None,
        fields: List[str] | None,
        limit: int,
        offset: int,
        order_by: str | None,
        direction: str | None,
        db: AsyncSession,
        valid_order_fields: List[str],
        valid_search_fields: List[str],
        default_order: str,
        crud_method: Callable,
        result_class: Any,
        condition: Any = None,
        condition_field: str = None,
    ) -> List[Any]:
        # ? handle ORDER BY clause
        order = self._get_order(order_by, direction, valid_order_fields, default_order)
        # ? handle WHERE clause
        where_stmt = self._get_where_statement(
            search_term, fields, valid_search_fields, condition, condition_field
        )
        # ? get data with clause above
        res = await crud_method(
            db=db, order=order, limit=limit, offset=offset, where_stmt=where_stmt
        )
        # ? format result into specific model before return
        return [
            result_class(**{k: r[r._key_to_index[k]] for k in r._key_to_index})
            for r in res
        ]

    def _get_order(
        self,
        order_by: str | None,
        direction: str | None,
        valid_fields: List[str],
        default_order: str,
    ) -> str:
        # ? check invalid column for ORDER BY clause
        if not is_empty_or_none(order_by):
            if order_by not in valid_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid fields selection",
                )
            order = f"ORDER BY {order_by}"
        else:
            order = f"ORDER BY {default_order}"
        # ? check invalid direction for ORDER BY clause
        if not is_empty_or_none(direction):
            if direction.lower() not in ["asc", "desc"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid order direction selection",
                )
            order = f"{order} {direction}"

        return order

    def _get_where_statement(
        self,
        search_term: str | None,
        fields: List[str] | None,
        valid_fields: List[str],
        condition: Any | None,
        condition_field: str | None,
    ) -> str:
        if not search_term and not condition:
            return ""
        if not search_term and condition:
            if isinstance(condition, str):
                return f"AND LOWER({condition_field}) = LOWER('{condition}')"
            else:
                return f"AND {condition_field} = {condition}"
            
        # ? add sql escape character by replacing it
        search_term = (
            search_term.replace("'", "''").replace("%", "%%").replace(":", "::")
        )
        cond = []

        # ? check invalid column for WHERE clause
        if not is_empty_or_none(fields):
            for f in fields:
                if f not in valid_fields:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid fields selection",
                    )
                cond.append(f"LOWER({f}) LIKE LOWER('%{search_term}%')")
        else:
            cond = [f"LOWER({f}) LIKE LOWER('%{search_term}%')" for f in valid_fields]

        stmt_cond = f"AND ({' OR '.join(cond)})" if cond else ""

        # ? check more condition for WHERE clause
        if condition:
            if isinstance(condition, str):
                stmt_cond += f" AND LOWER({condition_field}) = LOWER('{condition}')"
            else:
                stmt_cond += f" AND {condition_field} = {condition}"
        return stmt_cond

    async def get_search_equipments(
        self,
        equipment: str | None,
        fields: List[str] | None,
        limit: int,
        offset: int,
        order_by: str | None,
        direction: str | None,
        db: AsyncSession = None,
    ):
        valid_order_fields = [
            "equipment_id",
            "equipment_name",
            "equipment_no",
            "equipment_type",
            "equipment_maker",
            "equipment_model",
            "maint_interval",
            "last_maint",
            "line_id",
            "section_id",
            "registered_date",
        ]
        valid_search_fields = [
            "equipment_name",
            "equipment_no",
            "equipment_type",
            "equipment_maker",
            "equipment_model",
        ]
        return await self._generic_search(
            equipment,
            fields,
            limit,
            offset,
            order_by,
            direction,
            db,
            valid_order_fields,
            valid_search_fields,
            "equipment_name",
            self.crud.get_search_equipments,
            Equipment,
        )

    async def get_search_line_sections(
        self,
        line: str | None,
        fields: List[str] | None,
        limit: int,
        offset: int,
        order_by: str | None,
        direction: str | None,
        db: AsyncSession = None,
    ):
        valid_order_fields = [
            "line_id",
            "line_name",
            "line_fullname",
            "line_code",
            "work_center_code",
            "process_code",
            "line_group",
            "group_type",
            "line_code_rx",
            "section_id",
            "section_code",
            "section_name",
            "sub_section_name",
            "department",
            "sub_department",
            "division",
            "company",
            "plant",
        ]
        valid_search_fields = [
            "line_name",
            "line_fullname",
            "line_code",
            "work_center_code",
            "process_code",
            "line_code_rx",
            "section_code",
            "section_name",
            "sub_section_name",
        ]
        return await self._generic_search(
            line,
            fields,
            limit,
            offset,
            order_by,
            direction,
            db,
            valid_order_fields,
            valid_search_fields,
            "line_fullname",
            self.crud.get_search_line_sections,
            LineSection,
        )

    async def get_search_parts(
        self,
        part: str | None,
        fields: List[str] | None,
        limit: int,
        offset: int,
        order_by: str | None,
        direction: str | None,
        db: AsyncSession = None,
    ):
        valid_order_fields = [
            "part_id",
            "part_no",
            "part_no_suffix",
            "part_name",
            "part_model",
            "part_type",
            "product_id",
        ]
        valid_search_fields = [
            "part_no",
            "part_no_suffix",
            "part_name",
            "part_model",
            "part_type",
        ]
        return await self._generic_search(
            part,
            fields,
            limit,
            offset,
            order_by,
            direction,
            db,
            valid_order_fields,
            valid_search_fields,
            "part_no",
            self.crud.get_search_parts,
            Part,
        )

    async def get_search_processes(
        self,
        process: str | None,
        line_id: int | None,
        fields: List[str] | None,
        limit: int,
        offset: int,
        order_by: str | None,
        direction: str | None,
        db: AsyncSession = None,
    ):
        valid_order_fields = [
            "process_id",
            "process_name",
            "process_type",
            "line_id",
            "line_name",
            "line_fullname",
            "line_code",
            "work_center_code",
            "process_code",
            "line_group",
            "group_type",
            "line_code_rx",
            "section_code",
        ]
        valid_search_fields = ["process_name"]
        return await self._generic_search(
            process,
            fields,
            limit,
            offset,
            order_by,
            direction,
            db,
            valid_order_fields,
            valid_search_fields,
            "process_name",
            self.crud.get_search_processes,
            ProcessLine,
            line_id,
            "line_id",
        )

    async def get_search_sections(
        self,
        section: str | None,
        fields: List[str] | None,
        limit: int,
        offset: int,
        order_by: str | None,
        direction: str | None,
        db: AsyncSession = None,
    ):
        valid_order_fields = [
            "section_id",
            "section_code",
            "section_name",
            "sub_section_name",
            "department",
            "sub_department",
            "division",
            "company",
            "plant",
            "group_type",
        ]
        valid_search_fields = [
            "section_code",
            "section_name",
            "sub_section_name",
            "department",
            "sub_department",
        ]
        return await self._generic_search(
            section,
            fields,
            limit,
            offset,
            order_by,
            direction,
            db,
            valid_order_fields,
            valid_search_fields,
            "section_code",
            self.crud.get_search_sections,
            Section,
        )
