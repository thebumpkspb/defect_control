from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from sqlalchemy.sql import text
from typing import List, Dict
from dotenv import load_dotenv
import json
import requests
import datetime
import calendar
import datetime
import calendar
import psycopg2
import os

# from datetime import datetime

load_dotenv()


class Export_P_Chart_CRUD:
    def __init__(self):
        self.BACKEND_API_SERVICE = os.environ.get("BACKEND_API_SERVICE")
        self.BACKEND_URL_SERVICE = os.environ.get("BACKEND_URL_SERVICE")

    def get_line_id(self, linename: str) -> str:
        """
        Fetch the line ID corresponding to the provided line name.

        Args:
            linename (str): The name of the line to look up.

        Returns:
            str: The corresponding line ID.

        Raises:
            HTTPException: If the API call fails or the line name is not found.
        """
        endpoint = self.BACKEND_URL_SERVICE + "/api/settings/lines?rx_only=false"
        headers = {"X-API-Key": self.BACKEND_API_SERVICE}

        try:
            response = requests.get(endpoint, headers=headers)
            response.raise_for_status()  # Raise an error for bad HTTP status codes
            data = response.json()
        except requests.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"API request failed: {e}",
            )

        # Build lists of section names and corresponding line IDs
        lines = data.get("lines", [])
        list_line = [line.get("section_line") for line in lines]
        list_line_id = [line.get("line_id") for line in lines]

        if linename not in list_line:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Line name '{linename}' not found.",
            )

        # Find the index of the requested line name and return its ID
        index_select = list_line.index(linename)
        # print(list_line_id [ index_select ])
        return str(list_line_id[index_select])

    async def fetch_filtered_records(
        self, db: AsyncSession, filters: Dict
    ) -> List[Dict]:
        """
        Fetch filtered records from the `pchart_defect_record` table.
        """
        try:
            # Construct the query with filters
            query = "SELECT * FROM pchart_report WHERE 1=1"
            params = []

            if filters.get("month"):
                query += " AND month = '" + filters["month"] + "' "
            if filters.get("line_name"):
                line_id = self.get_line_id(filters["line_name"])
                query += " AND line_id = '" + str(line_id) + "' "
            if filters.get("shift"):
                query += " AND shift = '" + filters["shift"] + "' "
            if filters.get("part_no"):
                query += " AND part_no = '" + filters["part_no"] + "' "
            if filters.get("process"):
                query += " AND process = '" + filters["process"] + "' "
            if filters.get("sub_line"):
                query += " AND sub_line = '" + filters["sub_line"] + "' "
            if filters.get("updated_at_start"):
                query += " AND updated_at >= '" + filters["updated_at_start"] + "' "
            if filters.get("updated_at_end"):
                query += " AND updated_at <= '" + filters["updated_at_end"] + "' "

            rows = await db.execute(text(query))

            return rows  # records

        except Exception as e:
            raise RuntimeError(f"Database query failed: {str(e)}")

    async def fetch_filtered_graph_records(self, db: AsyncSession, filters: Dict):
        """
        Fetch a single filtered record from the `pchart_report_graph` table and return it as a dictionary.
        """
        try:
            # Construct the query with filters
            query = "SELECT * FROM pchart_report_graph WHERE 1=1"
            params = []
            if filters["shift"] == "All":
                shift = "'A','B'"
            else:
                shift = f"'{filters['shift']}'"

            if filters.get("month"):
                query += " AND month = '" + filters["month"] + "' "
            if filters.get("line_name"):
                line_id = self.get_line_id(filters["line_name"])
                query += " AND line_id = '" + str(line_id) + "' "
            if filters.get("shift"):
                # query += " AND shift = '" + filters["shift"] + "' "
                query += " AND shift in (" + shift + ") "
            if filters.get("part_no"):
                query += " AND part_no = '" + filters["part_no"] + "' "
            if filters.get("process"):
                query += " AND process = '" + filters["process"] + "' "
            if filters.get("sub_line"):
                query += " AND sub_line = '" + filters["sub_line"] + "' "
            if filters.get("updated_at_start"):
                query += " AND updated_at >= '" + filters["updated_at_start"] + "' "
            if filters.get("updated_at_end"):
                query += " AND updated_at <= '" + filters["updated_at_end"] + "' "

            # Limit the query to fetch one record
            # query += " LIMIT 1"
            rows = await db.execute(text(query))

            if rows is None:
                return {}
            return rows

        except Exception as e:
            # print(f"Error fetching data: {e}")
            raise

    async def fetch_filtered_table(self, db: AsyncSession, filters: Dict):
        """
        Fetch a single filtered record from the `pchart_report_graph` table and return it as a dictionary.
        """
        try:
            # Construct the query with filters
            query = "SELECT * FROM pchart_report_table WHERE 1=1"
            params = []
            if filters["shift"] == "All":
                shift = "'A','B'"
            else:
                shift = f"'{filters['shift']}'"

            if filters.get("month"):
                query += " AND month = '" + filters["month"] + "' "
            if filters.get("line_name"):
                line_id = self.get_line_id(filters["line_name"])
                query += " AND line_id = '" + str(line_id) + "' "
            if filters.get("shift"):
                # query += " AND shift = '" + filters["shift"] + "' "
                query += " AND shift in (" + shift + ") "
            if filters.get("part_no"):
                query += " AND part_no = '" + filters["part_no"] + "' "
            if filters.get("process"):
                query += " AND process = '" + filters["process"] + "' "
            if filters.get("sub_line"):
                query += " AND sub_line = '" + filters["sub_line"] + "' "

            if filters.get("updated_at_start"):
                query += " AND updated_at >= '" + filters["updated_at_start"] + "' "
            if filters.get("updated_at_end"):
                query += " AND updated_at <= '" + filters["updated_at_end"] + "' "

            # Limit the query to fetch one record
            # query += " LIMIT 1"
            rows = await db.execute(text(query))

            if rows is None:
                return {}

            return rows

        except Exception as e:
            # print ( f"Error fetching data: {e}" )
            raise

    async def get_defect_outline(self, db: AsyncSession, filters: Dict):
        """
        Fetch a single filtered record from the `pchart_report_graph` table and return it as a dictionary.
        """
        print("month: ", filters["month"])
        date_obj = datetime.datetime.strptime(filters["month"], "%B-%Y")

        first_day = date_obj.replace(day=1).strftime("%Y-%m-%d")
        last_day = date_obj.replace(
            day=calendar.monthrange(date_obj.year, date_obj.month)[1]
        ).strftime("%Y-%m-%d")
        line_id = self.get_line_id(filters["line_name"])
        try:
            # Construct the query with filters
            query = f"""
                        select 	
                                CASE
                                    WHEN t1.defect_type = 'Repeat NG' THEN 'Repeat NG'  
                                    ELSE t0.defect_type
                                END as master_defect_type,
		                        t0.defect_mode as master_defect_mode,
                                t1.date,
                                t1.year_month,
                                t1.week_number,
                                t1.half_month,
                                t1.line_id,
                                t1.part_no,
                                t0.part_name, 
                                t1.process,
                                t1.defect_type,
                                t1.defect_mode,
                                t1.defect_qty,
                                t1.record_by,
                                t1.updated_at,
                                MAX(t2.user_name) as review_by_tl,
                                MAX(t3.user_name) as review_by_mgr,
                                MAX(t4.user_name) as review_by_gm,
                                MAX(t1.pic) as pic
                        from 
                        (select part_name,defect_type,defect_mode,ref,master_defect_index from master_defect 
                        where line_id = {line_id} and process='{filters['process']}' and active='active'
                        ) t0
                        left join (
                            SELECT      pdr.date,
                                        date_trunc('month', pdr.date)::date AS year_month  ,
                                        EXTRACT(WEEK FROM pdr.date) - EXTRACT(WEEK FROM date_trunc('month', pdr.date))  as week_number ,
                                        CASE  
                                            WHEN EXTRACT(DAY FROM pdr.date) <= 15 THEN 1  
                                            ELSE 2  
                                        END AS half_month,
                                        pdr.line_id,
                                        pdr.part_no,
                                        pdr.process,
                                        pdr.defect_type,
                                        pdr.id_defective_items,
                                        MAX(pdr.defective_items) as defect_mode,
                                        sum(pdr.qty_shift_{filters['shift'].lower()}) as defect_qty , 
                                        MAX(pdr.creator) as record_by,
                                        MAX(pdr.updated_at) as updated_at,
                                        MAX(pdrl.pic) as pic 
                                    FROM public.pchart_defect_record pdr
                                    left join (
                                        select date,line_id,part_no,process,defect_type,id_defective_items,shift,active,max(pic) as pic  from pchart_defect_record_log
                                        group by date,line_id,part_no,process,defect_type,id_defective_items,shift,active
                                        )pdrl 
                                    on pdr.date = pdrl.date and 
                                    pdr.line_id = pdrl.line_id and 
                                    pdr.part_no = pdrl.part_no and 
                                    pdr.process = pdrl.process and 
                                    pdr.defect_type = pdrl.defect_type and 
                                    pdr.id_defective_items= pdrl.id_defective_items and active='active' 
                            where pdr.line_id={line_id} and pdr.process='{filters['process']}' and pdr.date >= '{first_day}' and pdr.date <='{last_day}'   and pdrl.shift='{filters['shift']}' and pdrl.active='active' 
                            group by pdr.line_id,pdr.date,pdr.part_no,pdr.process,pdr.defect_type,pdr.id_defective_items
                        ) t1 on t0.ref = t1. id_defective_items
                        left join approval_daily t2 using(date,line_id)
                        left join approval_weekly t3 using(week_number,year_month,line_id)
                        left join approval_bi_weekly t4 using(half_month,year_month,line_id)
                        --where t2.date >= {first_day} and t2.date <={last_day} and 
                        --t3.date >= {first_day} and t3.date <={last_day} and
                        --t4.date >= {first_day} and t4.date <={last_day} 
                        group by t1.date,
                                t1.year_month,
                                t1.week_number,
                                t1.half_month,
                                t1.line_id,
                                t1.part_no,
                                t0.part_name,
                                t1.process,
                                t1.defect_type,
                                t1.defect_mode,
                                t1.id_defective_items,
                                t0.defect_type,
		                        t0.defect_mode,
                                t1.defect_qty,
                                t1.record_by,
                                t1.updated_at
                        order by t0.defect_type,t0.defect_mode
                """
            # params = []
            # if filters["shift"] == "All":
            #     shift = "'A','B'"
            # else:
            #     shift = f"'{filters['shift']}'"

            # if filters.get("month"):
            #     query += " AND month = '" + filters["month"] + "' "
            # if filters.get("line_name"):
            #     line_id = self.get_line_id(filters["line_name"])
            #     query += " AND line_id = '" + str(line_id) + "' "
            # if filters.get("shift"):
            #     # query += " AND shift = '" + filters["shift"] + "' "
            #     query += " AND shift in (" + shift + ") "
            # if filters.get("part_no"):
            #     query += " AND part_no = '" + filters["part_no"] + "' "
            # if filters.get("process"):
            #     query += " AND process = '" + filters["process"] + "' "
            # if filters.get("sub_line"):
            #     query += " AND sub_line = '" + filters["sub_line"] + "' "

            # if filters.get("updated_at_start"):
            #     query += " AND updated_at >= '" + filters["updated_at_start"] + "' "
            # if filters.get("updated_at_end"):
            #     query += " AND updated_at <= '" + filters["updated_at_end"] + "' "

            # Limit the query to fetch one record
            # query += " LIMIT 1"
            rows = await db.execute(text(query))
            # result = rows.mappings().all()
            result = [
                {k: str(v) for k, v in row.items()} for row in rows.mappings().all()
            ]
            # rows_dicts = [dict(row._mapping) for row in result]
            # Option 1: Return as JSON string

            if rows is None:
                return {}
            return result
            # return rows

        except Exception as e:
            # print ( f"Error fetching data: {e}" )
            raise

    async def fetch_filtered_abnormal(self, db: AsyncSession, filters: Dict):
        """
        Fetch a single filtered record from the `pchart_report_graph` table and return it as a dictionary.
        """
        try:
            # Construct the query with filters
            if filters["shift"] == "All":
                shift = "'A','B'"
            else:
                shift = f"'{filters['shift']}'"
            query = "SELECT * FROM abnormal_occurrence WHERE 1=1"
            params = []

            # Convert "month" filter (e.g., "November-2024") to a date range filter on the `date` column.
            if filters.get("month"):
                try:
                    # Parse the month filter (e.g., "November-2024")
                    dt = datetime.datetime.strptime(filters["month"], "%B-%Y")
                    # First day of the month
                    first_day = dt.replace(day=1).date()
                    # Last day of the month
                    last_day = dt.replace(
                        day=calendar.monthrange(dt.year, dt.month)[1]
                    ).date()
                    query += (
                        " AND date >= '"
                        + str(first_day)
                        + "' AND date <= '"
                        + str(last_day)
                        + "' "
                    )

                except ValueError:
                    raise ValueError(
                        "Invalid month format, expected format: 'MonthName-Year' (e.g., 'November-2024')"
                    )

            if filters.get("line_name"):
                line_id = self.get_line_id(filters["line_name"])
                query += " AND line_id = '" + str(line_id) + "' "
            if filters.get("shift"):
                query += " AND shift in (" + shift + ") "
            if filters.get("part_no"):
                query += " AND part_no = '" + filters["part_no"] + "' "
            if filters.get("process"):
                query += " AND process = '" + filters["process"] + "' "
            if filters.get("sub_line"):
                query += " AND sub_line = '" + filters["sub_line"] + "' "
            if filters.get("updated_at_start"):
                query += " AND updated_at >= '" + filters["updated_at_start"] + "' "
            if filters.get("updated_at_end"):
                query += " AND updated_at <= '" + filters["updated_at_end"] + "' "

            query += " AND status = 'action'"
            # Append ORDER BY clause to sort by the date column (datetime)
            query += " ORDER BY date ASC"
            rows = await db.execute(text(query))

            return rows

        except Exception as e:
            raise RuntimeError(f"Database query failed: {str(e)}")

    async def fetch_filtered_master_target_line(
        self, db: AsyncSession, filters: Dict
    ) -> List[Dict]:
        """
        Fetch filtered records from the `pchart_defect_record` table.
        """
        try:
            # Construct the query with filters
            query = "SELECT * FROM master_target_line WHERE 1=1"
            params = []

            if filters.get("month"):
                query += " AND month_year = '" + filters["month"] + "' "
            if filters.get("line_name"):
                line_id = self.get_line_id(filters["line_name"])
                query += " AND line_id = '" + str(line_id) + "' "
            if filters.get("part_no"):
                query += " AND part_no = '" + filters["part_no"] + "' "
            if filters.get("process"):
                query += " AND process = '" + filters["process"] + "' "
            if filters.get("sub_line"):
                query += " AND sub_line = '" + filters["sub_line"] + "' "

            rows = await db.execute(text(query))

            return rows

        except Exception as e:
            raise RuntimeError(f"Database query failed: {str(e)}")
